import { createFileRoute } from "@tanstack/react-router";
import { CommandView } from "~/components/CommandView";

export const Route = createFileRoute("/_chat/command")({ component: CommandView });
