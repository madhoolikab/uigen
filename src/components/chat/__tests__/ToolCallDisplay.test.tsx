import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, getToolCallMessage } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

describe("getToolCallMessage", () => {
  describe("str_replace_editor tool", () => {
    it("returns correct message for create command", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/App.jsx" },
      });

      expect(result.action).toBe("Created");
      expect(result.inProgressAction).toBe("Creating");
      expect(result.path).toBe("/App.jsx");
    });

    it("returns correct message for str_replace command", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/components/Button.jsx" },
      });

      expect(result.action).toBe("Edited");
      expect(result.inProgressAction).toBe("Editing");
      expect(result.path).toBe("/components/Button.jsx");
    });

    it("returns correct message for insert command", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "insert", path: "/index.jsx" },
      });

      expect(result.action).toBe("Inserted into");
      expect(result.inProgressAction).toBe("Inserting into");
      expect(result.path).toBe("/index.jsx");
    });

    it("returns correct message for view command", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "view", path: "/styles.css" },
      });

      expect(result.action).toBe("Viewed");
      expect(result.inProgressAction).toBe("Viewing");
      expect(result.path).toBe("/styles.css");
    });

    it("returns default message for unknown command", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "unknown", path: "/file.js" },
      });

      expect(result.action).toBe("Modified");
      expect(result.inProgressAction).toBe("Modifying");
      expect(result.path).toBe("/file.js");
    });
  });

  describe("file_manager tool", () => {
    it("returns correct message for delete command", () => {
      const result = getToolCallMessage({
        toolName: "file_manager",
        state: "result",
        args: { command: "delete", path: "/old-file.jsx" },
      });

      expect(result.action).toBe("Deleted");
      expect(result.inProgressAction).toBe("Deleting");
      expect(result.path).toBe("/old-file.jsx");
    });

    it("returns correct message for rename command", () => {
      const result = getToolCallMessage({
        toolName: "file_manager",
        state: "result",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
      });

      expect(result.action).toBe("Renamed");
      expect(result.inProgressAction).toBe("Renaming");
      expect(result.path).toBe("/old.jsx → /new.jsx");
    });

    it("handles rename with missing new_path", () => {
      const result = getToolCallMessage({
        toolName: "file_manager",
        state: "result",
        args: { command: "rename", path: "/old.jsx" },
      });

      expect(result.path).toBe("/old.jsx");
    });
  });

  describe("edge cases", () => {
    it("handles missing args", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: undefined,
      });

      expect(result.action).toBe("Modified");
      expect(result.path).toBe("file");
    });

    it("handles missing path in args", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create" },
      });

      expect(result.path).toBe("file");
    });

    it("handles unknown tool name", () => {
      const result = getToolCallMessage({
        toolName: "unknown_tool",
        state: "result",
        args: {},
      });

      expect(result.action).toBe("Ran");
      expect(result.inProgressAction).toBe("Running");
      expect(result.path).toBe("unknown_tool");
    });

    it("handles JSON string args", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: JSON.stringify({ command: "create", path: "/App.jsx" }) as any,
      });

      expect(result.action).toBe("Created");
      expect(result.path).toBe("/App.jsx");
    });

    it("handles invalid JSON string args", () => {
      const result = getToolCallMessage({
        toolName: "str_replace_editor",
        state: "result",
        args: "invalid json" as any,
      });

      expect(result.action).toBe("Modified");
      expect(result.path).toBe("file");
    });
  });
});

describe("ToolCallDisplay", () => {
  it("renders loading state with spinner", () => {
    render(
      <ToolCallDisplay
        toolInvocation={{
          toolName: "str_replace_editor",
          state: "call",
          args: { command: "create", path: "/App.jsx" },
        }}
      />
    );

    expect(screen.getByText(/Creating/)).toBeDefined();
    expect(screen.getByText("/App.jsx")).toBeDefined();
  });

  it("renders completed state with green indicator", () => {
    render(
      <ToolCallDisplay
        toolInvocation={{
          toolName: "str_replace_editor",
          state: "result",
          args: { command: "create", path: "/App.jsx" },
        }}
      />
    );

    expect(screen.getByText(/Created/)).toBeDefined();
    expect(screen.getByText("/App.jsx")).toBeDefined();
  });

  it("renders partial-call state as in progress", () => {
    render(
      <ToolCallDisplay
        toolInvocation={{
          toolName: "str_replace_editor",
          state: "partial-call",
          args: { command: "str_replace", path: "/Button.jsx" },
        }}
      />
    );

    expect(screen.getByText(/Editing/)).toBeDefined();
  });

  it("renders file_manager delete correctly", () => {
    render(
      <ToolCallDisplay
        toolInvocation={{
          toolName: "file_manager",
          state: "result",
          args: { command: "delete", path: "/old.jsx" },
        }}
      />
    );

    expect(screen.getByText(/Deleted/)).toBeDefined();
    expect(screen.getByText("/old.jsx")).toBeDefined();
  });

  it("renders file_manager rename with arrow notation", () => {
    render(
      <ToolCallDisplay
        toolInvocation={{
          toolName: "file_manager",
          state: "result",
          args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        }}
      />
    );

    expect(screen.getByText(/Renamed/)).toBeDefined();
    expect(screen.getByText("/old.jsx → /new.jsx")).toBeDefined();
  });
});
