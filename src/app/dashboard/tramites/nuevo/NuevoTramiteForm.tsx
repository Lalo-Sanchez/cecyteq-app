"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { crearTramite } from '@/actions/tramites';

interface Props {
  alumno: any;
  initialTipo: string;
}

export default function NuevoTramiteForm({ alumno, initialTipo }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [tipo, setTipo] = useState(initialTipo || 'Kardex');
  const [motivo, setMotivo] = useState(
    initialTipo === 'Recuperación' ? 'Regularización por bajo rendimiento en parciales.' :
    initialTipo === 'Extraordinario' ? 'Examen extraordinario por materias no aprobadas.' :
    initialTipo === 'Recursamiento' ? 'Recursamiento de materia por falta de asistencia o reprobación definitiva.' : ''
  );
  const [observaciones, setObservaciones] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await crearTramite({
        alumnoId: alumno.id,
        tipo,
        motivo,
        observaciones,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/tramites');
        }, 2000);
      } else {
        setError(res.error);
      }
    });
  };

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[1.75rem] p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-white">¡Trámite Creado!</h3>
        <p className="text-slate-400 mt-2">La solicitud ha sido registrada correctamente. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos del Alumno (Read-only) */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Información del Alumno</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">Nombre</p>
            <p className="text-slate-200 font-medium">{alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Matrícula</p>
            <p className="text-cyan-400 font-mono">{alumno.matricula}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Grupo / Turno</p>
            <p className="text-slate-200">{alumno.grupoRel?.nombre || alumno.grupo} · {alumno.turno}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Faltas registradas</p>
            <p className={`font-bold ${alumno.faltas > 10 ? 'text-red-400' : 'text-emerald-400'}`}>{alumno.faltas}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-[0.15em] ml-1">Tipo de trámite</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
            required
          >
            <option value="Recuperación">Recuperación</option>
            <option value="Extraordinario">Extraordinario</option>
            <option value="Recursamiento">Recursamiento</option>
            <option value="Kardex">Kardex</option>
            <option value="Boleta">Boleta</option>
            <option value="Cambio de Turno">Cambio de Turno</option>
            <option value="Constancia">Constancia</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-[0.15em] ml-1">Motivo de la solicitud</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="mt-2 h-28 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 resize-none"
            placeholder="Describe brevemente el motivo..."
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase tracking-[0.15em] ml-1">Observaciones adicionales</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="mt-2 h-20 w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 resize-none"
            placeholder="Opcional..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/50 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={18} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isPending ? 'Guardando Solicitud...' : 'Confirmar y Crear Trámite'}
        </button>
      </div>
    </form>
  );
}
