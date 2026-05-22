import axios from "axios";
import {  type Property } from "../types/property";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getProperties = async (): Promise<Property[]> => {
  const res = await axios.get(`${BASE_URL}/api/properties`);
  return res.data;
};