import { AppLayout } from "@/features/core/components/AppLayout";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <AuthProvider session={session}>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
