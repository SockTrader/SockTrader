export type Table<U> = { [K in keyof U]: U[K][] };

export const toTable = <T extends object>(list: T[]): Table<T> => {
  return list.reduce((prev, current) => {
    const keys = Object.keys(current) as (keyof T)[];
    const result: Table<T> = { ...prev };

    keys.forEach((k) => {
      if (!Array.isArray(result[k])) {
        result[k] = <Table<T>[keyof T]>[];
      }

      (<Table<T>[keyof T]>result[k]).push(current[k]);
    });

    return result;
  }, <Table<T>>{});
};
