import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TaskEditForm from "./task-edit-form";

function renderForm(
  overrides: Partial<React.ComponentProps<typeof TaskEditForm>> = {}
) {
  const props: React.ComponentProps<typeof TaskEditForm> = {
    taskId: "1",
    title: "牛乳を買う",
    description: "2本",
    status: "todo",
    isSubmitting: false,
    error: null,
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onStatusChange: vi.fn(),
    onSubmit: vi.fn((event) => event.preventDefault()),
    onCancel: vi.fn(),
    ...overrides,
  };
  render(<TaskEditForm {...props} />);
  return props;
}

describe("TaskEditForm", () => {
  it("正常系: 渡されたtitle/description/statusが入力値として表示される", () => {
    renderForm();

    expect(screen.getByLabelText("編集: タイトル")).toHaveValue("牛乳を買う");
    expect(screen.getByLabelText("編集: 説明")).toHaveValue("2本");
    expect(
      within(screen.getByRole("combobox")).getByText("未着手")
    ).toBeInTheDocument();
  });

  it("正常系: タイトル変更でonTitleChangeが呼ばれる", async () => {
    const props = renderForm();

    await userEvent.type(screen.getByLabelText("編集: タイトル"), "a");

    expect(props.onTitleChange).toHaveBeenCalled();
  });

  it("正常系: ステータスを選択するとonStatusChangeが呼ばれる", async () => {
    const props = renderForm();

    await userEvent.click(screen.getByLabelText("編集: ステータス"));
    await userEvent.click(await screen.findByRole("option", { name: "完了" }));

    expect(props.onStatusChange).toHaveBeenCalledWith("done");
  });

  it("正常系: 更新ボタンをクリックするとonSubmitが呼ばれる", async () => {
    const props = renderForm();

    await userEvent.click(screen.getByRole("button", { name: "更新" }));

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("正常系: キャンセルボタンをクリックするとonCancelが呼ばれる", async () => {
    const props = renderForm();

    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("境界値: isSubmittingがtrueのとき更新ボタンが無効化される", () => {
    renderForm({ isSubmitting: true });

    expect(screen.getByRole("button", { name: "更新" })).toBeDisabled();
  });

  it("異常系: errorが渡されたときエラーメッセージがalertとして表示される", () => {
    renderForm({ error: "タスクの更新に失敗しました: update error" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "タスクの更新に失敗しました: update error"
    );
  });
});
