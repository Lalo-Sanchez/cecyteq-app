"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, CheckCircle, GraduationCap, Briefcase, Bell, Award, AlertTriangle, Clock } from 'lucide-react';

import { logoutUser } from '@/actions/auth';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setRole(localStorage.getItem('userRole'));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
    }
    await logoutUser();
    router.push('/');
  };

  const [serviciosEscolaresAbiertos, setServiciosEscolaresAbiertos] = useState(false);
  const [serviciosDocentesAbiertos, setServiciosDocentesAbiertos] = useState(false);

  const adminMenu = [
    { id: '/dashboard', label: 'Panel de Control', icon: <LayoutDashboard size={20} /> },
    { id: '/dashboard/docentes', label: 'Servicios Docentes', icon: <Briefcase size={20} /> },
    { id: '/dashboard/tutor', label: 'Portal del Tutor', icon: <Users size={20} /> },
  ];

  const docenteMenu = [
    { id: '/dashboard', label: 'Mi Día', icon: <LayoutDashboard size={20} /> },
    { id: '/dashboard/aula', label: 'Aula Virtual', icon: <BookOpen size={20} /> },
    { id: '/dashboard/alumnos', label: 'Pase de Lista', icon: <CheckCircle size={20} /> },
    { id: '/dashboard/docentes/bitacoras', label: 'Bitácora', icon: <Clock size={20} /> },
  ];

  const alumnoMenu = [
    { id: '/dashboard', label: 'Mi Resumen', icon: <LayoutDashboard size={20} /> },
    { id: '/dashboard/aula', label: 'Aula Virtual', icon: <BookOpen size={20} /> },
    { id: '/dashboard/tramites', label: 'Kardex y Boletas', icon: <FileText size={20} /> },
  ];

  const menuItems = role === 'admin' ? adminMenu : role === 'docente' ? docenteMenu : alumnoMenu;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col h-full">
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-white leading-tight">CECYTEQ</h2>
          <p className="text-[10px] text-orange-400 tracking-widest uppercase">Powered by Lesty</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {role === 'admin' ? (
          <>
            <button
              onClick={() => router.push('/dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === '/dashboard' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium text-sm">Panel de Control</span>
            </button>

            <button
              onClick={() => setServiciosEscolaresAbiertos((prev) => !prev)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                serviciosEscolaresAbiertos ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Users size={20} />
              <span className="font-medium text-sm">Servicios Escolares</span>
            </button>

            {serviciosEscolaresAbiertos && (
              <div className="ml-8 space-y-1 mt-1">
                <button
                  onClick={() => router.push('/dashboard/alumnos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/alumnos' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <CheckCircle size={16} />
                  <span className="text-sm">Alumnos</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/tramites')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/tramites' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <FileText size={16} />
                  <span className="text-sm">Trámites</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/calificaciones')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/calificaciones' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Award size={16} />
                  <span className="text-sm">Calificaciones</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/reprobados')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/reprobados' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <AlertTriangle size={16} />
                  <span className="text-sm">Reprobados</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setServiciosDocentesAbiertos((prev) => !prev)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname.startsWith('/dashboard/docentes') || serviciosDocentesAbiertos ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase size={20} />
                <span className="font-medium text-sm">Servicios Docentes</span>
              </div>
              <span className="text-slate-400">{serviciosDocentesAbiertos ? '−' : '+'}</span>
            </button>

            {(serviciosDocentesAbiertos || pathname.startsWith('/dashboard/docentes')) && (
              <div className="ml-8 space-y-1 mt-1">
                <button
                  onClick={() => router.push('/dashboard/docentes')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Users size={16} />
                  <span className="text-sm">Resumen</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/grupos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/grupos' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Users size={16} />
                  <span className="text-sm">Grupos</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/docentes')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/docentes' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Briefcase size={16} />
                  <span className="text-sm">Docentes</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/materias')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/materias' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <BookOpen size={16} />
                  <span className="text-sm">Materias</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/avisos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/avisos' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Bell size={16} />
                  <span className="text-sm">Avisos</span>
                </button>
              </div>
            )}
          </>
        ) : (
          menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === item.id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <button
          onClick={() => router.push('/dashboard/perfil')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/dashboard/perfil' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Users size={20} />
          <span className="font-medium text-sm">Mi Perfil</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}