// FILE: TerminalIdentityIcon.tsx
// Purpose: Renders a terminal/provider icon without extra activity chrome.
// Layer: Terminal presentation primitive
// Depends on: shared terminal icon keys plus local provider/icon components.

import {
  type TerminalCliKind,
  type TerminalIconKey,
  terminalIconKeyForCliKind,
} from "@t3tools/shared/terminalThreads";

import { TerminalSquare } from "~/lib/icons";
import { cn } from "~/lib/utils";

import { ClaudeAI, Grok, OpenAI } from "../Icons";

interface TerminalIdentityIconProps {
  iconKey: TerminalIconKey;
  className?: string;
}

export function ThreadCliIdentityIcon({
  cliKind,
  className,
}: {
  cliKind: TerminalCliKind | null;
  className?: string;
}) {
  return (
    <TerminalIdentityIcon
      className={className ?? "size-3.5"}
      iconKey={terminalIconKeyForCliKind(cliKind)}
    />
  );
}

// Keep provider branding reusable across every terminal surface.
export default function TerminalIdentityIcon({ iconKey, className }: TerminalIdentityIconProps) {
  const IconComponent =
    iconKey === "openai"
      ? OpenAI
      : iconKey === "claude"
        ? ClaudeAI
        : iconKey === "grok"
          ? Grok
          : TerminalSquare;

  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", className)}>
      <IconComponent
        className={cn(
          "size-full",
          iconKey === "claude" || iconKey === "grok"
            ? "text-foreground"
            : iconKey === "openai"
              ? "text-foreground/80"
              : "",
        )}
      />
    </span>
  );
}
