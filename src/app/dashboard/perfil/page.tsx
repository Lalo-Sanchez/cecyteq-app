"use client";

import React, { useEffect, useState } from 'react';
import { UserCircle, Mail, Briefcase, Key, Shield, LogOut } from 'lucide-react';
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
    if (role === 'admin') return 'Lalo Diaz';
    if (role === 'docente') return 'Docente Titular';
    if (role === 'alumno') return 'Alumno CECYTEQ';
    return 'Usuario';
  };

  const getRoleName = () => {
    switch(role) {
      case 'admin': return 'Director General';
      case 'docente': return 'Docente';
      case 'alumno': return 'Alumno';
      default: return 'Usuario';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
        <p className="text-slate-400 text-sm mt-1">Administra tu información personal y configuración de cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Identidad */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 shadow-glow flex flex-col items-center text-center">
            <div className="relative mb-4">
              <UserCircle size={96} className="text-slate-400" />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-slate-950 rounded-full"></div>
            </div>
            <h3 className="text-xl font-bold text-white">{getUserName()}</h3>
            <p className="text-emerald-400 font-medium text-sm mb-4">{getRoleName()}</p>
            
            <div className="w-full pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20">
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Detalles de la cuenta */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 shadow-glow">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Briefcase className="text-orange-400" size={20} /> Información Institucional
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 text-sm">Nombre Completo</span>
                <span className="col-span-2 text-slate-200 font-medium">{getUserName()}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 text-sm">Cargo Oficial</span>
                <span className="col-span-2 text-slate-200 font-medium">{getRoleName()}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 text-sm">Plantel</span>
                <span className="col-span-2 text-slate-200 font-medium">CECYTEQ Menchaca</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 shadow-glow">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Shield className="text-emerald-400" size={20} /> Seguridad y Accesos
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 text-sm">Correo Institucional</span>
                <div className="col-span-2 flex justify-between items-center">
                  <span className="text-slate-200 font-medium flex items-center gap-2"><Mail size={16} className="text-slate-500"/> admin@cecyteq.edu.mx</span>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 text-sm">Contraseña</span>
                <div className="col-span-2 flex justify-between items-center">
                  <span className="text-slate-200 font-medium flex items-center gap-2"><Key size={16} className="text-slate-500"/> ••••••••••</span>
                  <button className="text-xs text-orange-400 hover:underline">Cambiar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
