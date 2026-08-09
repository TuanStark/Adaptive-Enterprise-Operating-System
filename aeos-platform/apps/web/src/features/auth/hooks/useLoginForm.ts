import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      setIsPending(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng');
        toast.error('Đăng nhập thất bại', {
          description: 'Email hoặc mật khẩu không đúng',
        });
      } else if (result?.ok) {
        toast.success('Đăng nhập thành công', {
          description: 'Chào mừng bạn trở lại hệ thống AEOS.',
        });
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      toast.error('Lỗi hệ thống', {
        description: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    handleSubmit,
  };
}
