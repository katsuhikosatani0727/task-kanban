import type { FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NewTaskFormProps {
  title: string;
  description: string;
  isSubmitting: boolean;
  error: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function NewTaskForm({
  title,
  description,
  isSubmitting,
  error,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
}: NewTaskFormProps) {
  return (
    <Card className="mb-8">
      <form onSubmit={onSubmit}>
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
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-task-description">説明</Label>
            <Textarea
              id="new-task-description"
              placeholder="詳細があれば入力してください(任意)"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            追加
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
