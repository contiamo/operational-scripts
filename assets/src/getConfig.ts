import get from "lodash/get";

export const getConfig = (key: string) => {
  const namespace = "contiamo.";
  const opsValue = get(window, `${namespace}${key}`);
  if (opsValue === undefined) {
    throw new Error(
      process.env.NODE_ENV !== "production"
        ? `INVALID CONFIG: ${key} must be present inside config map, under window.${namespace}`
        : "INVALID CONFIG MAP",
    );
  }

  let localstorageValue: string | null | boolean = localStorage.getItem(`${namespace}${key}`);
  if (localstorageValue === "true" || localstorageValue === "false") {
    localstorageValue = localstorageValue === "true";
  }
  return localstorageValue === null ? opsValue : localstorageValue;
};
