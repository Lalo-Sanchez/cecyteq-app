"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Bell, UserCircle, LogOut, Clock, Shield } from 'lucide-react';
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
      const interval = setInterval(loadNotif, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

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
    if (role === 'admin') return 'Eduardo Sánchez';
    if (role === 'docente') return 'Docente Titular';
    if (role === 'alumno') return 'Alumno CECYTEQ';
    return 'Usuario';
  };

  const getRoleName = () => {
    switch(role) {
      case 'admin': return 'Director General';
      case 'docente': return 'Docente';
      case 'alumno': return 'Estudiante';
      default: return 'Usuario';
    }
  };

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return (
    <header className="h-20 border-b border-border-subtle bg-bg-main/70 backdrop-blur-xl flex items-center justify-between px-8 lg:px-12 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Espacio para breadcrumbs o búsqueda futura */}
      </div>

      <div className="flex items-center gap-8">
        
        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className={`w-12 h-12 flex items-center justify-center transition-all rounded-2xl relative border ${showNotif ? 'bg-bg-surface border-cecyteq-orange text-cecyteq-orange shadow-glow' : 'text-text-secondary hover:text-cecyteq-orange border-border-subtle hover:bg-bg-surface'}`}
          >
            <Bell size={22} className={showNotif ? 'animate-bounce' : ''} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cecyteq-orange text-[9px] text-white flex items-center justify-center font-black rounded-lg border-2 border-bg-main shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotif && (
            <div className="absolute right-0 mt-4 w-96 bg-bg-surface border border-border-subtle rounded-[2rem] shadow-glow-lg overflow-hidden z-50 animate-scaleIn">
              <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-main/30">
                <h3 className="font-black text-text-primary uppercase tracking-widest text-xs">Notificaciones</h3>
                <span className="text-[9px] font-black uppercase tracking-tighter text-white bg-cecyteq-orange px-3 py-1 rounded-full">{unreadCount} Pendientes</span>
              </div>
              <div className="max-h-[30rem] overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <div className="p-12 text-center text-text-secondary/40 text-xs font-black uppercase tracking-widest italic">
                    Bandeja vacía
                  </div>
                ) : (
                  notificaciones.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarcarLeida(n.id)}
                      className={`p-6 border-b border-border-subtle/50 hover:bg-bg-main/50 transition-colors cursor-pointer flex gap-4 ${!n.leida ? 'bg-cecyteq-green/[0.03]' : 'opacity-40'}`}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.leida ? 'bg-cecyteq-green shadow-glow' : 'bg-text-secondary/20'}`}></div>
                      <div className="space-y-1">
                        <p className={`text-sm leading-relaxed ${!n.leida ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>{n.mensaje}</p>
                        <p className="text-[9px] text-text-secondary/60 font-black uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} className="text-cecyteq-orange" /> {new Date(n.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 text-center border-t border-border-subtle bg-bg-main/50">
                <button className="text-[10px] font-black uppercase tracking-widest text-cecyteq-green hover:text-cecyteq-green/80 transition-colors">Marcar todas como leídas</button>
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <Link href="/dashboard/perfil" className="flex items-center gap-4 border-l border-border-subtle pl-8 group cursor-pointer hover:opacity-90 transition-all">
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-text-primary tracking-tight group-hover:text-cecyteq-green transition-colors uppercase">{getUserName()}</p>
            <p className="text-[10px] text-cecyteq-orange font-black uppercase tracking-widest mt-0.5">{getRoleName()}</p>
          </div>
          <div className="relative">
            <div className="w-12 h-12 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center text-text-secondary group-hover:border-cecyteq-green group-hover:text-cecyteq-green transition-all shadow-inner">
              <UserCircle size={32} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cecyteq-green border-2 border-bg-main rounded-lg shadow-sm flex items-center justify-center">
               <Shield size={8} className="text-white" />
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}