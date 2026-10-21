import { vi } from "vitest";

export interface FakeQueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

export interface FakeQueryBuilder<T> {
  select: (...args: unknown[]) => FakeQueryBuilder<T>;
  insert: (...args: unknown[]) => FakeQueryBuilder<T>;
  update: (...args: unknown[]) => FakeQueryBuilder<T>;
  delete: (...args: unknown[]) => FakeQueryBuilder<T>;
  eq: (...args: unknown[]) => FakeQueryBuilder<T>;
  order: (...args: unknown[]) => FakeQueryBuilder<T>;
  single: () => Promise<FakeQueryResult<T>>;
  then: Promise<FakeQueryResult<T>>["then"];
}

export function createFakeQueryBuilder<T>(
  result: FakeQueryResult<T>
): FakeQueryBuilder<T> {
  const resolved = Promise.resolve(result);
  const builder: FakeQueryBuilder<T> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => resolved),
    then: (onFulfilled, onRejected) => resolved.then(onFulfilled, onRejected),
  };

  return builder;
}
