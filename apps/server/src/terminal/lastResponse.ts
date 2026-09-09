import { open, stat } from "node:fs/promises";

export interface SavedResponse { text: string; at: string | null; truncated: boolean }
const MAX_RESPONSE_LENGTH = 12_000;
const MAX_READ_BYTES = 2 * 1024 * 1024;

export function parseLastResponse(content: string, kind: string): SavedResponse | null {
  const lines = content.slice(0, content.lastIndexOf("\n") + 1).split("\n");
  for (let index = lines.length - 1; index >= 0; index--) {
    try {
      const record = JSON.parse(lines[index]!);
      const message = kind === "codex"
        ? (record.type === "response_item" ? record.payload : null)
        : kind === "grok" ? record : record.message;
      if (!message || (message.role ?? message.type) !== "assistant") continue;
      const text = typeof message.content === "string" ? message.content :
        Array.isArray(message.content) ? message.content
          .filter((part: { type?: string; text?: unknown }) =>
            (part?.type === "text" || part?.type === "output_text") && typeof part.text === "string")
          .map((part: { text: string }) => part.text).join("\n\n") : "";
      if (!text.trim()) continue;
      return {
        text: text.trim().slice(0, MAX_RESPONSE_LENGTH),
        at: typeof record.timestamp === "string" && Number.isFinite(Date.parse(record.timestamp))
          ? record.timestamp : null,
        truncated: text.trim().length > MAX_RESPONSE_LENGTH,
      };
    } catch { /* Partial or malformed records do not hide earlier responses. */ }
  }
  return null;
}

export class LastResponseReader {
  private cache = new Map<string, { version: string; inode: number; size: number; response: SavedResponse | null }>();

  async read(file: string, kind: string): Promise<SavedResponse | null> {
    try {
      const info = await stat(file);
      const version = `${info.ino}:${info.size}:${info.mtimeMs}`;
      const key = `${kind}:${file}`;
      const cached = this.cache.get(key);
      if (cached?.version === version) return cached.response;
      const handle = await open(file, "r");
      let response: SavedResponse | null;
      try {
        const start = Math.max(0, info.size - MAX_READ_BYTES);
        const buffer = Buffer.alloc(Math.min(info.size, MAX_READ_BYTES));
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, start);
        let text = buffer.subarray(0, bytesRead).toString("utf8");
        if (start > 0) text = text.slice(text.indexOf("\n") + 1);
        response = parseLastResponse(text, kind);
      } finally { await handle.close(); }
      // Keep the last known response if tool output has pushed it out of the tail.
      if (!response && cached && info.ino === cached.inode && info.size > cached.size) response = cached.response;
      if (this.cache.size >= 200) this.cache.delete(this.cache.keys().next().value!);
      this.cache.set(key, { version, inode: info.ino, size: info.size, response });
      return response;
    } catch { return null; }
  }
}
