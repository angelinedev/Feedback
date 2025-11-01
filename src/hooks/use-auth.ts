
"use client";

import { useAuthContext } from "@/components/auth-provider";

export const useAuth = () => {
  return useAuthContext();
};
