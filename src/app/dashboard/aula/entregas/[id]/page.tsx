import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import CalificarEntregaForm from './CalificarEntregaForm';
import EnviarEntregaForm from './EnviarEntregaForm';

export default async function EntregasTareaPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const tareaId = Number(id);

  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value || 'alumno';
  const userId = cookieStore.get('userId')?.value;

  // 1. Obtener la tarea y sus entregas
  const tarea = await prisma.tarea.findUnique({
    where: { id: tareaId },
    include: {
      grupo: true,
      entregas: {
        include: { alumno: true },
        orderBy: { entregadoEn: 'desc' }
      }
    }
  });

  if (!tarea) {
    return (
      <div className="p-12 text-center bg-bg-main min-h-screen">
        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Tarea no encontrada</h2>
        <Link href="/dashboard/aula" className="text-cecyteq-green hover:underline mt-4 inline-block font-bold">Volver al aula virtual</Link>
      </div>
    );
  }

  // Comportamiento para alumno
  if (role === 'alumno') {
    if (!userId) return <div>No autorizado</div>;

    const user = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      include: { alumno: true }
    });

    if (!user || !user.alumno) return <div>No se encontró tu expediente de alumno.</div>;

    const entregaPrevia = tarea.entregas.find(e => e.alumnoId === user.alumno!.id);

    return (
      <div className="space-y-8 animate-fadeInUp">
        <Link href="/dashboard/aula" className="inline-flex items-center gap-2 text-text-secondary hover:text-cecyteq-green transition-all text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={14} /> Volver al Aula Virtual
        </Link>

        <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 shadow-glow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="space-y-3">
              <div className="bg-cecyteq-orange/10 text-cecyteq-orange text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl w-fit border border-cecyteq-orange/20">
                Detalles de Tarea
              </div>
              <h1 className="text-4xl font-black text-text-primary leading-tight tracking-tight">{tarea.titulo}</h1>
              <p className="text-text-secondary font-medium">{tarea.grupo.nombre} · {tarea.materia}</p>
            </div>
            
            <div className="flex gap-4">
               {entregaPrevia ? (
                 <div className="bg-cecyteq-green/10 border border-cecyteq-green/20 px-6 py-4 rounded-[1.5rem] text-center min-w-[140px]">
                   <p className="text-[10px] text-cecyteq-green uppercase font-black tracking-widest mb-2">Estatus</p>
                   <p className="text-xl font-black text-cecyteq-green flex items-center justify-center gap-2"><CheckCircle size={20}/> Entregada</p>
                 </div>
               ) : (
                 <div className="bg-bg-main border border-border-subtle px-6 py-4 rounded-[1.5rem] text-center shadow-inner min-w-[140px]">
                   <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-2">Estatus</p>
                   <p className="text-xl font-black text-text-secondary flex items-center justify-center gap-2"><Clock size={20}/> Pendiente</p>
                 </div>
               )}
            </div>
          </div>
          
          <div className="mb-10 p-6 bg-bg-main/50 rounded-3xl border border-border-subtle">
            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4">Instrucciones</h3>
            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{tarea.descripcion || 'Sin instrucciones adicionales.'}</p>
          </div>

          <EnviarEntregaForm 
            tareaId={tarea.id} 
            alumnoId={user.alumno.id} 
            entregaPrevia={entregaPrevia} 
          />

          {entregaPrevia?.calificacion !== null && entregaPrevia?.calificacion !== undefined && (
            <div className="mt-8 bg-cecyteq-green/5 border border-cecyteq-green/20 rounded-3xl p-6">
               <h3 className="text-xl font-black text-cecyteq-green uppercase tracking-tight mb-2">Calificación: {entregaPrevia.calificacion}</h3>
               {entregaPrevia.retroalimentacion && (
                 <p className="text-text-primary text-sm italic">"{entregaPrevia.retroalimentacion}"</p>
               )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Comportamiento para Docente/Admin
  const alumnosGrupo = await prisma.alumno.findMany({
    where: { grupoId: tarea.grupoId },
    orderBy: { apellidoPaterno: 'asc' }
  });

  const entregasMap = new Map(tarea.entregas.map(e => [e.alumnoId, e]));

  return (
    <div className="space-y-8 animate-fadeInUp">
      <Link href="/dashboard/aula" className="inline-flex items-center gap-2 text-text-secondary hover:text-cecyteq-green transition-all text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={14} /> Volver al Aula Virtual
      </Link>

      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 shadow-glow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="space-y-3">
            <div className="bg-cecyteq-green/10 text-cecyteq-green text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl w-fit border border-cecyteq-green/20">
              Revisión de Actividades
            </div>
            <h1 className="text-4xl font-black text-text-primary leading-tight tracking-tight">{tarea.titulo}</h1>
            <p className="text-text-secondary font-medium">{tarea.grupo.nombre} · {tarea.materia}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-bg-main border border-border-subtle px-6 py-4 rounded-[1.5rem] text-center shadow-inner min-w-[140px]">
              <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-2">Entregas</p>
              <p className="text-2xl font-black text-cecyteq-green">{tarea.entregas.length}<span className="text-text-secondary/40 text-sm"> / {alumnosGrupo.length}</span></p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border-subtle bg-bg-main/30 shadow-inner">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-bg-main/50 text-text-secondary text-[10px] font-black uppercase tracking-widest border-b border-border-subtle">
              <tr>
                <th className="px-6 py-5 font-black">Estudiante</th>
                <th className="px-6 py-5 font-black text-center">Estatus</th>
                <th className="px-6 py-5 font-black text-center">Fecha de Entrega</th>
                <th className="px-6 py-5 font-black text-center">Calificación</th>
                <th className="px-6 py-5 font-black text-right">Calificar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-primary">
              {alumnosGrupo.map(alumno => {
                const entrega = entregasMap.get(alumno.id);
                return (
                  <tr key={alumno.id} className="group hover:bg-bg-main transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-bg-main border border-border-subtle rounded-xl flex items-center justify-center text-[10px] font-black text-text-secondary group-hover:text-cecyteq-green group-hover:border-cecyteq-green transition-all">
                          {alumno.apellidoPaterno[0]}{alumno.nombres[0]}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary leading-none mb-1 group-hover:text-cecyteq-green transition-colors">{alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}</p>
                          <p className="text-[10px] text-text-secondary font-black tracking-wider uppercase">{alumno.matricula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {entrega ? (
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-cecyteq-green bg-cecyteq-green/10 px-3 py-1.5 rounded-full border border-cecyteq-green/20">
                          <CheckCircle size={10} /> RECIBIDO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-text-secondary/60 bg-bg-main px-3 py-1.5 rounded-full border border-border-subtle">
                          <Clock size={10} /> PENDIENTE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center text-xs font-medium text-text-secondary">
                      {entrega ? new Date(entrega.entregadoEn).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {entrega?.calificacion !== null && entrega?.calificacion !== undefined ? (
                        <span className="text-xl font-black text-cecyteq-orange tracking-tighter">{entrega.calificacion}</span>
                      ) : (
                        <span className="text-text-secondary/30 font-black">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {entrega ? (
                        <CalificarEntregaForm entrega={entrega} />
                      ) : (
                        <span className="text-text-secondary/20 text-[10px] font-black uppercase tracking-widest italic">Sin entrega</span>
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
