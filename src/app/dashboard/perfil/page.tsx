"use client";

import React, { useEffect, useState } from 'react';
import { UserCircle, Mail, Briefcase, Key, Shield, LogOut, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/actions/auth';

export default function PerfilPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole'));
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const getUserName = () => {
    if (role === 'admin') return 'Eduardo Sánchez';
    if (role === 'docente') return 'Docente CECYTEQ';
    if (role === 'alumno') return 'Alumno Institucional';
    return 'Usuario';
  };

  const getRoleName = () => {
    switch(role) {
      case 'admin': return 'Director de Plantel';
      case 'docente': return 'Docente Académico';
      case 'alumno': return 'Estudiante Regular';
      default: return 'Usuario Plataforma';
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-fadeInUp">
      <div>
        <h2 className="text-4xl font-black text-text-primary tracking-tighter uppercase">Perfil de Usuario</h2>
        <p className="text-text-secondary font-medium mt-2">Configuración de identidad institucional y seguridad de cuenta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Tarjeta de Identidad */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 shadow-glow flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-cecyteq-green"></div>
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-bg-main border-2 border-border-subtle rounded-3xl flex items-center justify-center text-text-secondary shadow-inner group transition-transform hover:scale-105">
                <UserCircle size={80} className="group-hover:text-cecyteq-green transition-colors" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cecyteq-green border-4 border-bg-surface rounded-2xl flex items-center justify-center shadow-lg">
                <Shield size={14} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight leading-tight">{getUserName()}</h3>
            <p className="text-cecyteq-green font-black text-[10px] uppercase tracking-widest mt-2 px-4 py-1.5 bg-cecyteq-green/10 rounded-full border border-cecyteq-green/20">{getRoleName()}</p>
            
            <div className="w-full mt-10 pt-8 border-t border-border-subtle flex flex-col gap-4">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-500/5">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Detalles de la cuenta */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 shadow-glow">
            <h3 className="text-xl font-black text-text-primary mb-8 flex items-center gap-4 uppercase tracking-widest border-b border-border-subtle pb-6">
              <Briefcase className="text-cecyteq-orange" size={24} /> Expediente Digital
            </h3>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-subtle/30 pb-4">
                <span className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Nombre Legal</span>
                <span className="text-lg text-text-primary font-black tracking-tight">{getUserName()}</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-subtle/30 pb-4">
                <span className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Posición Institucional</span>
                <span className="text-lg text-text-primary font-black tracking-tight">{getRoleName()}</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-subtle/30 pb-4">
                <span className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Centro de Adscripción</span>
                <span className="text-lg text-text-primary font-black tracking-tight flex items-center gap-2">
                  <MapPin size={18} className="text-cecyteq-orange" /> CECYTEQ Plantel No. 5
                </span>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 shadow-glow">
            <h3 className="text-xl font-black text-text-primary mb-8 flex items-center gap-4 uppercase tracking-widest border-b border-border-subtle pb-6">
              <Shield className="text-cecyteq-green" size={24} /> Credenciales y Accesos
            </h3>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle/30 pb-6">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Email Institucional</span>
                  <div className="text-lg text-text-primary font-black tracking-tight flex items-center gap-3">
                    <Mail size={20} className="text-text-secondary/40"/> eduardosanchez@cecyteq.edu.mx
                  </div>
                </div>
                <span className="px-3 py-1 bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Verificado</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle/30 pb-6">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em]">Contraseña de Acceso</span>
                  <div className="text-lg text-text-primary font-black tracking-[0.3em] flex items-center gap-3">
                    <Key size={20} className="text-text-secondary/40"/> ••••••••••
                  </div>
                </div>
                <button className="px-4 py-2 bg-bg-main border border-border-subtle text-cecyteq-orange hover:bg-cecyteq-orange hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">Actualizar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
