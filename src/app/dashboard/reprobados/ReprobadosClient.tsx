"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, FileDown, Filter, CheckCircle, RefreshCw, Star, BookOpen } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// ── Tipos ────────────────────────────────────────────────────────────────────
type Grupo = { id: number; nombre: string; };

type Reprobado = {
  id: number;
  materia: string;
  final: number | null;
  parcial1: number | null;
  parcial2: number | null;
  parcial3: number | null;
  alumno: {
    matricula: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    numeroLista: number;
    faltas: number;
  };
};

type MateriaReprobada = {
  id: number;
  materia: string;
  parcial1: number | null;
  parcial2: number | null;
  parcial3: number | null;
  final: number | null;
  tipoAccion: 'Recuperación' | 'Extraordinario' | 'Recursamiento';
};

type AlumnoConMaterias = {
  matricula: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroLista: number;
  faltas: number;
  tieneAsistencia: boolean; // ≥ 80% asistencia (faltas ≤ umbral)
  materias: Record<string, MateriaReprobada>;
};

interface Props {
  grupos: Grupo[];
  reprobados: Reprobado[];
  selectedGrupoId: string;
  totalReprobadosCount: number;
}

// ── Umbral de asistencia ──────────────────────────────────────────────────────
// Semestre de 50 sesiones por materia ≈ 10 faltas máximo para mantener 80%
const UMBRAL_FALTAS = 10;

// ── Calcular tipo de acción por materia ───────────────────────────────────────
function calcTipoAccion(
  p1: number | null, p2: number | null, p3: number | null,
  tieneAsistencia: boolean
): 'Recuperación' | 'Extraordinario' | 'Recursamiento' {
  if (!tieneAsistencia) return 'Recursamiento';

  const parciales = [p1, p2, p3].filter(p => p !== null) as number[];
  const aprobados = parciales.filter(p => p >= 6).length;

  if (aprobados >= 2) return 'Recuperación';
  return 'Extraordinario';
}

