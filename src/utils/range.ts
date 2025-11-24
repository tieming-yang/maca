/**
 * @example
 * Generate the Latin alphabet making use of it being ordered as a sequence
 * range("A".charCodeAt(0), "Z".charCodeAt(0) + 1, 1).map((x) => String.fromCharCode(x),);
 * ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
 */

function range(start: number, stop: number, step: number): number[] {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step
  );
}
