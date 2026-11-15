import { api } from "../../utils/api";
import {  type Property } from "../types/property";

export const getProperties = async (): Promise<Property[]> => {
  const res = await api.get("/properties");
  return res.data;
};