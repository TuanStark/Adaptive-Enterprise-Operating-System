import { AppLayout } from "@/features/core/components/AppLayout";
import { AuthProvider } from "@/features/auth/components/AuthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}
