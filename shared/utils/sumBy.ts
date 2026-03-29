/** Sumuje wartości numeryczne z tablicy obiektów po podanej funkcji klucza */
export function sumBy<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + fn(item), 0);
}
