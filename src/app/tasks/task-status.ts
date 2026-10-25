import type { TaskStatus } from "@/lib/tasks";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

export const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "done"];

export const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  done:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
