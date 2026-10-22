import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("見出しテキストが表示される", () => {
    render(<Home />);

    expect(screen.getByText("タスク管理カンバン")).toBeInTheDocument();
  });

  it("「タスクを見る」リンクが/tasksを指す", () => {
    render(<Home />);

    const link = screen.getByRole("link", { name: "タスクを見る" });
    expect(link).toHaveAttribute("href", "/tasks");
  });
});
