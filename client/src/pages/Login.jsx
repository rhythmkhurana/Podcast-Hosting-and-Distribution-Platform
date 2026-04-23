import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Mic, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const Login = () => {
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const savedEmail = localStorage.getItem('rememberedEmail') || '';
  const rememberMeDefault = localStorage.getItem('rememberMe') === 'true';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: savedEmail,
      rememberMe: rememberMeDefault,
    }
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await login({ email: data.email, password: data.password });
      
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.setItem('rememberMe', 'false');
      }
      
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex rounded-2xl overflow-hidden glass-panel my-8 border border-white/10">
      {/* Left side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-surface relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F5A623' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-xl bg-primary flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(245,166,35,0.4)]">
            <Mic size={40} className="text-black" />
          </div>
          <h1 className="text-5xl font-display tracking-widest text-white mb-4">WAVCAST</h1>
          <p className="text-xl text-primary font-mono tracking-tight">YOUR VOICE. YOUR WORLD.</p>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-background">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-display tracking-wide mb-2">Welcome Back</h2>
          <p className="text-textMuted mb-8">Sign in to continue listening to your favorite podcasts.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Password</label>
              <input
                type="password"
                {...register('password')}
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('rememberMe')}
                  className="rounded bg-surface border-white/20 text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                />
                <span className="text-sm text-textMuted select-none">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex justify-center items-center h-12"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Log In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-textMuted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;