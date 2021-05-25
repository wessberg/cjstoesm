export type MaybeArray<T> = T[] | T;
export type PartialExcept<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;
