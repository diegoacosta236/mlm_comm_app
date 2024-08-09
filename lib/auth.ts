import { getSession } from "next-auth/react";

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}