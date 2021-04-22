export const isFalsy = (v) => !v;
export const isTruthy = (v) => !!v;
export const isString = (v) => typeof v === "string" || v instanceof String;
export const isFunction = (v) => typeof v === "function";
export const isEmpty = (v) => typeof v === "undefined";
export const isNotEmpty = (v) => typeof v !== "undefined";
export const isArray = (v) => v instanceof Array;
export const isEmptyArray = (v) => isArray(v) && v.length === 0;
