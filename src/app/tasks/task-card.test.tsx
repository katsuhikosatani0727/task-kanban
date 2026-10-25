import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "@/lib/tasks";
import TaskCard from "./task-card";

const task: Task = {
  id: "1",
  title: "牛乳を買う",
  description: "2本",
  status: "todo",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderCard(overrides: Partial<React.ComponentProps<typeof TaskCard>> = {}) {
  const props: React.ComponentProps<typeof TaskCard> = {
    task,
    isEditing: false,
    editTitle: task.title,
    editDescription: task.description ?? "",
    editStatus: task.status,
    isUpdating: false,
    updateError: null,
    onEditTitleChange: vi.fn(),
    onEditDescriptionChange: vi.fn(),
    onEditStatusChange: vi.fn(),
    onEditSubmit: vi.fn((event) => event.preventDefault()),
    onStartEditing: vi.fn(),
    onCancelEditing: vi.fn(),
    isConfirmingDelete: false,
    isDeleting: false,
    deleteError: null,
    onRequestDelete: vi.fn(),
    onCancelDelete: vi.fn(),
    onConfirmDelete: vi.fn(),
    ...overrides,
  };
  render(<TaskCard {...props} />);
  return props;
}

describe("TaskCard 表示モード", () => {
  it("正常系: タイトル・説明・ステータスバッジが表示される", () => {
    renderCard();

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("2本")).toBeInTheDocument();
    expect(screen.getByText("未着手")).toBeInTheDocument();
  });

  it("境界値: descriptionがnullのとき説明は表示されない", () => {
    renderCard({ task: { ...task, description: null } });

    expect(screen.queryByText("2本")).not.toBeInTheDocument();
  });

  it("正常系: 編集ボタンをクリックするとonStartEditingが呼ばれる", async () => {
    const props = renderCard();

    await userEvent.click(screen.getByRole("button", { name: "編集" }));

    expect(props.onStartEditing).toHaveBeenCalledTimes(1);
  });

  it("正常系: 削除ボタンをクリックするとonRequestDeleteが呼ばれる", async () => {
    const props = renderCard();

    await userEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(props.onRequestDelete).toHaveBeenCalledTimes(1);
  });
});

describe("TaskCard 編集モード", () => {
  it("正常系: isEditingがtrueのとき編集フォームが表示される", () => {
    renderCard({ isEditing: true });

    expect(screen.getByLabelText("編集: タイトル")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "編集" })).not.toBeInTheDocument();
  });
});

describe("TaskCard 削除確認モード", () => {
  it("正常系: isConfirmingDeleteがtrueのとき確認メッセージと削除する/キャンセルボタンが表示される", () => {
    renderCard({ isConfirmingDelete: true });

    expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "削除する" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("正常系: 削除するボタンをクリックするとonConfirmDeleteが呼ばれる", async () => {
    const props = renderCard({ isConfirmingDelete: true });

    await userEvent.click(screen.getByRole("button", { name: "削除する" }));

    expect(props.onConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it("正常系: キャンセルボタンをクリックするとonCancelDeleteが呼ばれる", async () => {
    const props = renderCard({ isConfirmingDelete: true });

    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(props.onCancelDelete).toHaveBeenCalledTimes(1);
  });

  it("境界値: isDeletingがtrueのとき削除するボタンが無効化される", () => {
    renderCard({ isConfirmingDelete: true, isDeleting: true });

    expect(screen.getByRole("button", { name: "削除する" })).toBeDisabled();
  });

  it("異常系: deleteErrorが渡されたときエラーメッセージがalertとして表示される", () => {
    renderCard({ deleteError: "タスクの削除に失敗しました: delete error" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "タスクの削除に失敗しました: delete error"
    );
  });
});
