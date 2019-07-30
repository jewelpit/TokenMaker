export function assert(condition: boolean, message?: string) {
  if (condition) {
    return;
  }

  const msg = message != null ? message : "Assertion failed";
  throw new Error(msg);
}

export function nonNull<T>(item: T | null | undefined) {
  if (item != null) {
    return item;
  }

  throw new Error("Item was null");
}
