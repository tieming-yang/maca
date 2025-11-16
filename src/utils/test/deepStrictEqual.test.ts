import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deepStrictEqual } from "../deepStrictEqual";

describe("deepStrictEqual", () => {
  it("returns true for identical primitives", () => {
    assert.strictEqual(deepStrictEqual(42, 42), true);
    assert.strictEqual(deepStrictEqual("hello", "hello"), true);
    assert.strictEqual(deepStrictEqual(false, false), true);
    assert.strictEqual(deepStrictEqual(null, null), true);
    assert.strictEqual(deepStrictEqual(undefined, undefined), true);
  });

  it("returns false for primitives that differ by value or type", () => {
    assert.strictEqual(deepStrictEqual(42, "42"), false);
    assert.strictEqual(deepStrictEqual(true, false), false);
    assert.strictEqual(deepStrictEqual(null, {}), false);
  });

  it("treats NaN as equal and distinguishes +0 and -0", () => {
    assert.strictEqual(deepStrictEqual(NaN, Number("foo")), true);
    assert.strictEqual(deepStrictEqual(0, -0), false);
  });

  it("handles plain objects regardless of key order", () => {
    const a = { foo: 1, bar: { baz: 3, qux: [1, 2] } };
    const b = { bar: { baz: 3, qux: [1, 2] }, foo: 1 };
    assert.strictEqual(deepStrictEqual(a, b), true);
  });

  it("detects missing keys versus explicit undefined", () => {
    assert.strictEqual(deepStrictEqual({ foo: undefined }, {}), false);
    assert.strictEqual(deepStrictEqual({ foo: undefined }, { foo: undefined }), true);
  });

  it("compares arrays deeply and respects element order", () => {
    assert.strictEqual(deepStrictEqual([1, 2, 3], [1, 2, 3]), true);
    assert.strictEqual(deepStrictEqual([1, 2, 3], [3, 2, 1]), false);
    assert.strictEqual(deepStrictEqual([{ x: 1 }, { x: 2 }], [{ x: 1 }, { x: 3 }]), false);
  });

  it("flags differences in nested translation payloads", () => {
    const original = {
      id: "version-1",
      title: "Song",
      language_code: "en",
      lines: [
        { id: 10, timestamp_sec: 5, text: "Hello" },
        { id: 11, timestamp_sec: 10, text: "World" },
      ],
    };
    const same = JSON.parse(JSON.stringify(original));
    const changed = {
      ...same,
      lines: same.lines.map((line) =>
        line.id === 11 ? { ...line, text: "WORLD!" } : line
      ),
    };

    assert.strictEqual(deepStrictEqual(original, same), true);
    assert.strictEqual(deepStrictEqual(original, changed), false);
  });

  it("compares Date instances by their time value", () => {
    assert.strictEqual(
      deepStrictEqual(new Date("2024-01-01T00:00:00Z"), new Date("2024-01-01T00:00:00Z")),
      true
    );
    assert.strictEqual(
      deepStrictEqual(new Date("2024-01-01T00:00:00Z"), new Date("2024-01-02T00:00:00Z")),
      false
    );
  });
});
