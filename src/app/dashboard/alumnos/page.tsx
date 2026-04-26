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
      headStyles: { fillColor: [30, 80, 160], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 7 },
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
      case 'Egresado': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* CABECERA DEL MÓDULO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500" /> Directorio de Alumnos
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gestión integral de expedientes escolares.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            Exportar Excel
          </button>
          <Link 
            href="/dashboard/alumnos/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <UserPlus size={18} /> Nuevo Alumno
          </Link>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por apellidos, nombre, grupo o matrícula..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-200 w-full placeholder-slate-500"
        />
      </div>

      {/* TABLA DE ALUMNOS AGRUPADOS POR GRUPO */}
      <div className="space-y-4">
        {gruposActivos.length === 0 && (
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
            No se encontraron alumnos registrados.
          </div>
        )}

        {gruposActivos.map(([grupo, alumnosGrupo]) => (
          <details key={grupo} open={expandedGroup === grupo} className="group border border-slate-800 rounded-2xl bg-slate-950/50">
            <summary
              onClick={(e) => { e.preventDefault(); setExpandedGroup(expandedGroup === grupo ? null : grupo); }}
              className="flex justify-between items-center px-6 py-4 cursor-pointer select-none text-slate-200 hover:bg-slate-900/50"
            >
              <div>
                <p className="font-semibold text-lg">{grupo}</p>
                <p className="text-xs text-slate-400">{alumnosGrupo.length} alumnos</p>
              </div>
              <span className="text-sm text-blue-300">{expandedGroup === grupo ? 'Ocultar' : 'Mostrar'}</span>
            </summary>

            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900 border-t border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">#</th>
                    <th className="px-6 py-3 font-medium">Matrícula</th>
                    <th className="px-6 py-3 font-medium">Apellidos y Nombres</th>
                    <th className="px-6 py-3 font-medium">Turno</th>
                    <th className="px-6 py-3 font-medium">Correo</th>
                    <th className="px-6 py-3 font-medium">Faltas</th>
                    <th className="px-6 py-3 font-medium">Estatus</th>
                    <th className="px-6 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {alumnosGrupo
                    .sort((a,b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno))
                    .map((alumno) => (
                      <React.Fragment key={alumno.id}>
                        <tr 
                          onClick={() => toggleAlumnoExpansion(alumno.id)}
                          className="hover:bg-slate-800/20 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-3">{alumno.numeroLista}</td>
                          <td className="px-6 py-3 font-mono text-slate-400">{alumno.matricula}</td>
                          <td className="px-6 py-3">
                            <p className="font-semibold text-slate-200">{alumno.nombres}</p>
                            <p className="text-xs text-slate-500">{alumno.apellidoPaterno} {alumno.apellidoMaterno}</p>
                          </td>
                          <td className="px-6 py-3">{alumno.turno}</td>
                          <td className="px-6 py-3 text-slate-200 text-xs">{alumno.correo}</td>
                          <td className="px-6 py-3">{alumno.faltas}</td>
                          <td className="px-6 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstatusColor(alumno.estatus)}`}>
                              {alumno.estatus}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right"></td>
                        </tr>
                        {expandedAlumnos.has(alumno.id) && (
                          <tr className="bg-slate-800/10">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-slate-400 font-medium">Edad:</p>
                                    <p className="text-slate-200">{alumno.edad || 'No especificada'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 font-medium">Teléfono:</p>
                                    <p className="text-slate-200">{alumno.telefono || 'No especificado'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 font-medium">Dirección:</p>
                                    <p className="text-slate-200">{alumno.direccion || 'No especificada'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 font-medium">Contacto de Emergencia:</p>
                                    <p className="text-slate-200">{alumno.contactoEmergenciaNombre || 'No especificado'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 font-medium">Teléfono de Emergencia:</p>
                                    <p className="text-slate-200">{alumno.contactoEmergenciaTelefono || 'No especificado'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 font-medium">Observaciones:</p>
                                    <p className="text-slate-200">{alumno.observaciones || 'Ninguna'}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
                                  <Link 
                                    href={`/dashboard/alumnos/nuevo?id=${alumno.id}`}
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Edit size={16} /> Editar
                                  </Link>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); generateBoletaPDF(alumno); }}
                                    className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <FileDown size={16} /> Boleta PDF
                                  </button>
                                  <Link
                                    href={`/dashboard/calificaciones?grupo=${alumno.grupo}&alumno=${alumno.matricula}`}
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <GraduationCap size={16} /> Ver Calificaciones
                                  </Link>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(alumno); }}
                                    className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ml-auto"
                                  >
                                    <Trash2 size={16} /> Eliminar
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Confirmar Eliminación</h3>
              <p className="text-sm text-slate-400 mt-1">Se eliminará el registro del alumno de la base de datos.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  Para confirmar la eliminación de <span className="font-bold text-white">{deleteModal.alumno.nombres}</span>, 
                  por favor escribe su <span className="font-semibold">nombre</span> (no importan mayúsculas ni espacios extra):
                </p>
                <p className="text-lg font-bold text-red-400 mt-2 text-center">{deleteModal.alumno.nombres}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Nombre del alumno:</label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Escribe el nombre (sin importar mayúsculas)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmDelete();
                  }}
                />
              </div>

              <p className="text-xs text-slate-500">
                {deleteInput.trim().toLowerCase() === deleteModal.alumno.nombres.trim().toLowerCase()
                  ? '✓ El nombre coincide. Puedes eliminar.' 
                  : deleteInput 
                    ? '✗ El nombre no coincide.' 
                    : 'Escribe el nombre para confirmar.'}
              </p>
            </div>

            <div className="p-6 border-t border-slate-800 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModal({ isOpen: false, alumno: null });
                  setDeleteInput('');
                }}
                className="px-6 py-2.5 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteInput.trim().toLowerCase() !== deleteModal.alumno.nombres.trim().toLowerCase()}
                className="px-6 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition-colors"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}