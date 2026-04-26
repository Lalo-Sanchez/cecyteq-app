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
      cls: 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20',
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
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${config.cls}`}
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
    <div className="space-y-6">
      {/* Barra de filtros */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full flex-1 flex-wrap">
          <div className="relative w-full md:w-52">
            <Filter size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
            <select
              value={selectedGrupoId}
              onChange={handleGrupoChange}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Todos los grupos</option>
              {grupos.map(g => <option key={g.id} value={g.id.toString()}>{g.nombre}</option>)}
            </select>
          </div>

          <div className="relative w-full md:w-52">
            <Filter size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
            <select
              value={selectedMateria}
              onChange={e => setSelectedMateria(e.target.value)}
              disabled={materiasUnicas.length === 0}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
            >
              <option value="">Todas las materias</option>
              {materiasUnicas.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={alumnosList.length === 0}
          className="shrink-0 w-full md:w-auto bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 disabled:opacity-40 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FileDown size={18} /> Exportar Excel
        </button>
      </div>

      {/* Leyenda de tipos de acción */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg">
          <Star size={12} /> <strong>Recuperación</strong> — 80%+ asistencia y ≥ 2 parciales aprobados
        </div>
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-lg">
          <BookOpen size={12} /> <strong>Extraordinario</strong> — 80%+ asistencia y ≥ 2 parciales reprobados
        </div>
        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg">
          <RefreshCw size={12} /> <strong>Recursamiento</strong> — Menos del 80% de asistencia
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="font-bold text-2xl text-white">{alumnosList.length}</span>
        <span>alumnos con materias reprobadas</span>
        {selectedMateria && <span>en <strong className="text-red-400">"{selectedMateria}"</strong></span>}
      </div>

      {/* Tabla pivotada */}
      {alumnosList.length === 0 ? (
        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <p className="text-lg text-slate-300 font-semibold">¡Excelente!</p>
          <p className="text-slate-500 mt-1">No hay alumnos reprobados para este criterio.</p>
        </div>
      ) : (
        <div className="bg-slate-950/50 border border-red-900/30 rounded-2xl overflow-hidden shadow-glow">
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-slate-900 border-b border-red-900/40 shadow-sm">
                {/* Fila 1: identidad + nombre de materia + Asistencia */}
                <tr className="text-slate-400">
                  <th rowSpan={2} className="px-4 py-3 font-medium border-r border-slate-800">#</th>
                  <th rowSpan={2} className="px-4 py-3 font-medium border-r border-slate-800">Matrícula</th>
                  <th rowSpan={2} className="px-4 py-3 font-medium border-r border-slate-800 min-w-[180px]">Nombre Completo</th>
                  <th rowSpan={2} className="px-4 py-3 font-medium text-center border-r border-slate-800 w-16">Faltas</th>
                  {columnMaterias.map(mat => (
                    <th key={mat} colSpan={5} className="px-3 py-2 text-center font-semibold text-red-400 border-r border-slate-800 border-b border-slate-700 bg-red-950/20">
                      {mat}
                    </th>
                  ))}
                </tr>
                {/* Fila 2: P1 P2 P3 Final Acción por materia */}
                <tr className="text-slate-500 bg-slate-900/80">
                  {columnMaterias.map(mat => (
                    <React.Fragment key={mat}>
                      <th className="px-3 py-2 text-center font-medium w-10">P1</th>
                      <th className="px-3 py-2 text-center font-medium w-10">P2</th>
                      <th className="px-3 py-2 text-center font-medium w-10">P3</th>
                      <th className="px-3 py-2 text-center font-bold w-14 text-red-400">Final</th>
                      <th className="px-3 py-2 text-center font-medium w-28 border-r border-slate-800">Acción</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {alumnosList.map(alumno => (
                  <tr key={alumno.matricula} className="hover:bg-red-900/10 transition-colors">
                    <td className="px-4 py-3 text-slate-500 border-r border-slate-800/50">{alumno.numeroLista}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 border-r border-slate-800/50">{alumno.matricula}</td>
                    <td className="px-4 py-3 font-semibold uppercase border-r border-slate-800/50">
                      {alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}
                    </td>
                    {/* Columna de faltas con indicador de semáforo */}
                    <td className={`px-4 py-3 text-center font-bold border-r border-slate-800/50 ${alumno.tieneAsistencia ? 'text-emerald-400' : 'text-red-400'}`}>
                      {alumno.faltas}
                      <span className={`ml-1 text-[9px] ${alumno.tieneAsistencia ? 'text-emerald-600' : 'text-red-600'}`}>
                        {alumno.tieneAsistencia ? '✓' : '✗'}
                      </span>
                    </td>

                    {columnMaterias.map(mat => {
                      const cal = alumno.materias[mat];
                      if (!cal) return (
                        <React.Fragment key={mat}>
                          <td className="px-3 py-3 text-center text-slate-700">—</td>
                          <td className="px-3 py-3 text-center text-slate-700">—</td>
                          <td className="px-3 py-3 text-center text-slate-700">—</td>
                          <td className="px-3 py-3 text-center text-slate-700">—</td>
                          <td className="px-3 py-3 text-center text-slate-700 border-r border-slate-800/50">—</td>
                        </React.Fragment>
                      );
                      return (
                        <React.Fragment key={mat}>
                          <td className="px-3 py-3 text-center">{cal.parcial1 ?? '—'}</td>
                          <td className="px-3 py-3 text-center">{cal.parcial2 ?? '—'}</td>
                          <td className="px-3 py-3 text-center">{cal.parcial3 ?? '—'}</td>
                          <td className="px-3 py-3 text-center font-bold text-red-400">
                            {cal.final !== null ? cal.final.toFixed(1) : '—'}
                          </td>
                          <td className="px-3 py-2 text-center border-r border-slate-800/50">
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
