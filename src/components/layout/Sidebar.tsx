"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, CheckCircle, Briefcase, Bell, Award, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

import { logoutUser } from '@/actions/auth';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      const userRole = (session.user as any).role;
      setRole(userRole);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', (session.user as any).id);
      }
    } else if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole'));
    }
  }, [session]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    }
    await logoutUser(); // Limpia cookies personalizadas
    await signOut({ callbackUrl: '/' }); // Limpia sesión de NextAuth y redirige
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
    <aside className="w-64 bg-bg-surface border-r border-border-subtle hidden md:flex flex-col h-full">
      <div className="h-24 flex items-center gap-3 px-6 border-b border-border-subtle bg-bg-main/20">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl p-1 group transition-transform hover:scale-110">
          <img src="/cecyteq_logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-black text-lg text-text-primary leading-none tracking-tighter">CECyTEQ 5</h2>
          <p className="text-[9px] text-cecyteq-orange font-black tracking-[0.3em] uppercase mt-1">By Lesty</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {role === 'admin' ? (
          <>
            <button
              onClick={() => router.push('/dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === '/dashboard' ? 'bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 font-black' : 'text-text-secondary hover:bg-bg-main/50 hover:text-text-primary border border-transparent font-bold'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="text-xs uppercase tracking-widest">Panel de Control</span>
            </button>

            <button
              onClick={() => setServiciosEscolaresAbiertos((prev) => !prev)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                serviciosEscolaresAbiertos ? 'bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 font-black' : 'text-text-secondary hover:bg-bg-main/50 hover:text-text-primary border border-transparent font-bold'
              }`}
            >
              <Users size={20} />
              <span className="text-xs uppercase tracking-widest">Servicios Escolares</span>
            </button>

            {serviciosEscolaresAbiertos && (
              <div className="ml-8 space-y-1 mt-1 border-l border-border-subtle/50 pl-2">
                <button
                  onClick={() => router.push('/dashboard/alumnos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/alumnos' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <CheckCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Alumnos</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/tramites')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/tramites' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <FileText size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Trámites</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/calificaciones')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/calificaciones' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Award size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Calificaciones</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/reprobados')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/reprobados' ? 'text-cecyteq-orange font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Reprobados</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setServiciosDocentesAbiertos((prev) => !prev)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname.startsWith('/dashboard/docentes') || serviciosDocentesAbiertos ? 'bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 font-black' : 'text-text-secondary hover:bg-bg-main/50 hover:text-text-primary border border-transparent font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase size={20} />
                <span className="text-xs uppercase tracking-widest">Servicios Docentes</span>
              </div>
              <span className="text-[10px]">{serviciosDocentesAbiertos ? '▲' : '▼'}</span>
            </button>

            {(serviciosDocentesAbiertos || pathname.startsWith('/dashboard/docentes')) && (
              <div className="ml-8 space-y-1 mt-1 border-l border-border-subtle/50 pl-2">
                <button
                  onClick={() => router.push('/dashboard/docentes')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Resumen</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/grupos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/grupos' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Users size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Grupos</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/docentes')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/docentes' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Briefcase size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Docentes</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/materias')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/materias' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <BookOpen size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Materias</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/docentes/avisos')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    pathname === '/dashboard/docentes/avisos' ? 'text-cecyteq-green font-black' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Bell size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Avisos</span>
                </button>
              </div>
            )}

            <button
              onClick={() => router.push('/dashboard/administracion')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === '/dashboard/administracion' ? 'bg-cecyteq-orange/10 text-cecyteq-orange border border-cecyteq-orange/20 font-black' : 'text-text-secondary hover:bg-bg-main/50 hover:text-text-primary border border-transparent font-bold'
              }`}
            >
              <ShieldCheck size={20} />
              <span className="text-xs uppercase tracking-widest">Administración</span>
            </button>
          </>
        ) : (
          menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === item.id ? 'bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 font-black' : 'text-text-secondary hover:bg-bg-main/50 hover:text-text-primary border border-transparent font-bold'
              }`}
            >
              {item.icon}
              <span className="text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))
        )}
      </nav>

      <div className="p-4 border-t border-border-subtle space-y-1 bg-bg-main/10">
        <button
          onClick={() => router.push('/dashboard/perfil')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/dashboard/perfil' ? 'bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 font-black' : 'text-text-secondary hover:bg-bg-main/50 hover:text-text-primary border border-transparent font-bold'
          }`}
        >
          <Users size={20} />
          <span className="text-xs uppercase tracking-widest">Mi Perfil</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all font-bold group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-widest">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}