import { execFile } from "node:child_process";
import { release } from "node:os";

import { shell } from "electron";

export function isRunningOnWSL(
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
  kernelRelease: string = release(),
): boolean {
  return (
    platform === "linux" &&
    Boolean(env.WSL_DISTRO_NAME || env.WSL_INTEROP || /microsoft|wsl/i.test(kernelRelease))
  );
}

/** Use the Windows URL association when Electron runs under WSLg. */
export async function openExternal(url: string): Promise<void> {
  if (!isRunningOnWSL()) {
    await shell.openExternal(url);
    return;
  }

  // A quoted literal preserves URL punctuation. Encoding avoids WSL/Windows
  // command-line quoting differences; no shell interprets the URL as code.
  const script = `Start-Process -FilePath '${url.replaceAll("'", "''")}' -ErrorAction Stop`;
  const encodedCommand = Buffer.from(script, "utf16le").toString("base64");
  await new Promise<void>((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-EncodedCommand", encodedCommand],
      { timeout: 15_000, windowsHide: true },
      (error) => {
        if (error) reject(error);
        else resolve();
      },
    );
  });
}
