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
      <div className="bg-cecyteq-green/10 border border-cecyteq-green/20 rounded-[2.5rem] p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <CheckCircle2 className="mx-auto text-cecyteq-green mb-4" size={48} />
        <h3 className="text-2xl font-black text-text-primary tracking-tight uppercase">¡Solicitud Registrada!</h3>
        <p className="text-text-secondary mt-2 font-medium">El trámite ha sido ingresado correctamente al sistema.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Datos del Alumno (Read-only) */}
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 shadow-inner">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-6 ml-1">Ficha del Alumno</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] text-text-secondary font-black uppercase">Estudiante</p>
            <p className="text-text-primary font-bold">{alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-text-secondary font-black uppercase">Matrícula</p>
            <p className="text-cecyteq-green font-black tracking-wider">{alumno.matricula}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-text-secondary font-black uppercase">Grupo / Turno</p>
            <p className="text-text-primary font-bold">{alumno.grupoRel?.nombre || alumno.grupo} · {alumno.turno}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-text-secondary font-black uppercase">Faltas</p>
            <p className={`font-black ${alumno.faltas > 10 ? 'text-cecyteq-orange' : 'text-cecyteq-green'}`}>{alumno.faltas} asistencias</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Tipo de trámite</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3.5 text-text-primary outline-none transition focus:border-cecyteq-green font-bold appearance-none"
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

        <div className="space-y-2">
          <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Motivo de la solicitud</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="h-32 w-full rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3.5 text-text-primary outline-none transition focus:border-cecyteq-green font-medium resize-none"
            placeholder="Describe brevemente el motivo..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Observaciones adicionales</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="h-24 w-full rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3.5 text-text-primary outline-none transition focus:border-cecyteq-green font-medium resize-none"
            placeholder="Opcional..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm font-bold animate-shake">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-bg-surface px-6 py-4 text-xs font-black uppercase tracking-widest text-text-secondary transition hover:bg-bg-main"
        >
          <ArrowLeft size={16} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-cecyteq-green px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cecyteq-green/20 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isPending ? 'Procesando...' : 'Confirmar Solicitud'}
        </button>
      </div>
    </form>
  );
}
