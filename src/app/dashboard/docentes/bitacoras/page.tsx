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
      // Nota: En un sistema real, buscaríamos el docenteId asociado al usuarioId
      // Aquí simplificamos asumiendo que el ID de usuario docente coincide o se mapea
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bitácora Digital</h1>
          <p className="text-slate-400 text-sm mt-1">Registra tu entrada y salida del plantel para el control de asistencia docente.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
          <Calendar size={18} className="text-emerald-400" />
          <span className="text-white font-medium">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel de Acción */}
        <div className="bg-slate-950/80 border border-slate-800/60 rounded-[2.5rem] p-10 shadow-glow flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 shadow-xl">
            <Clock size={40} className="text-emerald-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">¿Qué acción deseas realizar?</h2>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Último registro: <span className="text-emerald-400">{lastAction || 'Ninguno'}</span></p>
          </div>

          <div className="grid grid-cols-1 w-full gap-4">
            <button
              onClick={() => handleRegistro('Entrada')}
              disabled={isPending || lastAction === 'Entrada'}
              className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                lastAction === 'Entrada' 
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
              Marcar Entrada
            </button>

            <button
              onClick={() => handleRegistro('Salida')}
              disabled={isPending || lastAction === 'Salida' || !lastAction}
              className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                lastAction === 'Salida' || !lastAction
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20 active:scale-95'
              }`}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <LogOut size={20} />}
              Marcar Salida
            </button>
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-[2.5rem] p-8 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <History size={20} className="text-slate-400" />
            <h3 className="font-bold text-white uppercase text-xs tracking-widest">Actividad Reciente</h3>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {historial.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-600 text-sm italic">No hay registros hoy.</p>
              </div>
            ) : (
              historial.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${item.tipo === 'Entrada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                      {item.tipo === 'Entrada' ? <LogIn size={16} /> : <LogOut size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.tipo}</p>
                      <p className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-slate-300">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 justify-end">
                      <CheckCircle size={10} /> Registrado
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
