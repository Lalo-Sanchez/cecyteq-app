"use client";

import React, { useState } from 'react';
import { Mail, Lock, CheckCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { loginUser } from '../actions/auth';
import { signIn as socialSignIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', result.role || '');
          localStorage.setItem('userId', String(result.userId || ''));
        }
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error desconocido');
      }
    } catch (err) {
      console.error(err);
      setError('Error crítico de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await socialSignIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      console.error(err);
      setError('Error al conectar con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    alert("Inicio con Apple: La cuenta de Apple requiere validación biométrica en dispositivos Apple.");
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Efectos visuales de fondo sutiles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cecyteq-green/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cecyteq-orange/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 shadow-glow relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 group transition-transform hover:scale-105 bg-white p-4 rounded-[2rem] shadow-xl">
            <img src="/cecyteq_logo.png" alt="CECYTEQ Logo" className="w-32 h-auto object-contain" />
          </div>
          <h1 className="text-4xl font-black text-text-primary text-center tracking-tighter">CECyTEQ 5</h1>
          <p className="text-cecyteq-orange text-[10px] font-black uppercase tracking-[0.4em] text-center mt-1">By Lesty</p>
          <p className="text-text-secondary text-sm mt-4 text-center font-medium">Plataforma de Gestión Integral</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <CheckCircle size={16} className="text-red-500 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">
              Correo Institucional
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-cecyteq-green transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@cecyteq.edu.mx"
                required
                className="w-full bg-bg-main border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder-text-secondary/30 focus:outline-none focus:border-cecyteq-green focus:ring-1 focus:ring-cecyteq-green/20 transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-cecyteq-green transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-bg-main border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder-text-secondary/30 focus:outline-none focus:border-cecyteq-green focus:ring-1 focus:ring-cecyteq-green/20 transition-all shadow-inner"
              />
            </div>
            <div className="flex justify-end mt-3">
              <button type="button" className="text-xs text-cecyteq-orange hover:text-cecyteq-orange/80 font-bold transition-colors">¿Olvidaste tu contraseña?</button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-cecyteq-green hover:bg-cecyteq-green/90 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-cecyteq-green/20 flex justify-center items-center gap-2 disabled:opacity-70 mt-6 active:scale-[0.98]"
          >
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-10 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-bg-surface px-4 text-text-secondary font-black uppercase tracking-widest">O continuar con</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="flex items-center justify-center gap-3 bg-bg-main hover:bg-bg-main/70 border border-border-subtle rounded-2xl py-3.5 transition-all group disabled:opacity-50 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Google</span>
          </button>
          <button 
            type="button" 
            onClick={handleAppleLogin} 
            disabled={isLoading}
            className="flex items-center justify-center gap-3 bg-bg-main hover:bg-bg-main/70 border border-border-subtle rounded-2xl py-3.5 transition-all group disabled:opacity-50 active:scale-[0.98]"
          >
            <svg className="w-5 h-5 text-text-primary group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.7 3.58-.6 1.58.15 2.82.72 3.82 1.83-3.15 1.89-2.63 5.92.54 7.23-1.05 2.65-2.28 3.56-2.99 3.71zm-4.32-15.01c.21-2.01 1.6-3.79 3.47-4.27-.42 2.15-2.07 3.75-3.69 4.22-.11.05-.21.05-.22.05z"/>
            </svg>
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Apple</span>
          </button>
        </div>
      </div>
    </div>
  );
}