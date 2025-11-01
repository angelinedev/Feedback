
"use client";

import { useContext } from "react";
import { useData } from "@/components/data-provider";

export const useAuth = () => {
  // This now uses the single, consolidated provider.
  return useData();
};
