import { useEffect, useState, type FormEvent } from "react";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type Task,
  type TaskStatus,
} from "@/lib/tasks";
import { toErrorMessage } from "./task-status";

export function useTaskBoard() {
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

  return {
    tasks,
    isLoading,
    fetchError,

    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    isAdding,
    addError,
    handleAddSubmit,

    editingTaskId,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editStatus,
    setEditStatus,
    isUpdating,
    updateError,
    startEditing,
    cancelEditing,
    handleEditSubmit,

    confirmingDeleteId,
    isDeleting,
    deleteError,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
