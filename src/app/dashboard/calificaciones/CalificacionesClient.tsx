"use client";

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, ChevronRight, FileDown, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { actualizarCalificaciones, type CalifInput } from '@/actions/calificaciones';

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

function autoFinal(p1: number | null, p2: number | null, p3: number | null): number | null {
  if (p1 === null || p2 === null || p3 === null) return null;
  return Math.round(((p1 + p2 + p3) / 3) * 10) / 10;
}

function calcPromedio(califs: CalRow[]): number | null {
  const conFinal = califs.filter(c => c.final !== null);
  if (conFinal.length === 0) return null;
  return conFinal.reduce((sum, c) => sum + c.final!, 0) / conFinal.length;
}

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
    let parsed: number | null = raw === '' ? null : parseFloat(raw);
    if (parsed !== null) {
      if (isNaN(parsed)) parsed = null;
      else if (parsed < 0) parsed = 0;
      else if (parsed > 10) parsed = 10;
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

    doc.setTextColor(245, 245, 245);
    doc.setFontSize(38);
    doc.setFont('helvetica', 'bold');
    for (let y = 20; y < H + 20; y += 38) {
      for (let x = 5; x < W + 20; x += 72) {
        doc.text('OFICIAL', x, y, { angle: 45 });
      }
    }
    doc.setTextColor(40, 40, 40);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('COORDINACIÓN DE ORGANISMOS DESCENTRALIZADOS ESTATALES DE CECyTEs', W / 2, 14, { align: 'center' });
    doc.text('COLEGIO DE ESTUDIOS CIENTÍFICOS Y TECNOLÓGICOS DEL ESTADO QUERÉTARO', W / 2, 18, { align: 'center' });
    doc.text('CCT PLANTEL CECYTEQ NO. 5 CERRITO COLORADO - QUERÉTARO', W / 2, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.text('BOLETA DEL ALUMNO', W / 2, 27, { align: 'center' });

    doc.setDrawColor(180, 180, 180);
    doc.line(14, 30, W - 14, 30);

    doc.setFontSize(8);
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

    doc.text(fechaStr, W - 14, 36, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`Matrícula: ${alumno.matricula}`, W - 14, 41, { align: 'right' });

    const body = draft.map((c, i) => {
      const fin = c.final !== null ? c.final : (c.parcial1 !== null && c.parcial2 !== null && c.parcial3 !== null ? Math.round(((c.parcial1 + c.parcial2 + c.parcial3) / 3) * 10) / 10 : null);
      const estatus = fin === null ? 'En Curso' : fin >= 6 ? 'Aprobado' : 'REPROBADO';
      return [
        (i + 1).toString(),
        c.materia.toUpperCase(),
        c.parcial1 !== null ? c.parcial1.toFixed(1) : '',
        c.parcial2 !== null ? c.parcial2.toFixed(1) : '',
        c.parcial3 !== null ? c.parcial3.toFixed(1) : '',
        '', '', 
        fin !== null ? fin.toFixed(1) : '',
        estatus,
      ];
    });

    body.push(['', 'PROMEDIOS GENERALES', '', '', '', '', '', promGeneral !== null ? promGeneral.toFixed(1) : '', '']);

    autoTable(doc, {
      startY: 51,
      head: [['#', 'Asignatura', 'P1', 'P2', 'P3', 'C / EXT', 'IT / RC', 'Final', 'Estatus']],
      body,
      styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
      headStyles: {
        fillColor: [59, 166, 74], // #3BA64A - Cecyteq Green
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 'auto' },
        7: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
      },
      didParseCell(data) {
        if (data.row.index < draft.length) {
          const fin = draft[data.row.index]?.final;
          if ((data.column.index === 7 || data.column.index === 8) && fin !== null && fin < 6) {
            data.cell.styles.textColor = [225, 29, 72];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        if (data.row.index === draft.length) {
          data.cell.styles.fillColor = [240, 240, 240];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 160;
    const firmaY = finalY + 20;
    doc.line(W / 2 - 40, firmaY, W / 2 + 40, firmaY);
    doc.text('Dirección del Plantel', W / 2, firmaY + 5, { align: 'center' });
    doc.text('CECYTEQ No. 5 Cerrito Colorado', W / 2, firmaY + 9, { align: 'center' });

    doc.save(`Boleta_${alumno.matricula}.pdf`);
  };

  const promedioColor = promedioDraft === null ? 'text-text-secondary/40' : promedioDraft >= 6 ? 'text-cecyteq-green' : 'text-cecyteq-red';

  return (
    <>
      <tr onClick={() => setOpen(o => !o)} className="cursor-pointer hover:bg-bg-main/50 transition-colors border-b border-border-subtle/50 group">
        <td className="px-8 py-4 text-text-secondary font-black text-xs">{alumno.numeroLista}</td>
        <td className="px-8 py-4 font-mono text-text-secondary/60 text-xs tracking-wider">{alumno.matricula}</td>
        <td className="px-8 py-4 font-black text-text-primary uppercase text-sm tracking-tight group-hover:text-cecyteq-green transition-colors">
          {alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}
        </td>
        <td className={`px-8 py-4 text-center font-black text-xl tracking-tighter ${promedioColor}`}>
          {promedioDraft !== null ? promedioDraft.toFixed(1) : '—'}
        </td>
        <td className="px-8 py-4 text-center">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${open ? 'bg-cecyteq-orange text-white' : 'bg-bg-main text-text-secondary'}`}>
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={5} className="bg-bg-main/30 px-8 py-8 animate-fadeIn">
            <div className="bg-bg-surface border border-border-subtle rounded-3xl p-8 shadow-glow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <p className="text-xl font-black text-text-primary tracking-tight uppercase">
                    {alumno.apellidoPaterno} {alumno.apellidoMaterno} {alumno.nombres}
                  </p>
                  <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1">Expediente: {alumno.matricula}</p>
                </div>
                <div className="flex gap-3">
                  {status === 'ok' && (
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase text-cecyteq-green bg-cecyteq-green/10 border border-cecyteq-green/20 px-4 py-2 rounded-xl animate-scaleIn">
                      <CheckCircle2 size={14} /> Sincronizado
                    </span>
                  )}
                  <button onClick={handleBoletaPDF} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-cecyteq-orange/10 hover:bg-cecyteq-orange text-cecyteq-orange hover:text-white border border-cecyteq-orange/20 px-4 py-3 rounded-xl transition-all">
                    <FileDown size={14} /> Boleta
                  </button>
                  <button onClick={handleSave} disabled={isPending} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-cecyteq-green hover:bg-cecyteq-green/90 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-cecyteq-green/20 disabled:opacity-50">
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border-subtle shadow-inner">
                <table className="w-full text-xs">
                  <thead className="bg-bg-main/50 text-text-secondary border-b border-border-subtle">
                    <tr>
                      <th className="px-6 py-4 text-left font-black uppercase tracking-widest">Asignatura</th>
                      <th className="px-4 py-4 text-center font-black uppercase tracking-widest w-24">P1</th>
                      <th className="px-4 py-4 text-center font-black uppercase tracking-widest w-24">P2</th>
                      <th className="px-4 py-4 text-center font-black uppercase tracking-widest w-24">P3</th>
                      <th className="px-4 py-4 text-center font-black uppercase tracking-widest w-24 text-cecyteq-orange">Final</th>
                      <th className="px-6 py-4 text-right font-black uppercase tracking-widest w-32">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/50">
                    {draft.map(cal => {
                      const isRep = cal.final !== null && cal.final < 6;
                      const isAp = cal.final !== null && cal.final >= 6;
                      return (
                        <tr key={cal.id} className="hover:bg-bg-main/20">
                          <td className="px-6 py-4 font-black text-text-primary uppercase tracking-tighter">{cal.materia}</td>
                          {(['parcial1', 'parcial2', 'parcial3', 'final'] as const).map(field => (
                            <td key={field} className="px-4 py-4 text-center">
                              <input
                                type="number" min={0} max={10} step={0.1}
                                value={cal[field] ?? ''}
                                onChange={e => setVal(cal.id, field, e.target.value)}
                                className={`w-16 text-center bg-bg-main border rounded-xl py-2 text-text-primary font-black outline-none transition-all ${
                                  field === 'final' ? isRep ? 'border-cecyteq-red/50 text-cecyteq-red' : isAp ? 'border-cecyteq-green/50 text-cecyteq-green' : 'border-border-subtle' : 'border-border-subtle focus:border-cecyteq-orange'
                                }`}
                                placeholder="—"
                              />
                            </td>
                          ))}
                          <td className="px-6 py-4 text-right">
                            {cal.final === null
                              ? <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-bg-main border border-border-subtle text-text-secondary/50">Cursando</span>
                              : isAp
                                ? <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20">Aprobado</span>
                                : <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cecyteq-red/10 text-cecyteq-red border border-cecyteq-red/20">Reprobado</span>
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

export default function CalificacionesClient({
  grupos, calificaciones, selectedGrupoId, autoExpandMatricula = ''
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(autoExpandMatricula || '');

  const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    e.target.value ? params.set('grupo', e.target.value) : params.delete('grupo');
    params.delete('alumno');
    setSearchTerm('');
    router.push(`?${params.toString()}`);
  };

  const alumnosMap = new Map<string, AlumnoPivot>();
  for (const c of calificaciones) {
    const key = c.alumno.matricula;
    if (!alumnosMap.has(key)) {
      alumnosMap.set(key, {
        matricula: c.alumno.matricula, nombres: c.alumno.nombres,
        apellidoPaterno: c.alumno.apellidoPaterno, apellidoMaterno: c.alumno.apellidoMaterno,
        numeroLista: c.alumno.numeroLista, calificaciones: [], promedio: null,
      });
    }
    alumnosMap.get(key)!.calificaciones.push({
      id: c.id, materia: c.materia, parcial1: c.parcial1,
      parcial2: c.parcial2, parcial3: c.parcial3, final: c.final,
    });
  }

  for (const a of alumnosMap.values()) {
    a.promedio = calcPromedio(a.calificaciones);
    a.calificaciones.sort((x, y) => x.materia.localeCompare(y.materia));
  }

  const alumnosList = Array.from(alumnosMap.values())
    .filter(a => {
      const s = searchTerm.toLowerCase();
      return `${a.apellidoPaterno} ${a.apellidoMaterno} ${a.nombres} ${a.matricula}`.toLowerCase().includes(s);
    })
    .sort((a, b) => a.numeroLista - b.numeroLista);

  const nombreGrupo = grupos.find(g => g.id.toString() === selectedGrupoId)?.nombre || 'Grupo';

  const handleExportGrupo = () => {
    if (alumnosList.length === 0) return;
    const materias = Array.from(new Set(calificaciones.map(c => c.materia))).sort();
    const rows = alumnosList.map(a => {
      const row: Record<string, string | number> = {
        "#": a.numeroLista, "Matrícula": a.matricula,
        "Apellido Paterno": a.apellidoPaterno, "Apellido Materno": a.apellidoMaterno, "Nombres": a.nombres,
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
    XLSX.utils.book_append_sheet(wb, ws, `Califs`.substring(0, 31));
    XLSX.writeFile(wb, `Calificaciones_${nombreGrupo}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-6 items-center justify-between shadow-glow">
        <div className="flex flex-col md:flex-row gap-4 w-full flex-1">
          <div className="relative w-full md:w-80">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <select
              value={selectedGrupoId}
              onChange={handleGrupoChange}
              className="w-full bg-bg-main border border-border-subtle text-text-primary text-sm font-black uppercase tracking-widest rounded-2xl pl-12 pr-4 py-4 focus:border-cecyteq-green outline-none appearance-none"
            >
              <option value="">Seleccione Grupo</option>
              {grupos.map(g => <option key={g.id} value={g.id.toString()}>{g.nombre}</option>)}
            </select>
          </div>

          {selectedGrupoId && (
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-bg-main border border-border-subtle text-text-primary text-sm font-bold rounded-2xl px-6 py-4 focus:border-cecyteq-orange outline-none"
            />
          )}
        </div>

        <button
          onClick={handleExportGrupo}
          disabled={!selectedGrupoId || alumnosList.length === 0}
          className="shrink-0 w-full md:w-auto bg-cecyteq-green hover:bg-cecyteq-green/90 disabled:opacity-30 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cecyteq-green/20"
        >
          <FileDown size={20} /> Exportar Reporte
        </button>
      </div>

      {!selectedGrupoId && (
        <div className="bg-cecyteq-orange/10 border border-cecyteq-orange/20 text-cecyteq-orange p-10 rounded-[2.5rem] text-center space-y-4">
          <div className="w-16 h-16 bg-cecyteq-orange/20 rounded-2xl flex items-center justify-center mx-auto">
             <Filter size={32} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest">Selección Requerida</h3>
          <p className="text-sm font-medium opacity-80">Elige un grupo académico para gestionar las actas de calificación.</p>
        </div>
      )}

      {selectedGrupoId && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <div className="w-2 h-6 bg-cecyteq-green rounded-full"></div>
            <p className="text-xs font-black text-text-secondary uppercase tracking-[0.2em]">
              Mostrando <span className="text-text-primary">{alumnosList.length}</span> registros en <span className="text-cecyteq-orange">{nombreGrupo}</span>
            </p>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-glow">
            <table className="w-full border-collapse">
              <thead className="bg-bg-main/50 border-b border-border-subtle text-text-secondary">
                <tr>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest w-20">No.</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest w-32">Matrícula</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest">Estudiante</th>
                  <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest w-32">Promedio</th>
                  <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {alumnosList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-text-secondary/40 font-black uppercase tracking-[0.3em] italic">
                      Sin coincidencias
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
        </div>
      )}
    </div>
  );
}
