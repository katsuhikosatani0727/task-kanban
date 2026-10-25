import { describe, expect, it } from "vitest";
import { isTaskStatus, toErrorMessage } from "./task-status";

describe("isTaskStatus", () => {
  it("正常系: 定義済みのステータス文字列ならtrueを返す", () => {
    expect(isTaskStatus("in_progress")).toBe(true);
  });

  it("異常系: 未定義の文字列ならfalseを返す", () => {
    expect(isTaskStatus("unknown")).toBe(false);
  });

  it("境界値: 空文字ならfalseを返す", () => {
    expect(isTaskStatus("")).toBe(false);
  });
});

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
