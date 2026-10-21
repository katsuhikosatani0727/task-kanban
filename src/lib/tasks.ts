import { supabase } from "@/lib/supabase";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewTaskInput {
  title: string;
  description?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
}

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const TASKS_TABLE = "tasks";

function isTaskStatus(value: string): value is TaskStatus {
  return value === "todo" || value === "in_progress" || value === "done";
}

function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: isTaskStatus(row.status) ? row.status : "todo",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`タスク一覧の取得に失敗しました: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as TaskRow[];
  return rows.map(mapRowToTask);
}

export async function createTask(input: NewTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .insert({
      title: input.title,
      description: input.description ?? null,
      status: "todo",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`タスクの作成に失敗しました: ${error.message}`);
  }

  return mapRowToTask(data as unknown as TaskRow);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) {
    payload.title = input.title;
  }
  if (input.description !== undefined) {
    payload.description = input.description;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }

  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`タスクの更新に失敗しました: ${error.message}`);
  }

  return mapRowToTask(data as unknown as TaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from(TASKS_TABLE).delete().eq("id", id);

  if (error) {
    throw new Error(`タスクの削除に失敗しました: ${error.message}`);
  }
}
