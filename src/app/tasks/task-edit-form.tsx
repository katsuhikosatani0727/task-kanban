import type { FormEvent } from "react";
import type { TaskStatus } from "@/lib/tasks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CardContent,
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
import { isTaskStatus, STATUS_LABELS, STATUS_OPTIONS } from "./task-status";

interface TaskEditFormProps {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  isSubmitting: boolean;
  error: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: TaskStatus) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export default function TaskEditForm({
  taskId,
  title,
  description,
  status,
  isSubmitting,
  error,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onSubmit,
  onCancel,
}: TaskEditFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <CardHeader>
        <CardTitle>タスクを編集</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`edit-title-${taskId}`}>編集: タイトル</Label>
          <Input
            id={`edit-title-${taskId}`}
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`edit-description-${taskId}`}>編集: 説明</Label>
          <Textarea
            id={`edit-description-${taskId}`}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`edit-status-${taskId}`}>編集: ステータス</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              if (isTaskStatus(value)) onStatusChange(value);
            }}
          >
            <SelectTrigger id={`edit-status-${taskId}`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {STATUS_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button type="submit" disabled={isSubmitting}>
          更新
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      </CardFooter>
    </form>
  );
}
