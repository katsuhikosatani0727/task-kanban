import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import NewTaskForm from "./new-task-form";

function renderForm(
  overrides: Partial<React.ComponentProps<typeof NewTaskForm>> = {}
) {
  const props: React.ComponentProps<typeof NewTaskForm> = {
    title: "",
    description: "",
    isSubmitting: false,
    error: null,
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onSubmit: vi.fn((event) => event.preventDefault()),
    ...overrides,
  };
  render(<NewTaskForm {...props} />);
  return props;
}

describe("NewTaskForm", () => {
  it("正常系: タイトル入力で1文字ごとにonTitleChangeが呼ばれる", async () => {
    const props = renderForm();

    await userEvent.type(screen.getByLabelText("タイトル"), "a");

    expect(props.onTitleChange).toHaveBeenCalledWith("a");
  });

  it("正常系: 説明入力で1文字ごとにonDescriptionChangeが呼ばれる", async () => {
    const props = renderForm();

    await userEvent.type(screen.getByLabelText("説明"), "a");

    expect(props.onDescriptionChange).toHaveBeenCalledWith("a");
  });

  it("正常系: 追加ボタンをクリックするとonSubmitが呼ばれる", async () => {
    const props = renderForm();

    await userEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("境界値: isSubmittingがtrueのとき追加ボタンが無効化される", () => {
    renderForm({ isSubmitting: true });

    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("異常系: errorが渡されたときエラーメッセージがalertとして表示される", () => {
    renderForm({ error: "タイトルを入力してください" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "タイトルを入力してください"
    );
  });

  it("正常系: errorがnullのときはalertが表示されない", () => {
    renderForm({ error: null });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("正常系: 渡されたtitle/descriptionが入力値として表示される", () => {
    renderForm({ title: "牛乳を買う", description: "2本" });

    expect(screen.getByLabelText("タイトル")).toHaveValue("牛乳を買う");
    expect(screen.getByLabelText("説明")).toHaveValue("2本");
  });
});
