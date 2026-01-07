"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  state: "partial-call" | "call" | "result";
  args?: Record<string, unknown>;
  result?: unknown;
}

interface ToolCallDisplayProps {
  toolInvocation: ToolInvocation;
}

export interface ToolCallMessage {
  action: string;
  inProgressAction: string;
  path: string;
}

export function getToolCallMessage(toolInvocation: ToolInvocation): ToolCallMessage {
  const { toolName, args } = toolInvocation;

  // Handle args that might be a JSON string or already parsed
  let parsedArgs = args;
  if (typeof args === "string") {
    try {
      parsedArgs = JSON.parse(args);
    } catch {
      parsedArgs = {};
    }
  }

  const { command, path, new_path } = (parsedArgs || {}) as {
    command?: string;
    path?: string;
    new_path?: string;
  };

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return {
          action: "Created",
          inProgressAction: "Creating",
          path: path || "file",
        };
      case "str_replace":
        return {
          action: "Edited",
          inProgressAction: "Editing",
          path: path || "file",
        };
      case "insert":
        return {
          action: "Inserted into",
          inProgressAction: "Inserting into",
          path: path || "file",
        };
      case "view":
        return {
          action: "Viewed",
          inProgressAction: "Viewing",
          path: path || "file",
        };
      default:
        return {
          action: "Modified",
          inProgressAction: "Modifying",
          path: path || "file",
        };
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "delete":
        return {
          action: "Deleted",
          inProgressAction: "Deleting",
          path: path || "file",
        };
      case "rename":
        return {
          action: "Renamed",
          inProgressAction: "Renaming",
          path: path && new_path ? `${path} → ${new_path}` : path || "file",
        };
      default:
        return {
          action: "Modified",
          inProgressAction: "Modifying",
          path: path || "file",
        };
    }
  }

  return {
    action: "Ran",
    inProgressAction: "Running",
    path: toolName,
  };
}

export function ToolCallDisplay({ toolInvocation }: ToolCallDisplayProps) {
  const { state } = toolInvocation;
  const isComplete = state === "result";
  const { action, inProgressAction, path } = getToolCallMessage(toolInvocation);

  const displayAction = isComplete ? action : inProgressAction;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">
        {displayAction} <span className="font-mono text-neutral-600">{path}</span>
      </span>
    </div>
  );
}
