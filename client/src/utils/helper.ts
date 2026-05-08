// src/utils/helpers.ts
import i18n from "../i18n.ts";

export const getField = (obj: any, field: string): string => {
  if (i18n.language === "ar") {
    return obj[field] || "";
  }
  return obj[`${field}En`] || "";
};

export const getArrayField = (obj: any, field: string): string[] => {
  if (i18n.language === "ar") {
    return obj[field] || [];
  }
  return obj[`${field}En`] || [];
};