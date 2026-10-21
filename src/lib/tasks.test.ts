import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import {
  createFakeQueryBuilder,
  type FakeQueryResult,
} from "@/test-support/supabaseQueryMock";
import { createTask, deleteTask, fetchTasks, updateTask } from "@/lib/tasks";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

function mockFrom<T>(result: FakeQueryResult<T>) {
  const builder = createFakeQueryBuilder(result);
  vi.mocked(supabase.from).mockReturnValue(
    builder as unknown as ReturnType<typeof supabase.from>
  );
  return builder;
}

const row = {
  id: "1",
  title: "牛乳を買う",
  description: "2本",
  status: "todo",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("fetchTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: 取得した行がcamelCaseのTaskに変換されて返る", async () => {
    mockFrom({ data: [row], error: null });

    const tasks = await fetchTasks();

    expect(tasks).toEqual([
      {
        id: "1",
        title: "牛乳を買う",
        description: "2本",
        status: "todo",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("境界値: データが0件のとき空配列が返る", async () => {
    mockFrom({ data: [], error: null });

    expect(await fetchTasks()).toEqual([]);
  });

  it("境界値: dataがnullのとき空配列が返る", async () => {
    mockFrom({ data: null, error: null });

    expect(await fetchTasks()).toEqual([]);
  });

  it("異常系: Supabaseがエラーを返すと日本語メッセージの例外がthrowされる", async () => {
    mockFrom({ data: null, error: { message: "network error" } });

    await expect(fetchTasks()).rejects.toThrow(
      "タスク一覧の取得に失敗しました: network error"
    );
  });
});

describe("createTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: タイトルと説明を指定すると、todoステータスで作成される", async () => {
    const builder = mockFrom({ data: row, error: null });

    const task = await createTask({ title: "牛乳を買う", description: "2本" });

    expect(builder.insert).toHaveBeenCalledWith({
      title: "牛乳を買う",
      description: "2本",
      status: "todo",
    });
    expect(task.status).toBe("todo");
  });

  it("境界値: descriptionを省略するとnullとして作成される", async () => {
    const builder = mockFrom({
      data: { ...row, description: null },
      error: null,
    });

    await createTask({ title: "牛乳を買う" });

    expect(builder.insert).toHaveBeenCalledWith({
      title: "牛乳を買う",
      description: null,
      status: "todo",
    });
  });

  it("異常系: Supabaseがエラーを返すと日本語メッセージの例外がthrowされる", async () => {
    mockFrom({ data: null, error: { message: "constraint violation" } });

    await expect(createTask({ title: "" })).rejects.toThrow(
      "タスクの作成に失敗しました: constraint violation"
    );
  });
});

describe("updateTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: statusのみ指定すると、statusとupdated_atのみが更新ペイロードに含まれる", async () => {
    const builder = mockFrom({ data: { ...row, status: "done" }, error: null });

    const task = await updateTask("1", { status: "done" });

    expect(builder.update).toHaveBeenCalledWith({
      updated_at: expect.any(String),
      status: "done",
    });
    expect(builder.eq).toHaveBeenCalledWith("id", "1");
    expect(task.status).toBe("done");
  });

  it("正常系: titleとdescriptionを同時に更新できる", async () => {
    const builder = mockFrom({
      data: { ...row, title: "パンを買う", description: "食パン" },
      error: null,
    });

    await updateTask("1", { title: "パンを買う", description: "食パン" });

    expect(builder.update).toHaveBeenCalledWith({
      updated_at: expect.any(String),
      title: "パンを買う",
      description: "食パン",
    });
  });

  it("異常系: Supabaseがエラーを返すと日本語メッセージの例外がthrowされる", async () => {
    mockFrom({ data: null, error: { message: "not found" } });

    await expect(updateTask("missing-id", { status: "done" })).rejects.toThrow(
      "タスクの更新に失敗しました: not found"
    );
  });
});

describe("deleteTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: 指定したidで削除が呼ばれる", async () => {
    const builder = mockFrom<null>({ data: null, error: null });

    await deleteTask("1");

    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "1");
  });

  it("異常系: Supabaseがエラーを返すと日本語メッセージの例外がthrowされる", async () => {
    mockFrom<null>({ data: null, error: { message: "network error" } });

    await expect(deleteTask("1")).rejects.toThrow(
      "タスクの削除に失敗しました: network error"
    );
  });
});
