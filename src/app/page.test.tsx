import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("見出しテキストが表示される", () => {
    render(<Home />);

    expect(
      screen.getByText("file.", { exact: false })
    ).toBeInTheDocument();
  });

  it("Documentationリンクが正しいURLを指す", () => {
    render(<Home />);

    const link = screen.getByRole("link", { name: "Documentation" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("nextjs.org/docs")
    );
  });
});
