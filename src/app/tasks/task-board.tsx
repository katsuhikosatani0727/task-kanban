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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

        <Card className="mb-8">
          <form onSubmit={handleAddSubmit}>
            <CardHeader>
              <CardTitle>新しいタスク</CardTitle>
              <CardDescription>
                タイトルと説明を入力して追加します
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-task-title">タイトル</Label>
                <Input
                  id="new-task-title"
                  placeholder="例: 牛乳を買う"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-task-description">説明</Label>
                <Textarea
                  id="new-task-description"
                  placeholder="詳細があれば入力してください(任意)"
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                />
              </div>
              {addError && (
                <Alert variant="destructive">
                  <AlertDescription>{addError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isAdding}>
                追加
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isLoading && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            読み込み中...
          </p>
        )}
        {fetchError && (
          <Alert variant="destructive">
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !fetchError && tasks.length === 0 && (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            タスクはまだありません
          </p>
        )}

        {!isLoading && !fetchError && tasks.length > 0 && (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id}>
                <Card>
                  {editingTaskId === task.id ? (
                    <form
                      onSubmit={(event) => handleEditSubmit(event, task.id)}
                    >
                      <CardHeader>
                        <CardTitle>タスクを編集</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`edit-title-${task.id}`}>
                            編集: タイトル
                          </Label>
                          <Input
                            id={`edit-title-${task.id}`}
                            value={editTitle}
                            onChange={(event) =>
                              setEditTitle(event.target.value)
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`edit-description-${task.id}`}>
                            編集: 説明
                          </Label>
                          <Textarea
                            id={`edit-description-${task.id}`}
                            value={editDescription}
                            onChange={(event) =>
                              setEditDescription(event.target.value)
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor={`edit-status-${task.id}`}>
                            編集: ステータス
                          </Label>
                          <Select
                            value={editStatus}
                            onValueChange={(value) =>
                              setEditStatus(value as TaskStatus)
                            }
                          >
                            <SelectTrigger
                              id={`edit-status-${task.id}`}
                              className="w-full"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {updateError && (
                          <Alert variant="destructive">
                            <AlertDescription>{updateError}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button type="submit" disabled={isUpdating}>
                          更新
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          キャンセル
                        </Button>
                      </CardFooter>
                    </form>
                  ) : (
                    <>
                      <CardHeader>
                        <CardTitle>{task.title}</CardTitle>
                        {task.description && (
                          <CardDescription>
                            {task.description}
                          </CardDescription>
                        )}
                        <CardAction>
                          <Badge
                            variant="outline"
                            className={`border-transparent ${STATUS_BADGE_CLASSES[task.status]}`}
                          >
                            {STATUS_LABELS[task.status]}
                          </Badge>
                        </CardAction>
                      </CardHeader>

                      {(confirmingDeleteId === task.id || deleteError) && (
                        <CardContent className="flex flex-col gap-3">
                          {confirmingDeleteId === task.id && (
                            <Alert variant="destructive">
                              <AlertTitle>本当に削除しますか？</AlertTitle>
                            </Alert>
                          )}
                          {deleteError && (
                            <Alert variant="destructive">
                              <AlertDescription>
                                {deleteError}
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      )}

                      <CardFooter className="gap-2">
                        {confirmingDeleteId === task.id ? (
                          <>
                            <Button
                              type="button"
                              variant="destructive"
                              disabled={isDeleting}
                              onClick={() => confirmDelete(task.id)}
                            >
                              削除する
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={cancelDelete}
                            >
                              キャンセル
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => startEditing(task)}
                            >
                              編集
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => requestDelete(task.id)}
                            >
                              削除
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
