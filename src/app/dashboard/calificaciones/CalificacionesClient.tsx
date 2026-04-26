"use client";

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, ChevronRight, FileDown, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { actualizarCalificaciones, type CalifInput } from '@/actions/calificaciones';
// jsPDF se importa dinámicamente para evitar SSR issues


// ── Tipos ────────────────────────────────────────────────────────────────────
type Grupo = { id: number; nombre: string; };

type CalRow = {
  id: number;
  materia: string;
  parcial1: number | null;
  parcial2: number | null;
  parcial3: number | null;
  final: number | null;
};

type AlumnoPivot = {
  matricula: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroLista: number;
  calificaciones: CalRow[];
  promedio: number | null;
};

interface Props {
  grupos: Grupo[];
  calificaciones: {
    id: number;
    materia: string;
    parcial1: number | null;
    parcial2: number | null;
    parcial3: number | null;
    final: number | null;
    alumno: {
      matricula: string;
      nombres: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      numeroLista: number;
    };
  }[];
  selectedGrupoId: string;
  autoExpandMatricula?: string;
}

// ── Helper: promedio de finales ───────────────────────────────────────────────
// Auto-calcular final cuando los 3 parciales están completos
function autoFinal(p1: number | null, p2: number | null, p3: number | null): number | null {
  if (p1 === null || p2 === null || p3 === null) return null;
  return Math.round(((p1 + p2 + p3) / 3) * 10) / 10;
}

function calcPromedio(califs: CalRow[]): number | null {
  const conFinal = califs.filter(c => c.final !== null);
  if (conFinal.length === 0) return null;
  return conFinal.reduce((sum, c) => sum + c.final!, 0) / conFinal.length;
}

