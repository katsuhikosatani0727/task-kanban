"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type Task,
  type TaskStatus,
} from "@/lib/tasks";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

const STATUS_OPTIONS: TaskStatus[] = ["todo", "in_progress", "done"];

const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  in_progress:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  done:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const FIELD_CLASSES =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-inner transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const LABEL_CLASSES =
  "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const PRIMARY_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400";

const SECONDARY_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900";

const DANGER_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30";

const DANGER_SOLID_BUTTON_CLASSES =
  "inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";

const ERROR_TEXT_CLASSES =
  "mt-2 text-sm font-medium text-red-600 dark:text-red-400";

const CARD_CLASSES =
  "rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchTasks()
      .then((data) => {
        if (isMounted) {
          setTasks(data);
          setFetchError(null);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setFetchError(toErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTitle.trim();
    if (!title) {
      setAddError("タイトルを入力してください");
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      const description = newDescription.trim();
      const created = await createTask({
        title,
        description: description === "" ? null : description,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
      setNewDescription("");
    } catch (error) {
      setAddError(toErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  }

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatus(task.status);
    setUpdateError(null);
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setUpdateError(null);
  }

  async function handleEditSubmit(
    event: FormEvent<HTMLFormElement>,
    id: string
  ) {
    event.preventDefault();

    const title = editTitle.trim();
    if (!title) {
      setUpdateError("タイトルを入力してください");
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const description = editDescription.trim();
      const updated = await updateTask(id, {
        title,
        description: description === "" ? null : description,
        status: editStatus,
      });
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updated : task))
      );
      setEditingTaskId(null);
    } catch (error) {
      setUpdateError(toErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  }

  function requestDelete(id: string) {
    setConfirmingDeleteId(id);
    setDeleteError(null);
  }

  function cancelDelete() {
    setConfirmingDeleteId(null);
    setDeleteError(null);
  }

  async function confirmDelete(id: string) {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setConfirmingDeleteId(null);
    } catch (error) {
      setDeleteError(toErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 justify-center bg-gradient-to-b from-zinc-100 to-zinc-200 px-4 py-12 sm:px-8 dark:from-black dark:to-zinc-900">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-amber-500" />
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            タスク管理
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            タスクの追加・編集・削除をその場で反映します
          </p>
        </div>

        <form onSubmit={handleAddSubmit} className={`${CARD_CLASSES} mb-8`}>
          <div>
            <label htmlFor="new-task-title" className={LABEL_CLASSES}>
              タイトル
            </label>
            <input
              id="new-task-title"
              className={FIELD_CLASSES}
              placeholder="例: 牛乳を買う"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="new-task-description" className={LABEL_CLASSES}>
              説明
            </label>
            <textarea
              id="new-task-description"
              className={`${FIELD_CLASSES} min-h-20`}
              placeholder="詳細があれば入力してください(任意)"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
            />
          </div>
          {addError && <p role="alert" className={ERROR_TEXT_CLASSES}>{addError}</p>}
          <button
            type="submit"
            disabled={isAdding}
            className={`${PRIMARY_BUTTON_CLASSES} mt-4`}
          >
            追加
          </button>
        </form>

        {isLoading && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            読み込み中...
          </p>
        )}
        {fetchError && (
          <p role="alert" className={`${ERROR_TEXT_CLASSES} text-center`}>
            {fetchError}
          </p>
        )}

        {!isLoading && !fetchError && tasks.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            タスクはまだありません
          </p>
        )}

        {!isLoading && !fetchError && tasks.length > 0 && (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className={CARD_CLASSES}>
                {editingTaskId === task.id ? (
                  <form onSubmit={(event) => handleEditSubmit(event, task.id)}>
                    <div>
                      <label
                        htmlFor={`edit-title-${task.id}`}
                        className={LABEL_CLASSES}
                      >
                        編集: タイトル
                      </label>
                      <input
                        id={`edit-title-${task.id}`}
                        className={FIELD_CLASSES}
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <label
                        htmlFor={`edit-description-${task.id}`}
                        className={LABEL_CLASSES}
                      >
                        編集: 説明
                      </label>
                      <textarea
                        id={`edit-description-${task.id}`}
                        className={`${FIELD_CLASSES} min-h-20`}
                        value={editDescription}
                        onChange={(event) =>
                          setEditDescription(event.target.value)
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <label
                        htmlFor={`edit-status-${task.id}`}
                        className={LABEL_CLASSES}
                      >
                        編集: ステータス
                      </label>
                      <select
                        id={`edit-status-${task.id}`}
                        className={FIELD_CLASSES}
                        value={editStatus}
                        onChange={(event) =>
                          setEditStatus(event.target.value as TaskStatus)
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                    {updateError && (
                      <p role="alert" className={ERROR_TEXT_CLASSES}>
                        {updateError}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className={PRIMARY_BUTTON_CLASSES}
                      >
                        更新
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className={SECONDARY_BUTTON_CLASSES}
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[task.status]}`}
                      >
                        {STATUS_LABELS[task.status]}
                      </span>
                    </div>

                    {confirmingDeleteId === task.id ? (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">
                          本当に削除しますか？
                        </p>
                        {deleteError && (
                          <p role="alert" className={ERROR_TEXT_CLASSES}>
                            {deleteError}
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => confirmDelete(task.id)}
                            className={DANGER_SOLID_BUTTON_CLASSES}
                          >
                            削除する
                          </button>
                          <button
                            type="button"
                            onClick={cancelDelete}
                            className={SECONDARY_BUTTON_CLASSES}
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(task)}
                          className={SECONDARY_BUTTON_CLASSES}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDelete(task.id)}
                          className={DANGER_BUTTON_CLASSES}
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
