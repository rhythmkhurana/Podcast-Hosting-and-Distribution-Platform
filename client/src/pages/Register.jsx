import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Mic, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['listener', 'creator']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const [error, setError] = useState('');
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'listener'
    }
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      });
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex rounded-2xl overflow-hidden glass-panel my-8 border border-white/10 flex-row-reverse">
      {/* Right side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-surface relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 bg-gradient-to-bl from-secondary/10 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C8' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,212,200,0.4)]">
            <Mic size={40} className="text-black" />
          </div>
          <h1 className="text-5xl font-display tracking-widest text-white mb-4">WAVCAST</h1>
          <p className="text-xl text-secondary font-mono tracking-tight">JOIN THE FREQUENCY.</p>
        </motion.div>
      </div>

      {/* Left side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-background">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-display tracking-wide mb-2">Create Account</h2>
          <p className="text-textMuted mb-6">Join WavCast as a listener or start your own podcast.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Full Name</label>
              <input
                type="text"
                {...register('name')}
                className="input-field"
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Confirm Password</label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="input-field"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">I want to...</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer relative">
                  <input type="radio" value="listener" {...register('role')} className="peer sr-only" />
                  <div className="px-4 py-3 border border-white/20 rounded text-center text-sm font-medium hover:bg-white/5 transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary">
                    Listen to Podcasts
                  </div>
                </label>
                <label className="cursor-pointer relative">
                  <input type="radio" value="creator" {...register('role')} className="peer sr-only" />
                  <div className="px-4 py-3 border border-white/20 rounded text-center text-sm font-medium hover:bg-white/5 transition peer-checked:border-secondary peer-checked:bg-secondary/10 peer-checked:text-secondary">
                    Create Podcasts
                  </div>
                </label>
              </div>
              {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex justify-center items-center h-12 mt-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-textMuted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;