import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import {
  createFakeQueryBuilder,
  type FakeQueryResult,
} from "@/test-support/supabaseQueryMock";
import TaskBoard from "./task-board";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

function queueFromResult<T>(result: FakeQueryResult<T>) {
  const builder = createFakeQueryBuilder(result);
  vi.mocked(supabase.from).mockReturnValueOnce(
    builder as unknown as ReturnType<typeof supabase.from>
  );
  return builder;
}

const rowA = {
  id: "1",
  title: "牛乳を買う",
  description: "2本",
  status: "todo",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const rowB = {
  id: "2",
  title: "パンを買う",
  description: null,
  status: "todo",
  created_at: "2026-01-02T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

describe("TaskBoard 初期表示", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: 取得成功でローディング表示が消え、一覧が表示される", async () => {
    queueFromResult({ data: [rowA, rowB], error: null });

    render(<TaskBoard />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(await screen.findByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("パンを買う")).toBeInTheDocument();
    expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
  });

  it("境界値: 0件のとき空状態メッセージが表示される", async () => {
    queueFromResult({ data: [], error: null });

    render(<TaskBoard />);

    expect(await screen.findByText("タスクはまだありません")).toBeInTheDocument();
  });

  it("異常系: 初期取得に失敗するとエラーメッセージが表示され一覧は出ない", async () => {
    queueFromResult({ data: null, error: { message: "network error" } });

    render(<TaskBoard />);

    expect(
      await screen.findByText("タスク一覧の取得に失敗しました: network error")
    ).toBeInTheDocument();
    expect(screen.queryByText("タスクはまだありません")).not.toBeInTheDocument();
  });
});

describe("TaskBoard タスクの追加", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: タイトルと説明を入力して追加すると一覧に即時反映される", async () => {
    queueFromResult({ data: [], error: null });
    render(<TaskBoard />);
    await screen.findByText("タスクはまだありません");

    queueFromResult({ data: rowA, error: null });

    await userEvent.type(screen.getByLabelText("タイトル"), "牛乳を買う");
    await userEvent.type(screen.getByLabelText("説明"), "2本");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(await screen.findByText("牛乳を買う")).toBeInTheDocument();
    expect(vi.mocked(supabase.from)).toHaveBeenCalledTimes(2);
  });

  it("境界値: タイトル未入力で追加するとエラーが表示されSupabase呼び出しは発生しない", async () => {
    queueFromResult({ data: [], error: null });
    render(<TaskBoard />);
    await screen.findByText("タスクはまだありません");

    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(await screen.findByText("タイトルを入力してください")).toBeInTheDocument();
    expect(vi.mocked(supabase.from)).toHaveBeenCalledTimes(1);
  });

  it("異常系: 追加に失敗するとエラーが表示され一覧に追加されない", async () => {
    queueFromResult({ data: [], error: null });
    render(<TaskBoard />);
    await screen.findByText("タスクはまだありません");

    queueFromResult({ data: null, error: { message: "db error" } });

    await userEvent.type(screen.getByLabelText("タイトル"), "牛乳を買う");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(
      await screen.findByText("タスクの作成に失敗しました: db error")
    ).toBeInTheDocument();
    expect(screen.queryByText("タスクはまだありません")).toBeInTheDocument();
  });

  it("状態遷移(順方向): 追加成功後にフォームの入力値がクリアされる", async () => {
    queueFromResult({ data: [], error: null });
    render(<TaskBoard />);
    await screen.findByText("タスクはまだありません");

    queueFromResult({ data: rowA, error: null });

    const titleInput = screen.getByLabelText("タイトル");
    await userEvent.type(titleInput, "牛乳を買う");
    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    await screen.findByText("牛乳を買う");
    expect(titleInput).toHaveValue("");
  });
});

describe("TaskBoard タスクの編集", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("状態遷移(順方向): 編集クリックで既存値が入った編集フォームに変わる", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "編集" }));

    expect(screen.getByLabelText("編集: タイトル")).toHaveValue("牛乳を買う");
    expect(screen.getByLabelText("編集: 説明")).toHaveValue("2本");
  });

  it("正常系: 更新すると一覧の該当タスク表示が即時更新され編集モードが閉じる", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "編集" }));

    queueFromResult({ data: { ...rowA, status: "done" }, error: null });

    await userEvent.click(screen.getByLabelText("編集: ステータス"));
    await userEvent.click(await screen.findByRole("option", { name: "完了" }));
    await userEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(await screen.findByText("完了")).toBeInTheDocument();
    expect(screen.queryByLabelText("編集: ステータス")).not.toBeInTheDocument();
  });

  it("状態遷移(逆方向): 編集中にキャンセルすると変更を保存せず一覧表示に戻る", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "編集" }));
    const titleField = screen.getByLabelText("編集: タイトル");
    await userEvent.clear(titleField);
    await userEvent.type(titleField, "変更後タイトル");
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.queryByText("変更後タイトル")).not.toBeInTheDocument();
    expect(vi.mocked(supabase.from)).toHaveBeenCalledTimes(1);
  });

  it("異常系: 更新に失敗すると編集フォーム内にエラー表示され編集モードは維持される", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "編集" }));

    queueFromResult({ data: null, error: { message: "update error" } });
    await userEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(
      await screen.findByText("タスクの更新に失敗しました: update error")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("編集: タイトル")).toBeInTheDocument();
  });
});

describe("TaskBoard タスクの削除", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("状態遷移(順方向): 削除クリックで確認UIが表示されタスクはまだ残る", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });

  it("状態遷移(逆方向): 確認UIでキャンセルすると確認UIが閉じタスクは削除されない", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByText("本当に削除しますか？")).not.toBeInTheDocument();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(vi.mocked(supabase.from)).toHaveBeenCalledTimes(1);
  });

  it("正常系: 確認UIで削除を確定すると一覧から即時に取り除かれる", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    queueFromResult<null>({ data: null, error: null });
    await userEvent.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
    });
  });

  it("異常系: 削除に失敗するとエラー表示されタスクは一覧に残り続ける", async () => {
    queueFromResult({ data: [rowA], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    queueFromResult<null>({ data: null, error: { message: "delete error" } });
    await userEvent.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      await screen.findByText("タスクの削除に失敗しました: delete error")
    ).toBeInTheDocument();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });
});

describe("TaskBoard 複数タスクの独立性", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: 複数タスク表示中に1件だけ削除しても他のタスク表示に影響しない", async () => {
    queueFromResult({ data: [rowA, rowB], error: null });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");
    await screen.findByText("パンを買う");

    const taskAItem = screen.getByText("牛乳を買う").closest("li");
    if (!taskAItem) {
      throw new Error("対象のリスト項目が見つかりません");
    }

    await userEvent.click(within(taskAItem).getByRole("button", { name: "削除" }));
    queueFromResult<null>({ data: null, error: null });
    await userEvent.click(
      within(taskAItem).getByRole("button", { name: "削除する" })
    );

    await waitFor(() => {
      expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
    });
    expect(screen.getByText("パンを買う")).toBeInTheDocument();
  });
});
