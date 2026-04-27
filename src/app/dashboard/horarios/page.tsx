import React from 'react';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Clock, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function HorariosPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get('userRole')?.value;
  const userId = cookieStore.get('userId')?.value;

  if (role !== 'alumno' || !userId) {
    return (
      <div className="p-12 text-center bg-bg-main min-h-screen">
        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Acceso Denegado</h2>
        <p className="text-text-secondary mt-2">Solo los alumnos pueden consultar su horario personalizado.</p>
        <Link href="/dashboard" className="text-cecyteq-green hover:underline mt-4 inline-block font-bold">Volver al Dashboard</Link>
      </div>
    );
  }

  const user = await prisma.usuario.findUnique({
    where: { id: Number(userId) },
    include: {
      alumno: {
        include: {
          grupoRel: {
            include: {
              docenteGrupos: {
                include: { docente: true, materia: true }
              }
            }
          }
        }
      }
    }
  });

  const alumno = user?.alumno;
  if (!alumno || !alumno.grupoRel) {
    return (
      <div className="p-12 text-center bg-bg-main min-h-screen">
        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Horario no disponible</h2>
        <p className="text-text-secondary mt-2">No tienes un grupo asignado o no se pudo cargar tu horario.</p>
      </div>
    );
  }

  const materias = alumno.grupoRel.docenteGrupos;
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  
  // Generar horario simulado basado en el turno
  const horasMatutino = ['07:00 - 08:40', '08:40 - 10:20', '10:20 - 10:50 (RECESO)', '10:50 - 12:30', '12:30 - 14:10'];
  const horasVespertino = ['14:00 - 15:40', '15:40 - 17:20', '17:20 - 17:50 (RECESO)', '17:50 - 19:30', '19:30 - 21:10'];
  
  const horas = alumno.turno === 'Matutino' ? horasMatutino : horasVespertino;

  // Distribuir materias simuladamente
  const horarioMatriz: any[][] = horas.map((hora, hIdx) => {
    return diasSemana.map((dia, dIdx) => {
      if (hIdx === 2) return { tipo: 'receso', nombre: 'Receso Institucional' };
      if (materias.length === 0) return { tipo: 'libre', nombre: 'Módulo Libre' };
      // Pseudo-random basado en los índices para distribuir las materias del grupo
      const mat = materias[(hIdx + dIdx) % materias.length];
      return { 
        tipo: 'clase', 
        nombre: mat.materia.nombre, 
        docente: `${mat.docente.nombres} ${mat.docente.apellidos}`
      };
    });
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeInUp">
      <div className="bg-bg-surface border border-border-subtle rounded-[3rem] p-10 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <CalendarIcon size={120} className="text-cecyteq-green" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="bg-cecyteq-green/10 text-cecyteq-green text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl w-fit border border-cecyteq-green/20">
              Ciclo Escolar 2024-2025
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tighter uppercase leading-tight">Horario de Clases</h1>
            <p className="text-text-secondary font-medium text-lg flex items-center gap-2">
               <Clock size={20} className="text-cecyteq-orange" /> {alumno.turno} · Grupo: <strong className="text-white">{alumno.grupo}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-glow">
        <div className="overflow-x-auto p-6 lg:p-10">
          <table className="w-full text-left min-w-[800px] border-collapse">
            <thead className="bg-bg-main/50 border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Horario</th>
                {diasSemana.map(dia => (
                  <th key={dia} className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] text-center">{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {horas.map((hora, hIdx) => (
                <tr key={hora} className={hIdx === 2 ? 'bg-bg-main/30' : 'group hover:bg-bg-main/20 transition-colors'}>
                  <td className="px-6 py-6 border-r border-border-subtle">
                    <p className="text-xs font-black text-text-primary tracking-wider whitespace-nowrap">{hora.split('(')[0]}</p>
                    {hIdx === 2 && <p className="text-[9px] text-cecyteq-orange uppercase font-black tracking-widest mt-1">Receso</p>}
                  </td>
                  {horarioMatriz[hIdx].map((clase, dIdx) => (
                    <td key={dIdx} className="px-6 py-6 text-center border-r border-border-subtle/50 last:border-0 relative">
                      {clase.tipo === 'receso' ? (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(240,108,34,0.05),transparent)] flex items-center justify-center">
                          <span className="text-cecyteq-orange/40 text-xs font-black uppercase tracking-[0.3em] rotate-[-15deg]">Receso Institucional</span>
                        </div>
                      ) : clase.tipo === 'clase' ? (
                        <div className="flex flex-col items-center justify-center space-y-2 h-full">
                          <BookOpen size={16} className="text-cecyteq-green/60 mb-1" />
                          <p className="font-black text-text-primary text-xs uppercase tracking-tight leading-tight group-hover:text-cecyteq-green transition-colors">{clase.nombre}</p>
                          <p className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{clase.docente}</p>
                        </div>
                      ) : (
                        <span className="text-text-secondary/30 text-[10px] font-black uppercase tracking-widest">Módulo Libre</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
