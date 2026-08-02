import { cookies } from "next/headers";
import { User } from "../types";

export async function getServerSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("aeos_access_token")?.value;
  const userCookie = cookieStore.get("aeos_user")?.value;

  if (!token || !userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie) as User;
  } catch {
    return null;
  }
}
