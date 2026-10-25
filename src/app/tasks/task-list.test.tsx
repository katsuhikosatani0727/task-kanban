import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/lib/tasks";
import TaskList from "./task-list";

const taskA: Task = {
  id: "1",
  title: "牛乳を買う",
  description: "2本",
  status: "todo",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const taskB: Task = {
  id: "2",
  title: "パンを買う",
  description: null,
  status: "todo",
  createdAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

function renderList(overrides: Partial<React.ComponentProps<typeof TaskList>> = {}) {
  const props: React.ComponentProps<typeof TaskList> = {
    isLoading: false,
    fetchError: null,
    tasks: [],
    editingTaskId: null,
    editTitle: "",
    editDescription: "",
    editStatus: "todo",
    isUpdating: false,
    updateError: null,
    onEditTitleChange: vi.fn(),
    onEditDescriptionChange: vi.fn(),
    onEditStatusChange: vi.fn(),
    onEditSubmit: vi.fn((event) => event.preventDefault()),
    onStartEditing: vi.fn(),
    onCancelEditing: vi.fn(),
    confirmingDeleteId: null,
    isDeleting: false,
    deleteError: null,
    onRequestDelete: vi.fn(),
    onCancelDelete: vi.fn(),
    onConfirmDelete: vi.fn(),
    ...overrides,
  };
  render(<TaskList {...props} />);
  return props;
}

describe("TaskList 表示状態の分岐", () => {
  it("正常系: isLoadingがtrueのとき読み込み中メッセージが表示される", () => {
    renderList({ isLoading: true });

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("異常系: fetchErrorがあるときエラーメッセージが表示される", () => {
    renderList({ fetchError: "タスク一覧の取得に失敗しました: network error" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "タスク一覧の取得に失敗しました: network error"
    );
  });

  it("境界値: tasksが空配列のとき空状態メッセージが表示される", () => {
    renderList({ tasks: [] });

    expect(screen.getByText("タスクはまだありません")).toBeInTheDocument();
  });

  it("正常系: tasksが1件以上のとき各タスクのタイトルが表示される", () => {
    renderList({ tasks: [taskA, taskB] });

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("パンを買う")).toBeInTheDocument();
    expect(screen.queryByText("タスクはまだありません")).not.toBeInTheDocument();
  });
});

describe("TaskList タスクごとのイベントのid引き渡し", () => {
  it("正常系: 対象タスクの削除ボタンをクリックするとそのタスクのidでonRequestDeleteが呼ばれる", async () => {
    const props = renderList({ tasks: [taskA, taskB] });

    const buttons = screen.getAllByRole("button", { name: "削除" });
    await userEvent.click(buttons[1]);

    expect(props.onRequestDelete).toHaveBeenCalledWith(taskB.id);
  });

  it("正常系: 対象タスクの編集ボタンをクリックするとそのタスクでonStartEditingが呼ばれる", async () => {
    const props = renderList({ tasks: [taskA, taskB] });

    const buttons = screen.getAllByRole("button", { name: "編集" });
    await userEvent.click(buttons[0]);

    expect(props.onStartEditing).toHaveBeenCalledWith(taskA);
  });

  it("正常系: editingTaskIdと一致するタスクのみ編集フォームが表示される", () => {
    renderList({ tasks: [taskA, taskB], editingTaskId: taskA.id });

    expect(screen.getByLabelText("編集: タイトル")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "編集" })).toHaveLength(1);
  });
});