// ── Fila de alumno expandible ─────────────────────────────────────────────────
function AlumnoRow({ alumno, grupoNombre, defaultOpen = false }: {
  alumno: AlumnoPivot;
  grupoNombre: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<CalRow[]>(alumno.calificaciones.map(c => ({ ...c })));
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const promedioDraft = calcPromedio(draft);

  const setVal = (calId: number, field: keyof CalifInput, raw: string) => {
    // Validar rango 0.0 – 10.0
    let parsed: number | null = raw === '' ? null : parseFloat(raw);
    if (parsed !== null) {
      if (isNaN(parsed)) parsed = null;
      else if (parsed < 0) parsed = 0;
      else if (parsed > 10) parsed = 10;
      // Redondear a 1 decimal
      else parsed = Math.round(parsed * 10) / 10;
    }
    setDraft(prev => prev.map(c => {
      if (c.id !== calId) return c;
      const updated = { ...c, [field]: parsed };
      if (field !== 'final') {
        const p1 = field === 'parcial1' ? parsed : updated.parcial1;
        const p2 = field === 'parcial2' ? parsed : updated.parcial2;
        const p3 = field === 'parcial3' ? parsed : updated.parcial3;
        const auto = autoFinal(p1, p2, p3);
        if (auto !== null) updated.final = auto;
      }
      return updated;
    }));
    setStatus('idle');
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload: CalifInput[] = draft.map(c => ({
        id: c.id,
        parcial1: c.parcial1,
        parcial2: c.parcial2,
        parcial3: c.parcial3,
        final: c.final,
      }));
      const res = await actualizarCalificaciones(payload);
      setStatus(res.ok ? 'ok' : 'error');
    });
  };

  // ── Boleta PDF ────────────────────────────────────────────────────────────
  const handleBoletaPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const promGeneral = calcPromedio(draft);
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.toLocaleDateString('es-MX', { month: 'long' });
    const anio = hoy.getFullYear();
    const fechaStr = `Querétaro, Qro., a ${dia} de ${mes} de ${anio}`;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // ── Marca de agua: se dibuja PRIMERO para quedar detrás de todo ──────────
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(38);
    doc.setFont('helvetica', 'bold');
    for (let y = 20; y < H + 20; y += 38) {
      for (let x = 5; x < W + 20; x += 72) {
        doc.text('OFICIAL', x, y, { angle: 45, renderingMode: 'fill' });
      }
    }
    // Restaurar color para el resto del documento
    doc.setTextColor(40, 40, 40);

    // ── Encabezado institucional ──────────────────────────────────────────
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('COORDINACIÓN DE ORGANISMOS DESCENTRALIZADOS ESTATALES DE CECyTEs', W / 2, 14, { align: 'center' });
    doc.text('COLEGIO DE ESTUDIOS CIENTÍFICOS Y TECNOLÓGICOS DEL ESTADO QUERÉTARO', W / 2, 18, { align: 'center' });
    doc.text('CCT PLANTEL CECYTEQ NO. 5 CERRITO COLORADO - QUERÉTARO', W / 2, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.text('BOLETA DEL ALUMNO', W / 2, 27, { align: 'center' });

    // Línea separadora
    doc.setDrawColor(180, 180, 180);
    doc.line(14, 30, W - 14, 30);

    // ── Datos del alumno (izquierda) y fecha+matrícula (derecha) ──────────
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const nombreCompleto = `${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombres}`;
    doc.setFont('helvetica', 'bold');
    doc.text(`Alumno(a): `, 14, 36);
    doc.setFont('helvetica', 'normal');
    doc.text(nombreCompleto, 14 + doc.getTextWidth('Alumno(a): '), 36);

    doc.setFont('helvetica', 'bold');
    doc.text('Bachillerato General: ', 14, 41);
    doc.setFont('helvetica', 'normal');
    doc.text('TÉCNICO EN PROGRAMACIÓN', 14 + doc.getTextWidth('Bachillerato General: '), 41);

    doc.setFont('helvetica', 'bold');
    doc.text('Grupo: ', 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(`${grupoNombre}`, 14 + doc.getTextWidth('Grupo: '), 46);

    // Derecha — cada dato en su propia línea, alineado a la derecha
    doc.setFont('helvetica', 'normal');
    doc.text(fechaStr, W - 14, 36, { align: 'right' });
    // Matrícula en una sola llamada para evitar que se apelotone
    doc.setFont('helvetica', 'bold');
    doc.text(`Matrícula: ${alumno.matricula}`, W - 14, 41, { align: 'right' });

    // ── Tabla de calificaciones ───────────────────────────────────────────
    const body = draft.map((c, i) => {
      const fin = c.final !== null ? c.final
        : (c.parcial1 !== null && c.parcial2 !== null && c.parcial3 !== null
          ? Math.round(((c.parcial1 + c.parcial2 + c.parcial3) / 3) * 10) / 10
          : null);
      const estatus = fin === null ? 'En Curso' : fin >= 6 ? 'Aprobado' : 'REPROBADO';
      return [
        (i + 1).toString(),
        c.materia,
        c.parcial1 !== null ? c.parcial1.toFixed(1) : '',
        c.parcial2 !== null ? c.parcial2.toFixed(1) : '',
        c.parcial3 !== null ? c.parcial3.toFixed(1) : '',
        '',  // C (Extra)
        '',  // EXT
        fin !== null ? fin.toFixed(1) : '',
        estatus,
      ];
    });

    // Fila de promedios
    body.push([
      '', 'PROMEDIOS GENERALES', '', '', '', '', '',
      promGeneral !== null ? promGeneral.toFixed(1) : '',
      '',
    ]);

    autoTable(doc, {
      startY: 51,
      head: [[
        '#', 'Asignatura', 'P1', 'P2', 'P3', 'C / EXT', 'IT / RC',
        'Final', 'Estatus',
      ]],
      body,
      styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
      headStyles: {
        fillColor: [34, 177, 76],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 14 },
        3: { halign: 'center', cellWidth: 14 },
        4: { halign: 'center', cellWidth: 14 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 18 },
        7: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        8: { halign: 'center', cellWidth: 22 },
      },
      // Colorear reprobados en rojo
      didParseCell(data) {
        if (data.row.index < draft.length) {
          const fin = draft[data.row.index]?.final;
          if (data.column.index === 7 && fin !== null && fin < 6) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.column.index === 8 && fin !== null && fin < 6) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Fila de promedios
        if (data.row.index === draft.length) {
          data.cell.styles.fillColor = [240, 240, 240];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [20, 20, 20];
        }
      },
      margin: { left: 14, right: 14 },
    });


    // ── Firma del director ────────────────────────────────────────────────
    const finalY = (doc as any).lastAutoTable?.finalY ?? 160;
    const firmaY = finalY + 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.line(W / 2 - 40, firmaY, W / 2 + 40, firmaY);
    doc.text('Director(a) del Plantel', W / 2, firmaY + 5, { align: 'center' });
    doc.text('CECYTEQ No. 5 Cerrito Colorado', W / 2, firmaY + 9, { align: 'center' });

    const nombreArchivo = `Boleta_${alumno.nombres}_${alumno.apellidoPaterno}_${alumno.apellidoMaterno}`
      .normalize('NFD').replace(/[̀-ͯ]/g, '')  // quitar acentos
      .replace(/[^a-zA-Z0-9_-]/g, '_')           // caracteres seguros
      .replace(/_+/g, '_');                       // evitar doble guion
    doc.save(`${nombreArchivo}.pdf`);
  };


  const promedioColor = promedioDraft === null
    ? 'text-slate-500'
    : promedioDraft >= 6 ? 'text-emerald-400' : 'text-red-400';

  return (
    <>
      {/* Fila compacta */}
      <tr
        onClick={() => setOpen(o => !o)}
        className="cursor-pointer hover:bg-slate-800/40 transition-colors border-b border-slate-800/50"
      >
        <td className="px-5 py-3 text-slate-500 text-sm">{alumno.numeroLista}</td>
        <td className="px-5 py-3 font-mono text-slate-400 text-xs">{alumno.matricula}</td>
        <td className="px-5 py-3 font-semibold text-slate-200 uppercase text-sm">
          {alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}
        </td>
        <td className={`px-5 py-3 text-center font-bold text-base ${promedioColor}`}>
          {promedioDraft !== null ? promedioDraft.toFixed(1) : '—'}
        </td>
        <td className="px-5 py-3 text-center">
          {open
            ? <ChevronDown size={18} className="text-orange-400 mx-auto" />
            : <ChevronRight size={18} className="text-slate-500 mx-auto" />
          }
        </td>
      </tr>

      {/* Expansión con calificaciones editables */}
      {open && (
        <tr>
          <td colSpan={5} className="bg-slate-900/60 border-b-2 border-orange-500/20 px-0">
            <div className="px-6 py-5 space-y-4">
              {/* Encabezado del panel */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <p className="text-base font-bold text-white uppercase">
                    {alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}
                  </p>
                  <p className="text-xs text-slate-500">Matrícula: {alumno.matricula}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {status === 'ok' && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 size={14} /> Guardado
                    </span>
                  )}
                  {status === 'error' && (
                    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                      <AlertCircle size={14} /> Error al guardar
                    </span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleBoletaPDF(); }}
                    className="flex items-center gap-1.5 text-xs bg-orange-900/40 hover:bg-orange-900/60 text-orange-300 border border-orange-700/40 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FileDown size={14} /> Boleta PDF
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleSave(); }}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isPending ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </div>

              {/* Tabla editable de materias */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Materia</th>
                      <th className="px-3 py-2.5 text-center font-medium w-20">Parcial 1</th>
                      <th className="px-3 py-2.5 text-center font-medium w-20">Parcial 2</th>
                      <th className="px-3 py-2.5 text-center font-medium w-20">Parcial 3</th>
                      <th className="px-3 py-2.5 text-center font-medium w-20">Final</th>
                      <th className="px-3 py-2.5 text-center font-medium w-24">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {draft.map(cal => {
                      const isRep = cal.final !== null && cal.final < 6;
                      const isAp = cal.final !== null && cal.final >= 6;
                      return (
                        <tr key={cal.id} className="hover:bg-slate-800/20">
                          <td className="px-4 py-2 font-medium text-orange-400">{cal.materia}</td>
                          {(['parcial1', 'parcial2', 'parcial3', 'final'] as const).map(field => (
                            <td key={field} className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={cal[field] ?? ''}
                                onClick={e => e.stopPropagation()}
                                onChange={e => { e.stopPropagation(); setVal(cal.id, field, e.target.value); }}
                                className={`w-16 text-center bg-slate-900 border rounded-lg px-2 py-1 text-white outline-none transition-colors focus:ring-1 ${
                                  field === 'final'
                                    ? isRep
                                      ? 'border-red-500/50 focus:ring-red-500'
                                      : isAp
                                        ? 'border-emerald-500/50 focus:ring-emerald-500'
                                        : 'border-slate-700 focus:ring-orange-500'
                                    : 'border-slate-700 focus:ring-orange-500'
                                }`}
                                placeholder="—"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center">
                            {cal.final === null
                              ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-700">En Curso</span>
                              : isAp
                                ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Aprobado</span>
                                : <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Reprobado</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CalificacionesClient({
  grupos, calificaciones, selectedGrupoId, autoExpandMatricula = ''
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Si viene una matrícula desde Alumnos, pre-filtrar por ella
  const [searchTerm, setSearchTerm] = useState(autoExpandMatricula || '');

  const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    e.target.value ? params.set('grupo', e.target.value) : params.delete('grupo');
    // Limpiar el filtro de alumno al cambiar de grupo
    params.delete('alumno');
    setSearchTerm('');
    router.push(`?${params.toString()}`);
  };

  // ── Pivot: agrupar por alumno ───────────────────────────────────────────
  const alumnosMap = new Map<string, AlumnoPivot>();
  for (const c of calificaciones) {
    const key = c.alumno.matricula;
    if (!alumnosMap.has(key)) {
      alumnosMap.set(key, {
        matricula: c.alumno.matricula,
        nombres: c.alumno.nombres,
        apellidoPaterno: c.alumno.apellidoPaterno,
        apellidoMaterno: c.alumno.apellidoMaterno,
        numeroLista: c.alumno.numeroLista,
        calificaciones: [],
        promedio: null,
      });
    }
    alumnosMap.get(key)!.calificaciones.push({
      id: c.id,
      materia: c.materia,
      parcial1: c.parcial1,
      parcial2: c.parcial2,
      parcial3: c.parcial3,
      final: c.final,
    });
  }

  // Calcular promedio general
  for (const a of alumnosMap.values()) {
    a.promedio = calcPromedio(a.calificaciones);
    a.calificaciones.sort((x, y) => x.materia.localeCompare(y.materia));
  }

  // Filtrar + ordenar
  const alumnosList = Array.from(alumnosMap.values())
    .filter(a => {
      const s = searchTerm.toLowerCase();
      return `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombres} ${a.matricula}`.toLowerCase().includes(s);
    })
    .sort((a, b) => a.numeroLista - b.numeroLista || a.apellidoPaterno.localeCompare(b.apellidoPaterno));

  const nombreGrupo = grupos.find(g => g.id.toString() === selectedGrupoId)?.nombre || 'Grupo';

  // ── Exportar Excel de todo el grupo ────────────────────────────────────
  const handleExportGrupo = () => {
    if (alumnosList.length === 0) return;
    const materias = Array.from(new Set(calificaciones.map(c => c.materia))).sort();
    const rows = alumnosList.map(a => {
      const row: Record<string, string | number> = {
        "#": a.numeroLista, "Matrícula": a.matricula,
        "Apellido Paterno": a.apellidoPaterno,
        "Apellido Materno": a.apellidoMaterno,
        "Nombres": a.nombres,
        "Promedio General": a.promedio !== null ? parseFloat(a.promedio.toFixed(1)) : '-',
      };
      for (const mat of materias) {
        const cal = a.calificaciones.find(c => c.materia === mat);
        row[`${mat}-P1`] = cal?.parcial1 ?? '-';
        row[`${mat}-P2`] = cal?.parcial2 ?? '-';
        row[`${mat}-P3`] = cal?.parcial3 ?? '-';
        row[`${mat}-Final`] = cal?.final ?? '-';
      }
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Califs-${nombreGrupo}`.substring(0, 31));
    XLSX.writeFile(wb, `Calificaciones_${nombreGrupo}_CECYTEQ.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Barra de filtros */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full flex-1 flex-wrap">
          <div className="relative w-full md:w-64">
            <Filter size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
            <select
              value={selectedGrupoId}
              onChange={handleGrupoChange}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Seleccione un Grupo…</option>
              {grupos.map(g => <option key={g.id} value={g.id.toString()}>{g.nombre}</option>)}
            </select>
          </div>

          {selectedGrupoId && (
            <input
              type="text"
              placeholder="Buscar alumno…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[180px] bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          )}
        </div>

        <button
          onClick={handleExportGrupo}
          disabled={!selectedGrupoId || alumnosList.length === 0}
          className="shrink-0 w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <FileDown size={18} /> Exportar Grupo
        </button>
      </div>

      {/* Aviso sin grupo */}
      {!selectedGrupoId && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm flex gap-3 items-start">
          <Filter size={20} className="shrink-0 mt-0.5" />
          <p>Selecciona un <strong>grupo</strong> para ver y editar las calificaciones de sus alumnos.</p>
        </div>
      )}

      {/* Tabla compacta acordeón */}
      {selectedGrupoId && (
        <>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-bold text-2xl text-white">{alumnosList.length}</span>
            <span>alumnos en {nombreGrupo} — haz clic en una fila para editar sus calificaciones</span>
          </div>

          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden shadow-glow">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs">
                <tr>
                  <th className="px-5 py-3 text-left font-medium w-16">#</th>
                  <th className="px-5 py-3 text-left font-medium w-32">Matrícula</th>
                  <th className="px-5 py-3 text-left font-medium">Nombre Completo</th>
                  <th className="px-5 py-3 text-center font-medium w-28">Promedio Gral.</th>
                  <th className="px-5 py-3 text-center font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {alumnosList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No se encontraron alumnos.
                    </td>
                  </tr>
                ) : (
                  alumnosList.map(alumno => (
                    <AlumnoRow
                      key={alumno.matricula}
                      alumno={alumno}
                      grupoNombre={nombreGrupo}
                      defaultOpen={autoExpandMatricula !== '' && alumno.matricula === autoExpandMatricula}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
