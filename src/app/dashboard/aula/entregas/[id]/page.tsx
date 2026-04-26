import React from 'react';
import { prisma } from '@/lib/prisma';
import { FileText, ArrowLeft, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import CalificarEntregaForm from './CalificarEntregaForm';

export default async function EntregasTareaPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const tareaId = Number(id);

  // 1. Obtener la tarea y sus entregas
  const tarea = await prisma.tarea.findUnique({
    where: { id: tareaId },
    include: {
      grupo: true,
      entregas: {
        include: {
          alumno: true
        },
        orderBy: { entregadoEn: 'desc' }
      }
    }
  });

  if (!tarea) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Tarea no encontrada</h2>
        <Link href="/dashboard/aula" className="text-cyan-400 hover:underline mt-4 inline-block">Volver al aula</Link>
      </div>
    );
  }

  // 2. Obtener lista total de alumnos del grupo para ver quién falta
  const alumnosGrupo = await prisma.alumno.findMany({
    where: { grupoId: tarea.grupoId },
    orderBy: { apellidoPaterno: 'asc' }
  });

  // Mapear entregas por alumnoId para facilitar búsqueda
  const entregasMap = new Map(tarea.entregas.map(e => [e.alumnoId, e]));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/aula" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft size={16} /> Volver al Aula Virtual
      </Link>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg w-fit mb-3">
              Revisión de Actividades
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight">{tarea.titulo}</h1>
            <p className="text-slate-400 mt-1">{tarea.grupo.nombre} · {tarea.materia}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[100px]">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Entregas</p>
              <p className="text-xl font-bold text-cyan-400">{tarea.entregas.length}<span className="text-slate-600 text-sm"> / {alumnosGrupo.length}</span></p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Alumno</th>
                <th className="px-4 py-3 font-medium text-center">Estado</th>
                <th className="px-4 py-3 font-medium text-center">Fecha de Entrega</th>
                <th className="px-4 py-3 font-medium text-center">Calificación</th>
                <th className="px-4 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {alumnosGrupo.map(alumno => {
                const entrega = entregasMap.get(alumno.id);
                return (
                  <tr key={alumno.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {alumno.apellidoPaterno[0]}{alumno.nombres[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-none mb-1">{alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{alumno.matricula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {entrega ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle size={10} /> ENTREGADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50">
                          <Clock size={10} /> PENDIENTE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-slate-500">
                      {entrega ? new Date(entrega.entregadoEn).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-4 text-center font-bold">
                      {entrega?.calificacion !== null && entrega?.calificacion !== undefined ? (
                        <span className="text-cyan-400">{entrega.calificacion}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {entrega ? (
                        <CalificarEntregaForm entrega={entrega} />
                      ) : (
                        <button disabled className="text-slate-700 text-xs font-semibold">Sin archivo</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
