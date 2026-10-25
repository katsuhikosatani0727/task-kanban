import type { FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Task, TaskStatus } from "@/lib/tasks";
import TaskCard from "./task-card";

interface TaskListProps {
  isLoading: boolean;
  fetchError: string | null;
  tasks: Task[];
  editingTaskId: string | null;
  editTitle: string;
  editDescription: string;
  editStatus: TaskStatus;
  isUpdating: boolean;
  updateError: string | null;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEditStatusChange: (value: TaskStatus) => void;
  onEditSubmit: (event: FormEvent<HTMLFormElement>, id: string) => void;
  onStartEditing: (task: Task) => void;
  onCancelEditing: () => void;
  confirmingDeleteId: string | null;
  isDeleting: boolean;
  deleteError: string | null;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
}

export default function TaskList({
  isLoading,
  fetchError,
  tasks,
  editingTaskId,
  editTitle,
  editDescription,
  editStatus,
  isUpdating,
  updateError,
  onEditTitleChange,
  onEditDescriptionChange,
  onEditStatusChange,
  onEditSubmit,
  onStartEditing,
  onCancelEditing,
  confirmingDeleteId,
  isDeleting,
  deleteError,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: TaskListProps) {
  return (
    <>
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
              <TaskCard
                task={task}
                isEditing={editingTaskId === task.id}
                editTitle={editTitle}
                editDescription={editDescription}
                editStatus={editStatus}
                isUpdating={isUpdating}
                updateError={updateError}
                onEditTitleChange={onEditTitleChange}
                onEditDescriptionChange={onEditDescriptionChange}
                onEditStatusChange={onEditStatusChange}
                onEditSubmit={(event) => onEditSubmit(event, task.id)}
                onStartEditing={() => onStartEditing(task)}
                onCancelEditing={onCancelEditing}
                isConfirmingDelete={confirmingDeleteId === task.id}
                isDeleting={isDeleting}
                deleteError={deleteError}
                onRequestDelete={() => onRequestDelete(task.id)}
                onCancelDelete={onCancelDelete}
                onConfirmDelete={() => onConfirmDelete(task.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
