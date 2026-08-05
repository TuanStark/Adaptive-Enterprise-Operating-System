import { redirect } from "next/navigation";
import { auth } from "./index";
import { LOGIN_PAGE, type UserRole } from "./constants";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect(LOGIN_PAGE);
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/");
  }

  return session;
}

export async function getCurrentSession() {
  return auth();
}
