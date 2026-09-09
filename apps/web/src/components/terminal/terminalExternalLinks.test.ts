import { describe, expect, it, vi } from "vitest";

import { createTerminalExternalLinkHandler } from "./terminalExternalLinks";

describe("terminal external links", () => {
  it("opens terminal hyperlinks directly through the application", () => {
    const open = vi.fn().mockResolvedValue(undefined);
    const handler = createTerminalExternalLinkHandler(open, vi.fn());
    handler.activate({ button: 0 } as MouseEvent, "https://openai.com");
    expect(open).toHaveBeenCalledWith("https://openai.com");
  });

  it("rejects non-web URLs", () => {
    const open = vi.fn();
    const handler = createTerminalExternalLinkHandler(open, vi.fn());
    for (const url of ["javascript:alert(1)", "file:///tmp/test", "invalid"]) {
      handler.activate({ button: 0 } as MouseEvent, url);
    }
    expect(open).not.toHaveBeenCalled();
  });

  it("reports launch errors in the terminal", async () => {
    const report = vi.fn();
    const handler = createTerminalExternalLinkHandler(
      vi.fn().mockRejectedValue(new Error("Unable to open link")),
      report,
    );
    handler.activate({ button: 0 } as MouseEvent, "https://openai.com");
    await Promise.resolve();
    expect(report).toHaveBeenCalledWith("Unable to open link");
  });
});
