
"use client";

import { useAuth as useFirebaseAuth } from "@/components/auth-provider";

export const useAuth = () => {
  return useFirebaseAuth();
};
