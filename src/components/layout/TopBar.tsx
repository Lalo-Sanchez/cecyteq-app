"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Bell, UserCircle, Settings, LogOut, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getNotificaciones, marcarComoLeida } from '@/actions/notifications';

export default function TopBar() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('userRole'));
      setUserId(localStorage.getItem('userId'));
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const loadNotif = async () => {
        const res = await getNotificaciones(Number(userId));
        if (res.success) {
          setNotificaciones(res.notificaciones || []);
        }
      };
      loadNotif();
      // Polling cada 30 segundos
      const interval = setInterval(loadNotif, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarcarLeida = async (id: number) => {
    const res = await marcarComoLeida(id);
    if (res.success) {
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    }
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

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return (
    <header className="h-20 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
      <div className="flex items-center gap-4">
      </div>

      <div className="flex items-center gap-6">
        
        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className={`p-2 transition-colors rounded-full relative ${showNotif ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center font-bold rounded-full border-2 border-slate-950">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-glow overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-semibold text-white">Notificaciones</h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">{unreadCount} Nuevas</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No tienes notificaciones pendientes.
                  </div>
                ) : (
                  notificaciones.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarcarLeida(n.id)}
                      className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer flex gap-3 ${!n.leida ? 'bg-emerald-500/5' : 'opacity-60'}`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.leida ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                      <div>
                        <p className={`text-sm ${!n.leida ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>{n.mensaje}</p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={10} /> {new Date(n.creadoEn).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 text-center border-t border-slate-800 bg-slate-950/50">
                <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Ver todas</button>
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <Link href="/dashboard/perfil" className="flex items-center gap-3 border-l border-slate-800 pl-6 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{getUserName()}</p>
            <p className="text-xs text-slate-500 font-medium">{getRoleName()}</p>
          </div>
          <div className="relative">
            <UserCircle size={40} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
          </div>
        </Link>
      </div>
    </header>
  );
}