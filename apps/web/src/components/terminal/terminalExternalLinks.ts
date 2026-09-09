import type { ILinkHandler } from "@xterm/xterm";

/** Route OSC 8 and detected web links through the same application opener. */
export function createTerminalExternalLinkHandler(
  open: (url: string) => Promise<void>,
  reportError: (message: string) => void,
) {
  return {
    allowNonHttpProtocols: false,
    activate: (_event: MouseEvent, text: string) => {
      let url: URL;
      try {
        url = new URL(text);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      void open(text).catch((error: unknown) => {
        reportError(error instanceof Error ? error.message : "Unable to open link");
      });
    },
  } satisfies ILinkHandler;
}
