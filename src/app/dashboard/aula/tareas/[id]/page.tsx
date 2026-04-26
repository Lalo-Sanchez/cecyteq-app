import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { FileText, ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import Link from 'next/link';
import EntregaTareaForm from './EntregaTareaForm';

export default async function DetalleTareaPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const tareaId = Number(id);

  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value || 'alumno';

  // 1. Obtener datos de la tarea
  const tarea = await prisma.tarea.findUnique({
    where: { id: tareaId },
    include: {
      grupo: true,
      docente: true,
    }
  });

  if (!tarea) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Tarea no encontrada</h2>
        <Link href="/dashboard/aula" className="text-orange-400 hover:underline mt-4 inline-block">Volver al aula</Link>
      </div>
    );
  }

  // 2. Simular obtención de alumno actual
  const mockAlumno = await prisma.alumno.findFirst({
    where: { usuario: { rol: { nombre: 'alumno' } } }
  });

  // 3. Verificar si ya hay una entrega
  const entregaExistente = mockAlumno ? await prisma.entregaTarea.findUnique({
    where: {
      tareaId_alumnoId: {
        tareaId: tarea.id,
        alumnoId: mockAlumno.id
      }
    }
  }) : null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/aula" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Volver al Aula Virtual
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Detalles de la Tarea */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg w-fit mb-3">
                  {tarea.materia}
                </div>
                <h1 className="text-3xl font-bold text-white leading-tight">{tarea.titulo}</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <User size={18} className="text-emerald-400/60" />
                <span>Docente: <strong className="text-slate-200">{tarea.docente.nombres} {tarea.docente.apellidos}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={18} className="text-amber-400/60" />
                <span>Fecha de Entrega: <strong className="text-slate-200">
                  {tarea.fechaVencimiento ? new Date(tarea.fechaVencimiento).toLocaleDateString() : 'Sin fecha límite'}
                </strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={18} className="text-emerald-400/60" />
                <span>Grupo: <strong className="text-slate-200">{tarea.grupo.nombre}</strong></span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {tarea.descripcion || 'No hay instrucciones adicionales para esta actividad.'}
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Estado de la Entrega */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-glow">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="text-orange-400" size={20} /> Tu Trabajo
            </h3>
            
            {entregaExistente ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                  <p className="text-emerald-400 font-bold text-sm">✓ Tarea Entregada</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(entregaExistente.entregadoEn).toLocaleString()}
                  </p>
                </div>
                
                {entregaExistente.calificacion !== null ? (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Calificación</p>
                    <p className="text-3xl font-black text-white">{entregaExistente.calificacion}<span className="text-lg text-slate-500">/10</span></p>
                    {entregaExistente.retroalimentacion && (
                      <div className="mt-3 pt-3 border-t border-orange-500/20">
                        <p className="text-xs text-slate-500 italic">"{entregaExistente.retroalimentacion}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-400">Esperando revisión del docente...</p>
                  </div>
                )}
              </div>
            ) : (
              <EntregaTareaForm tareaId={tarea.id} alumnoId={mockAlumno?.id || 0} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
