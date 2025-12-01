"use client";

import { ReactNode } from "react";
import { InMemoryStorageProvider } from "@fhevm-sdk/react";

export function FhevmProvider({ children }: { children: ReactNode }) {
  return <InMemoryStorageProvider>{children}</InMemoryStorageProvider>;
}
