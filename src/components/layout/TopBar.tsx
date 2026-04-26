"use client";

import React, { useEffect, useState } from 'react';
import { Bell, UserCircle } from 'lucide-react';

export default function TopBar() {
  const [role, setRole] = useState<string | null>(null);

 useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setRole(localStorage.getItem('userRole'));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const getRoleName = () => {
    switch(role) {
      case 'admin': return 'Dirección General';
      case 'docente': return 'Docente';
      case 'alumno': return 'Alumno';
      default: return 'Usuario';
    }
  };

  return (
    <header className="h-20 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Espacio para logo o título si es necesario */}
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-200">{getRoleName()}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
          <UserCircle size={38} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}