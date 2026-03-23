"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, CheckCircle, GraduationCap, Briefcase } from 'lucide-react';

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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
    }
    router.push('/');
  };

  const adminMenu = [
    { id: '/dashboard', label: 'Panel de Control', icon: <LayoutDashboard size={20} /> },
    { id: '/dashboard/alumnos', label: 'Servicios Escolares', icon: <Users size={20} /> },
    { id: '/dashboard/docentes', label: 'Servicios Docentes', icon: <Briefcase size={20} /> },
    { id: '/dashboard/tramites', label: 'Trámites y Reportes', icon: <FileText size={20} /> },
  ];

  const docenteMenu = [
    { id: '/dashboard', label: 'Mi Día', icon: <LayoutDashboard size={20} /> },
    { id: '/dashboard/aula', label: 'Aula Virtual', icon: <BookOpen size={20} /> },
    { id: '/dashboard/alumnos', label: 'Pase de Lista', icon: <CheckCircle size={20} /> },
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
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-white leading-tight">CECYTEQ</h2>
          <p className="text-[10px] text-blue-400 tracking-widest uppercase">Powered by Lesty</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
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