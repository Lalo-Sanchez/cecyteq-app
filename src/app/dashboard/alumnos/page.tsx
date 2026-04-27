"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Edit, Trash2, 
  UserPlus, FileDown, GraduationCap
} from 'lucide-react';


// --- TIPOS DE DATOS ---
type EstatusType = 'Inscrito' | 'Baja Temporal' | 'Baja' | 'Egresado';

interface Alumno {
  id: string;
  matricula: string;
  correo: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  turno: 'Matutino' | 'Vespertino';
  grupo: string;
  numeroLista: number;
  edad: string;
  faltas: number;
  telefono: string;
  direccion: string;
  estatus: EstatusType;
  observaciones: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
}



export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedAlumnos, setExpandedAlumnos] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; alumno: Alumno | null }>({ isOpen: false, alumno: null });
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => {
    const loadAlumnos = async () => {
      const res = await fetch('/api/alumnos');
      const data: Alumno[] = await res.json();
      setAlumnos(data);
    };

    loadAlumnos();
  }, []);

  // Ordenar alumnos alfabéticamente por apellido (Automático)
  const alumnosOrdenados = [...alumnos]
    .filter(a => a.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 a.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 a.apellidoMaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 a.matricula.includes(searchTerm) ||
                 a.grupo.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));

  const gruposActivos = Object.entries(
    alumnosOrdenados.reduce<Record<string, Alumno[]>>((acc, alumno) => {
      if (!alumno.grupo) return acc;
      if (!acc[alumno.grupo]) acc[alumno.grupo] = [];
      acc[alumno.grupo].push(alumno);
      return acc;
    }, {})
  ).sort((a,b) => a[0].localeCompare(b[0]));

  const handleDelete = (alumno: Alumno) => {
    setDeleteModal({ isOpen: true, alumno });
    setDeleteInput('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.alumno) return;
    
    if (deleteInput.trim().toLowerCase() !== deleteModal.alumno.nombres.trim().toLowerCase()) {
      alert('El nombre no coincide.');
      return;
    }

    await fetch('/api/alumnos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteModal.alumno.id })
    });

    const res = await fetch('/api/alumnos');
    const data: Alumno[] = await res.json();
    setAlumnos(data);
    setDeleteModal({ isOpen: false, alumno: null });
    setDeleteInput('');
  };

  const toggleAlumnoExpansion = (id: string) => {
    setExpandedAlumnos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleExportExcel = () => {
    if (alumnosOrdenados.length === 0) {
      alert("No hay alumnos para exportar.");
      return;
    }

    const dataToExport = alumnosOrdenados.map((a: Alumno) => ({
      "Grupo": a.grupo,
      "No. Lista": a.numeroLista,
      "Matrícula": a.matricula,
      "Apellido Paterno": a.apellidoPaterno,
      "Apellido Materno": a.apellidoMaterno,
      "Nombres": a.nombres,
      "Turno": a.turno,
      "Estatus": a.estatus,
      "Correo": a.correo
    }));

    // Importar dinámicamente XLSX solo cuando se requiera (para no afectar carga)
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Alumnos");
      XLSX.writeFile(wb, "Reporte_Alumnos_CECYTEQ.xlsx");
    });
  };

  // ── Boleta PDF por alumno ──────────────────────────────────────────
  const generateBoletaPDF = async (alumno: Alumno) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    // Obtener calificaciones reales del alumno
    let calificaciones: { id: number; materia: string; parcial1: number | null; parcial2: number | null; parcial3: number | null; final: number | null }[] = [];
    try {
      const res = await fetch(`/api/calificaciones?matricula=${alumno.matricula}`);
      if (res.ok) calificaciones = await res.json();
    } catch { /* sin calificaciones — tabla vacía */ }

    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.toLocaleDateString('es-MX', { month: 'long' });
    const anio = hoy.getFullYear();
    const fechaStr = `Querétaro, Qro., a ${dia} de ${mes} de ${anio}`;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // Marca de agua primero (debajo de todo)
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(38);
    doc.setFont('helvetica', 'bold');
    for (let y = 20; y < H + 20; y += 38) {
      for (let x = 5; x < W + 20; x += 72) {
        doc.text('OFICIAL', x, y, { angle: 45, renderingMode: 'fill' });
      }
    }
    doc.setTextColor(40, 40, 40);

    // Encabezado institucional
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('COORDINACIÓN DE ORGANISMOS DESCENTRALIZADOS ESTATALES DE CECyTEs', W / 2, 14, { align: 'center' });
    doc.text('COLEGIO DE ESTUDIOS CIENTÍFICOS Y TECNOLÓGICOS DEL ESTADO QUERÉTARO', W / 2, 18, { align: 'center' });
    doc.text('CCT PLANTEL CECYTEQ NO. 5 CERRITO COLORADO - QUERÉTARO', W / 2, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.text('BOLETA DEL ALUMNO', W / 2, 27, { align: 'center' });
    doc.setDrawColor(180, 180, 180);
    doc.line(14, 30, W - 14, 30);

    // Datos del alumno
    const nombreCompleto = `${alumno.apellidoPaterno} ${alumno.apellidoMaterno} ${alumno.nombres}`;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Alumno(a): ', 14, 36);
    doc.setFont('helvetica', 'normal');
    doc.text(nombreCompleto, 14 + doc.getTextWidth('Alumno(a): '), 36);
    doc.setFont('helvetica', 'bold');
    doc.text('Bachillerato General: ', 14, 41);
    doc.setFont('helvetica', 'normal');
    doc.text('TÉCNICO EN PROGRAMACIÓN', 14 + doc.getTextWidth('Bachillerato General: '), 41);
    doc.setFont('helvetica', 'bold');
    doc.text('Grupo: ', 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(alumno.grupo || '', 14 + doc.getTextWidth('Grupo: '), 46);
    doc.setFont('helvetica', 'bold');
    doc.text('Turno: ', 14, 51);
    doc.setFont('helvetica', 'normal');
    doc.text(alumno.turno || '', 14 + doc.getTextWidth('Turno: '), 51);

    // Lado derecho
    doc.setFont('helvetica', 'normal');
    doc.text(fechaStr, W - 14, 36, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`Matrícula: ${alumno.matricula}`, W - 14, 41, { align: 'right' });

    // Tabla de calificaciones con datos reales
    const body = calificaciones.map((c, i) => {
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
        '', '', // C/EXT, IT/RC
        fin !== null ? fin.toFixed(1) : '',
        estatus,
      ];
    });

    // Fila de promedios generales
    if (calificaciones.length > 0) {
      const finales = calificaciones.map(c => c.final).filter(f => f !== null) as number[];
      const promedio = finales.length > 0
        ? (finales.reduce((a, b) => a + b, 0) / finales.length).toFixed(1)
        : '';
      body.push(['', 'PROMEDIOS GENERALES', '', '', '', '', '', promedio, '']);
    }

    autoTable(doc, {
      startY: 56,
      head: [['#', 'Asignatura', 'P1', 'P2', 'P3', 'C / EXT', 'IT / RC', 'Final', 'Estatus']],
      body: body.length > 0 ? body : [['', 'Sin calificaciones registradas', '', '', '', '', '', '', '']],
      styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
      headStyles: { fillColor: [59, 166, 74], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 7 },
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
      didParseCell(data) {
        // Reprobados en rojo
        if (data.column.index === 7 || data.column.index === 8) {
          const fin = calificaciones[data.row.index]?.final;
          if (fin !== null && fin !== undefined && fin < 6) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Fila de promedios en gris
        if (data.row.index === calificaciones.length) {
          data.cell.styles.fillColor = [240, 240, 240];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 14, right: 14 },
    });

    // Firma
    const finalY = (doc as any).lastAutoTable?.finalY ?? 160;
    const firmaY = finalY + 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.line(W / 2 - 40, firmaY, W / 2 + 40, firmaY);
    doc.text('Director(a) del Plantel', W / 2, firmaY + 5, { align: 'center' });
    doc.text('CECYTEQ No. 5 Cerrito Colorado', W / 2, firmaY + 9, { align: 'center' });

    const nombreArchivo = `Boleta_${alumno.nombres}_${alumno.apellidoPaterno}_${alumno.apellidoMaterno}`
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');
    doc.save(`${nombreArchivo}.pdf`);
  };

  const getEstatusColor = (estatus: EstatusType) => {
    switch(estatus) {
      case 'Inscrito': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Baja Temporal': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Baja': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Egresado': return 'bg-cecyteq-orange/10 text-cecyteq-orange border-cecyteq-orange/20';
      default: return 'bg-text-secondary/10 text-text-secondary border-border-subtle';
    }
  };

  return (
    <div className="space-y-6">
      {/* CABECERA DEL MÓDULO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-primary flex items-center gap-2 tracking-tight">
            <Users className="text-cecyteq-green" /> Directorio de Alumnos
          </h2>
          <p className="text-text-secondary text-sm mt-1">Gestión integral de expedientes escolares.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="bg-bg-surface hover:bg-bg-main text-text-primary border border-border-subtle px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Exportar Excel
          </button>
          <Link 
            href="/dashboard/alumnos/nuevo"
            className="bg-cecyteq-green hover:bg-cecyteq-green/90 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-cecyteq-green/20 flex items-center gap-2"
          >
            <UserPlus size={16} /> Nuevo Alumno
          </Link>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex items-center gap-4 shadow-inner">
        <Search className="text-text-secondary" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por apellidos, nombre, grupo o matrícula..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-text-primary w-full placeholder-text-secondary/40 font-medium"
        />
      </div>

      {/* TABLA DE ALUMNOS AGRUPADOS POR GRUPO */}
      <div className="space-y-4">
        {gruposActivos.length === 0 && (
          <div className="bg-bg-surface/50 border border-border-subtle rounded-2xl p-10 text-center text-text-secondary font-medium">
            No se encontraron alumnos registrados.
          </div>
        )}

        {gruposActivos.map(([grupo, alumnosGrupo]) => (
          <details key={grupo} open={expandedGroup === grupo} className="group border border-border-subtle rounded-2xl bg-bg-surface/30 overflow-hidden transition-all">
            <summary
              onClick={(e) => { e.preventDefault(); setExpandedGroup(expandedGroup === grupo ? null : grupo); }}
              className="flex justify-between items-center px-6 py-5 cursor-pointer select-none text-text-primary hover:bg-bg-main/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bg-main rounded-xl flex items-center justify-center border border-border-subtle text-cecyteq-green font-black">
                  {grupo.substring(0, 2)}
                </div>
                <div>
                  <p className="font-black text-xl tracking-tight uppercase">{grupo}</p>
                  <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{alumnosGrupo.length} Alumnos inscritos</p>
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-cecyteq-orange px-4 py-2 bg-bg-main rounded-xl border border-border-subtle">
                {expandedGroup === grupo ? 'Ocultar' : 'Ver Lista'}
              </span>
            </summary>

            <div className="overflow-x-auto pb-4 border-t border-border-subtle">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-bg-main/50 text-text-secondary text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Matrícula</th>
                    <th className="px-6 py-4">Estudiante</th>
                    <th className="px-6 py-4">Turno</th>
                    <th className="px-6 py-4">Correo</th>
                    <th className="px-6 py-4">Asistencia</th>
                    <th className="px-6 py-4">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {alumnosGrupo
                    .sort((a,b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno))
                    .map((alumno) => (
                      <React.Fragment key={alumno.id}>
                        <tr 
                          onClick={() => toggleAlumnoExpansion(alumno.id)}
                          className="hover:bg-bg-main/30 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4 font-bold text-text-secondary">{alumno.numeroLista}</td>
                          <td className="px-6 py-4 font-black text-xs text-cecyteq-green tracking-wider">{alumno.matricula}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-text-primary group-hover:text-cecyteq-green transition-colors">{alumno.apellidoPaterno} {alumno.apellidoMaterno}</p>
                            <p className="text-xs text-text-secondary">{alumno.nombres}</p>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold">{alumno.turno}</td>
                          <td className="px-6 py-4 text-text-secondary text-xs font-medium">{alumno.correo}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${alumno.faltas > 5 ? 'text-cecyteq-orange' : 'text-cecyteq-green'}`}>
                              {alumno.faltas} faltas
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getEstatusColor(alumno.estatus)}`}>
                              {alumno.estatus}
                            </span>
                          </td>
                        </tr>
                        {expandedAlumnos.has(alumno.id) && (
                          <tr className="bg-bg-main/40">
                            <td colSpan={7} className="px-8 py-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border-subtle pb-2">Información Personal</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-[10px] text-text-secondary font-bold uppercase">Edad</p>
                                      <p className="text-sm font-bold">{alumno.edad || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-text-secondary font-bold uppercase">Teléfono</p>
                                      <p className="text-sm font-bold">{alumno.telefono || '-'}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-text-secondary font-bold uppercase">Dirección</p>
                                    <p className="text-sm font-bold">{alumno.direccion || '-'}</p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border-subtle pb-2">Contacto Emergencia</h4>
                                  <div>
                                    <p className="text-[10px] text-text-secondary font-bold uppercase">Nombre</p>
                                    <p className="text-sm font-bold">{alumno.contactoEmergenciaNombre || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-text-secondary font-bold uppercase">Teléfono</p>
                                    <p className="text-sm font-bold">{alumno.contactoEmergenciaTelefono || '-'}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-3 justify-center">
                                  <Link 
                                    href={`/dashboard/alumnos/nuevo?id=${alumno.id}`}
                                    className="w-full flex items-center justify-center gap-2 bg-bg-surface border border-border-subtle hover:border-cecyteq-green text-text-primary px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                  >
                                    <Edit size={14} /> Editar Perfil
                                  </Link>
                                  <button
                                    onClick={() => generateBoletaPDF(alumno)}
                                    className="w-full flex items-center justify-center gap-2 bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cecyteq-green hover:text-white transition-all"
                                  >
                                    <FileDown size={14} /> Descargar Boleta
                                  </button>
                                  <Link
                                    href={`/dashboard/calificaciones?grupo=${alumno.grupo}&alumno=${alumno.matricula}`}
                                    className="w-full flex items-center justify-center gap-2 bg-cecyteq-orange/10 text-cecyteq-orange border border-cecyteq-orange/20 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cecyteq-orange hover:text-white transition-all"
                                  >
                                    <GraduationCap size={14} /> Ver Notas
                                  </Link>
                                  <button 
                                    onClick={() => handleDelete(alumno)}
                                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <Trash2 size={14} /> Eliminar
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {deleteModal.isOpen && deleteModal.alumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-main/90 backdrop-blur-md">
          <div className="bg-bg-surface border border-border-subtle rounded-[2rem] w-full max-w-md shadow-glow p-8 animate-scaleIn">
            <h3 className="text-2xl font-black text-text-primary tracking-tight mb-2">Eliminar Registro</h3>
            <p className="text-sm text-text-secondary font-medium mb-6">Esta acción es irreversible y eliminará todo el historial del alumno.</p>

            <div className="space-y-6">
              <div className="bg-bg-main border border-border-subtle rounded-2xl p-5 text-center">
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-2">Para confirmar, escribe:</p>
                <p className="text-xl font-black text-cecyteq-orange tracking-tight">{deleteModal.alumno.nombres}</p>
              </div>

              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Escribe el nombre aquí..."
                className="w-full bg-bg-main border border-border-subtle rounded-2xl py-4 px-4 text-text-primary focus:border-red-500 outline-none transition-all font-bold text-center"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteModal({ isOpen: false, alumno: null }); setDeleteInput(''); }}
                  className="flex-1 px-6 py-4 rounded-2xl border border-border-subtle text-text-secondary font-bold hover:bg-bg-main transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteInput.trim().toLowerCase() !== deleteModal.alumno.nombres.trim().toLowerCase()}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white font-black transition-all shadow-lg shadow-red-600/20"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}