import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { Lock, User } from 'lucide-react';
import apiClient from '@/api/client';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiClient.post('/auth/login', {
        login: loginInput,
        password,
      });

      if (res.data.success) {
        const { user, accessToken, token } = res.data.data;
        const jwt = accessToken || token;

        login(
          {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name || user.username,
          },
          jwt
        );

        toast.success(`Welcome back, ${user.username}!`);

        // Redirect based on role
        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'FACULTY') navigate('/faculty');
        else navigate('/student');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        'Invalid credentials. Please check your username and password.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary-600">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary-700 font-bold text-2xl">MT</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-slate-500 text-sm">Mother Teresa Foundation School</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              placeholder="Enter your email or username"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              required
              iconPrefix={<User className="h-4 w-4" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              iconPrefix={<Lock className="h-4 w-4" />}
            />
          </CardContent>
          <CardFooter className="pt-2 flex-col gap-3">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Default admin: <span className="font-mono font-semibold">admin</span> / <span className="font-mono font-semibold">Admin@123</span>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
