"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Clock, LogIn, LogOut, History, CheckCircle, Loader2, Calendar } from 'lucide-react';
import { registrarAcceso, getBitacorasDocente } from '@/actions/bitacoras';

export default function BitacorasPage() {
  const [isPending, startTransition] = useTransition();
  const [docenteId, setDocenteId] = useState<number | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [lastAction, setLastAction] = useState<'Entrada' | 'Salida' | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      setDocenteId(Number(id));
      loadHistorial(Number(id));
    }
  }, []);

  const loadHistorial = async (id: number) => {
    const res = await getBitacorasDocente(id);
    if (res.success && res.bitacoras) {
      setHistorial(res.bitacoras);
      if (res.bitacoras.length > 0) {
        setLastAction(res.bitacoras[0].tipo as 'Entrada' | 'Salida');
      }
    }
  };

  const handleRegistro = (tipo: 'Entrada' | 'Salida') => {
    if (!docenteId) return;

    startTransition(async () => {
      const res = await registrarAcceso(docenteId, tipo);
      if (res.success) {
        loadHistorial(docenteId);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeInUp">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase">Bitácora Digital</h1>
          <p className="text-text-secondary font-medium mt-2">Control de asistencia institucional y registro de jornada académica.</p>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-bg-surface border border-border-subtle px-6 py-3 rounded-2xl shadow-sm">
          <Calendar size={20} className="text-cecyteq-green" />
          <span className="text-text-primary font-black uppercase text-[10px] tracking-widest">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Panel de Acción */}
        <div className="bg-bg-surface border border-border-subtle rounded-[3rem] p-12 shadow-glow flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cecyteq-green/5 rounded-full blur-[80px]" />
          
          <div className="w-24 h-24 bg-bg-main rounded-[2rem] flex items-center justify-center border border-border-subtle shadow-inner group transition-transform hover:scale-105">
            <Clock size={48} className="text-cecyteq-green group-hover:text-cecyteq-orange transition-colors" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">Registro de Jornada</h2>
            <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em]">Último Estado: <span className={lastAction === 'Entrada' ? 'text-cecyteq-green' : 'text-cecyteq-orange'}>{lastAction || 'Sin registro'}</span></p>
          </div>

          <div className="grid grid-cols-1 w-full gap-5">
            <button
              onClick={() => handleRegistro('Entrada')}
              disabled={isPending || lastAction === 'Entrada'}
              className={`flex items-center justify-center gap-4 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl ${
                lastAction === 'Entrada' 
                ? 'bg-bg-main text-text-secondary/30 border border-border-subtle cursor-not-allowed' 
                : 'bg-cecyteq-green hover:bg-cecyteq-green/90 text-white shadow-cecyteq-green/20 active:scale-95'
              }`}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <LogIn size={22} />}
              Entrada
            </button>

            <button
              onClick={() => handleRegistro('Salida')}
              disabled={isPending || lastAction === 'Salida' || !lastAction}
              className={`flex items-center justify-center gap-4 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl ${
                lastAction === 'Salida' || !lastAction
                ? 'bg-bg-main text-text-secondary/30 border border-border-subtle cursor-not-allowed' 
                : 'bg-cecyteq-orange hover:bg-cecyteq-orange/90 text-white shadow-cecyteq-orange/20 active:scale-95'
              }`}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <LogOut size={22} />}
              Salida
            </button>
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="bg-bg-surface border border-border-subtle rounded-[3rem] p-10 shadow-glow flex flex-col">
          <div className="flex items-center gap-4 mb-8 border-b border-border-subtle pb-6">
            <History size={24} className="text-text-secondary/40" />
            <h3 className="font-black text-text-primary uppercase text-xs tracking-[0.25em]">Actividad Reciente</h3>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
            {historial.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-secondary/40 text-sm font-black uppercase tracking-widest italic">Sin registros registrados</p>
              </div>
            ) : (
              historial.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between p-6 bg-bg-main/30 border border-border-subtle rounded-[1.5rem] group hover:bg-bg-main/50 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.tipo === 'Entrada' ? 'bg-cecyteq-green/10 text-cecyteq-green border-cecyteq-green/20' : 'bg-cecyteq-orange/10 text-cecyteq-orange border-cecyteq-orange/20'}`}>
                      {item.tipo === 'Entrada' ? <LogIn size={20} /> : <LogOut size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-primary uppercase tracking-tight">{item.tipo}</p>
                      <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1">{new Date(item.timestamp).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xl font-black text-text-primary tracking-tighter">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[9px] text-cecyteq-green font-black uppercase tracking-[0.2em] flex items-center gap-1 justify-end">
                      <CheckCircle size={10} /> Sincronizado
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
