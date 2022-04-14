export type GenericPropertyList<Type> = {
  [property in keyof Type]: any;
};

export type GenericWhereCondition<T> = {
  property: keyof GenericPropertyList<T>;
  condition: string;
  binding?: string
};

export type WhereConditions<T> = GenericWhereCondition<T>[];
