import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-zinc-100 to-zinc-200 px-4 py-12 dark:from-black dark:to-zinc-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">タスク管理カンバン</CardTitle>
          <CardDescription>
            タスクの追加・編集・削除をその場で反映できるシンプルなカンバンアプリです
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            「タスクを見る」から一覧画面に移動できます。
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/tasks">タスクを見る</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