// ── Badge de acción ───────────────────────────────────────────────────────────
function AccionBadge({ tipo, matricula }: { tipo: 'Recuperación' | 'Extraordinario' | 'Recursamiento'; matricula: string }) {
  const config = {
    'Recuperación': {
      icon: <Star size={12} />,
      cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20',
      label: 'Recuperación',
      href: `/dashboard/tramites/nuevo?alumno=${matricula}&tipo=Recuperación`,
    },
    'Extraordinario': {
      icon: <BookOpen size={12} />,
      cls: 'bg-cecyteq-orange/10 text-cecyteq-orange border border-cecyteq-orange/30 hover:bg-cecyteq-orange/20',
      label: 'Extraordinario',
      href: `/dashboard/tramites/nuevo?alumno=${matricula}&tipo=Extraordinario`,
    },
    'Recursamiento': {
      icon: <RefreshCw size={12} />,
      cls: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
      label: 'Recursamiento',
      href: `/dashboard/tramites/nuevo?alumno=${matricula}&tipo=Recursamiento`,
    },
  }[tipo];

  return (
    <Link
      href={config.href}
      onClick={e => e.stopPropagation()}
      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap tracking-tighter ${config.cls}`}
      title={tipo}
    >
      {config.icon} {config.label}
    </Link>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ReprobadosClient({ grupos, reprobados, selectedGrupoId, totalReprobadosCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');

  // Materias únicas para el filtro
  const materiasUnicas = Array.from(new Set(reprobados.map(r => r.materia))).sort();

  const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    e.target.value ? params.set('grupo', e.target.value) : params.delete('grupo');
    setSelectedMateria('');
    router.push(`?${params.toString()}`);
  };

  // Filtrar por materia
  const reprobadosFiltrados = selectedMateria
    ? reprobados.filter(r => r.materia === selectedMateria)
    : reprobados;

  // ── Pivot: agrupar por alumno ─────────────────────────────────────────────
  const alumnosMap = new Map<string, AlumnoConMaterias>();

  for (const r of reprobadosFiltrados) {
    const key = r.alumno.matricula;
    const tieneAsistencia = r.alumno.faltas <= UMBRAL_FALTAS;
    if (!alumnosMap.has(key)) {
      alumnosMap.set(key, {
        matricula: r.alumno.matricula,
        nombres: r.alumno.nombres,
        apellidoPaterno: r.alumno.apellidoPaterno,
        apellidoMaterno: r.alumno.apellidoMaterno,
        numeroLista: r.alumno.numeroLista,
        faltas: r.alumno.faltas,
        tieneAsistencia,
        materias: {},
      });
    }
    const tipo = calcTipoAccion(r.parcial1, r.parcial2, r.parcial3, tieneAsistencia);
    alumnosMap.get(key)!.materias[r.materia] = {
      id: r.id,
      materia: r.materia,
      parcial1: r.parcial1,
      parcial2: r.parcial2,
      parcial3: r.parcial3,
      final: r.final,
      tipoAccion: tipo,
    };
  }

  // Filtrar por búsqueda
  const alumnosList = Array.from(alumnosMap.values()).filter(a => {
    const fullName = `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombres}`.toLowerCase();
    const s = searchTerm.toLowerCase();
    return fullName.includes(s) || a.matricula.toLowerCase().includes(s);
  }).sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));

  // Columnas de materias activas
  const columnMaterias = selectedMateria
    ? [selectedMateria]
    : Array.from(new Set(reprobados.map(r => r.materia))).sort();

  // ── Exportar Excel ────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (alumnosList.length === 0) { alert("No hay datos para exportar."); return; }

    const rows: Record<string, string | number>[] = [];
    for (const a of alumnosList) {
      const row: Record<string, string | number> = {
        "#": a.numeroLista,
        "Matrícula": a.matricula,
        "Apellido Paterno": a.apellidoPaterno,
        "Apellido Materno": a.apellidoMaterno,
        "Nombres": a.nombres,
        "Faltas": a.faltas,
        "Asistencia 80%": a.tieneAsistencia ? 'Sí' : 'No',
      };
      for (const mat of columnMaterias) {
        const cal = a.materias[mat];
        if (cal) {
          row[`${mat} - P1`] = cal.parcial1 ?? '-';
          row[`${mat} - P2`] = cal.parcial2 ?? '-';
          row[`${mat} - P3`] = cal.parcial3 ?? '-';
          row[`${mat} - Final`] = cal.final ?? '-';
          row[`${mat} - Acción`] = cal.tipoAccion;
        }
      }
      rows.push(row);
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const nombreGrupo = grupos.find(g => g.id.toString() === selectedGrupoId)?.nombre || 'General';
    XLSX.utils.book_append_sheet(wb, ws, `Reprobados-${nombreGrupo}`.substring(0, 31));
    XLSX.writeFile(wb, `Reporte_Reprobados_${nombreGrupo}_CECYTEQ.xlsx`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Barra de filtros */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-glow">
        <div className="flex flex-col md:flex-row gap-3 w-full flex-1 flex-wrap">
          <div className="relative w-full md:w-52">
            <Filter size={16} className="absolute inset-y-0 left-3 my-auto text-text-secondary pointer-events-none" />
            <select
              value={selectedGrupoId}
              onChange={handleGrupoChange}
              className="w-full bg-bg-main border border-border-subtle text-text-primary text-sm rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:border-cecyteq-green outline-none font-bold"
            >
              <option value="">Todos los grupos</option>
              {grupos.map(g => <option key={g.id} value={g.id.toString()}>{g.nombre}</option>)}
            </select>
          </div>

          <div className="relative w-full md:w-52">
            <Filter size={16} className="absolute inset-y-0 left-3 my-auto text-text-secondary pointer-events-none" />
            <select
              value={selectedMateria}
              onChange={e => setSelectedMateria(e.target.value)}
              disabled={materiasUnicas.length === 0}
              className="w-full bg-bg-main border border-border-subtle text-text-primary text-sm rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:border-cecyteq-green outline-none disabled:opacity-50 font-bold"
            >
              <option value="">Todas las materias</option>
              {materiasUnicas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute inset-y-0 left-3 my-auto text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-bg-main border border-border-subtle text-text-primary text-sm rounded-xl pl-9 py-2.5 focus:border-cecyteq-green outline-none font-bold"
            />
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={alumnosList.length === 0}
          className="shrink-0 w-full md:w-auto bg-cecyteq-green/10 hover:bg-cecyteq-green text-cecyteq-green hover:text-white border border-cecyteq-green/30 disabled:opacity-20 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          <FileDown size={18} /> Excel
        </button>
      </div>

      {/* Leyenda de tipos de acción */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-bg-surface border border-border-subtle text-amber-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          <Star size={12} /> Recuperación
        </div>
        <div className="flex items-center gap-2 bg-bg-surface border border-border-subtle text-cecyteq-orange px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          <BookOpen size={12} /> Extraordinario
        </div>
        <div className="flex items-center gap-2 bg-bg-surface border border-border-subtle text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          <RefreshCw size={12} /> Recursamiento
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center gap-3 text-sm text-text-secondary font-medium px-2">
        <span className="font-black text-3xl text-text-primary tracking-tighter">{alumnosList.length}</span>
        <span className="uppercase tracking-widest text-[10px] font-black">alumnos en riesgo académico</span>
        {selectedMateria && <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 text-xs font-bold">"{selectedMateria}"</span>}
      </div>

      {/* Tabla pivotada */}
      {alumnosList.length === 0 ? (
        <div className="bg-bg-surface/50 border border-border-subtle rounded-3xl p-16 text-center shadow-inner">
          <div className="w-20 h-20 bg-cecyteq-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-cecyteq-green" size={40} />
          </div>
          <p className="text-xl text-text-primary font-black tracking-tight uppercase">Todo en orden</p>
          <p className="text-text-secondary mt-2 font-medium">No se detectaron alumnos en riesgo con estos filtros.</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-subtle rounded-[2rem] overflow-hidden shadow-glow">
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-bg-main border-b border-border-subtle">
                <tr className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                  <th rowSpan={2} className="px-6 py-4 border-r border-border-subtle text-center">#</th>
                  <th rowSpan={2} className="px-6 py-4 border-r border-border-subtle">Matrícula</th>
                  <th rowSpan={2} className="px-6 py-4 border-r border-border-subtle min-w-[200px]">Estudiante</th>
                  <th rowSpan={2} className="px-6 py-4 text-center border-r border-border-subtle w-20">Faltas</th>
                  {columnMaterias.map(mat => (
                    <th key={mat} colSpan={5} className="px-3 py-3 text-center font-black text-cecyteq-orange border-r border-border-subtle bg-bg-surface">
                      {mat}
                    </th>
                  ))}
                </tr>
                <tr className="text-[9px] font-black uppercase tracking-widest bg-bg-main/80 text-text-secondary">
                  {columnMaterias.map(mat => (
                    <React.Fragment key={mat}>
                      <th className="px-3 py-3 text-center border-b border-border-subtle">P1</th>
                      <th className="px-3 py-3 text-center border-b border-border-subtle">P2</th>
                      <th className="px-3 py-3 text-center border-b border-border-subtle">P3</th>
                      <th className="px-3 py-3 text-center font-black text-red-500 border-b border-border-subtle">Fin</th>
                      <th className="px-3 py-3 text-center border-r border-border-subtle border-b border-border-subtle">Acción</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle text-text-primary">
                {alumnosList.map(alumno => (
                  <tr key={alumno.matricula} className="group hover:bg-bg-main/50 transition-colors">
                    <td className="px-6 py-4 text-text-secondary font-bold text-center border-r border-border-subtle">{alumno.numeroLista}</td>
                    <td className="px-6 py-4 font-black text-xs text-cecyteq-green tracking-wider border-r border-border-subtle">{alumno.matricula}</td>
                    <td className="px-6 py-4 font-bold uppercase border-r border-border-subtle group-hover:text-cecyteq-green transition-colors">
                      {alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}
                    </td>
                    <td className={`px-6 py-4 text-center font-black border-r border-border-subtle ${alumno.tieneAsistencia ? 'text-cecyteq-green' : 'text-red-500'}`}>
                      {alumno.faltas}
                      <span className={`ml-2 text-[9px] ${alumno.tieneAsistencia ? 'text-cecyteq-green/50' : 'text-red-500/50'}`}>
                        {alumno.tieneAsistencia ? '✓' : '✗'}
                      </span>
                    </td>

                    {columnMaterias.map(mat => {
                      const cal = alumno.materias[mat];
                      if (!cal) return (
                        <React.Fragment key={mat}>
                          <td className="px-3 py-4 text-center text-text-secondary/20">—</td>
                          <td className="px-3 py-4 text-center text-text-secondary/20">—</td>
                          <td className="px-3 py-4 text-center text-text-secondary/20">—</td>
                          <td className="px-3 py-4 text-center text-text-secondary/20">—</td>
                          <td className="px-3 py-4 text-center text-text-secondary/20 border-r border-border-subtle">—</td>
                        </React.Fragment>
                      );
                      return (
                        <React.Fragment key={mat}>
                          <td className="px-3 py-4 text-center font-medium">{cal.parcial1 ?? '—'}</td>
                          <td className="px-3 py-4 text-center font-medium">{cal.parcial2 ?? '—'}</td>
                          <td className="px-3 py-4 text-center font-medium">{cal.parcial3 ?? '—'}</td>
                          <td className="px-3 py-4 text-center font-black text-cecyteq-red bg-cecyteq-red/5">
                            {cal.final !== null ? cal.final.toFixed(1) : '—'}
                          </td>
                          <td className="px-3 py-3 text-center border-r border-border-subtle">
                            <AccionBadge tipo={cal.tipoAccion} matricula={alumno.matricula} />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
