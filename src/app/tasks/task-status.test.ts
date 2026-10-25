import { describe, expect, it } from "vitest";
import { toErrorMessage } from "./task-status";

describe("toErrorMessage", () => {
  it("正常系: Errorインスタンスのときはmessageを返す", () => {
    expect(toErrorMessage(new Error("失敗しました"))).toBe("失敗しました");
  });

  it("異常系: 文字列が渡されたときはそのまま文字列として返す", () => {
    expect(toErrorMessage("文字列エラー")).toBe("文字列エラー");
  });

  it("境界値: nullが渡されたときは文字列化した'null'を返す", () => {
    expect(toErrorMessage(null)).toBe("null");
  });
});
