import type { FormEvent } from "react";
import type { Task, TaskStatus } from "@/lib/tasks";
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
import { cn } from "@/lib/utils";
import TaskEditForm from "./task-edit-form";
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from "./task-status";

interface TaskCardProps {
  task: Task;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  editStatus: TaskStatus;
  isUpdating: boolean;
  updateError: string | null;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEditStatusChange: (value: TaskStatus) => void;
  onEditSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  isConfirmingDelete: boolean;
  isDeleting: boolean;
  deleteError: string | null;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

export default function TaskCard({
  task,
  isEditing,
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
  isConfirmingDelete,
  isDeleting,
  deleteError,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: TaskCardProps) {
  if (isEditing) {
    return (
      <Card>
        <TaskEditForm
          taskId={task.id}
          title={editTitle}
          description={editDescription}
          status={editStatus}
          isSubmitting={isUpdating}
          error={updateError}
          onTitleChange={onEditTitleChange}
          onDescriptionChange={onEditDescriptionChange}
          onStatusChange={onEditStatusChange}
          onSubmit={onEditSubmit}
          onCancel={onCancelEditing}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        {task.description && (
          <CardDescription>{task.description}</CardDescription>
        )}
        <CardAction>
          <Badge
            variant="outline"
            className={cn(
              "border-transparent",
              STATUS_BADGE_CLASSES[task.status],
            )}
          >
            {STATUS_LABELS[task.status]}
          </Badge>
        </CardAction>
      </CardHeader>

      {(isConfirmingDelete || deleteError) && (
        <CardContent className="flex flex-col gap-3">
          {isConfirmingDelete && (
            <Alert variant="destructive">
              <AlertTitle>本当に削除しますか？</AlertTitle>
            </Alert>
          )}
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}

      <CardFooter className="gap-2">
        {isConfirmingDelete ? (
          <>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={onConfirmDelete}
            >
              削除する
            </Button>
            <Button type="button" variant="outline" onClick={onCancelDelete}>
              キャンセル
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={onStartEditing}>
              編集
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onRequestDelete}
            >
              削除
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
