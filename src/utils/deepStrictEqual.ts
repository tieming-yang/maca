/**
 * @todo
 * Add support to Map, Set, Error, RegExp
 */

export function deepStrictEqual<T>(actual: T, expect: T): boolean {
  // primitives
  if (Object.is(actual, expect)) {
    return true;
  }
  if (
    actual === null ||
    expect === null ||
    actual === undefined ||
    expect === undefined ||
    typeof actual !== typeof expect
  ) {
    return false;
  }
  // Array
  const isActualArray = Array.isArray(actual);
  const isExpectArray = Array.isArray(expect);
  if (isActualArray !== isExpectArray) return false;

  if (isActualArray && isExpectArray) {
    if (actual.length !== expect.length) return false;

    for (let i = 0; i < actual.length; i++) {
      if (!deepStrictEqual(actual[i], expect[i])) {
        return false;
      }
    }

    return true;
  }

  // Object
  // Date is a special object we can't access its property
  if (actual instanceof Date && expect instanceof Date) {
    return actual.getTime() === expect.getTime();
  }

  const isActualObject = typeof actual === "object";
  const isExpectObject = typeof expect === "object";
  if (isActualObject && isExpectObject) {
    /**
     * @since
     * const a = Object.create(null)
     * const b = {}
     * deepStrictEqual(a, b) -> true
     */
    if (Object.getPrototypeOf(actual) !== Object.getPrototypeOf(expect)) {
      return false;
    }

    const actualKeys = Object.keys(actual);
    const expectKeys = Object.keys(expect);
    if (actualKeys.length !== expectKeys.length) {
      return false;
    }

    for (let i = 0; i < actualKeys.length; i++) {
      const key = actualKeys[i];
      if (Object.prototype.hasOwnProperty.call(expect, key)) {
        if (!deepStrictEqual(actual[key], expect[key])) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }

  return false;
}
