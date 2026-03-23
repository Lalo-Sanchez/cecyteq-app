"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Edit, Trash2, AlertCircle, 
  GraduationCap, HeartPulse, UserPlus, X, CheckCircle,
  ChevronDown, ChevronUp
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

interface AlumnoFormData {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  turno: 'Matutino' | 'Vespertino';
  grupo: string;
  edad: string;
  faltas: string;
  telefono: string;
  direccion: string;
  correo: string;
  matricula: string;
  estatus: EstatusType;
  observaciones: string;
  padre1Nombre: string;
  padre1Telefono: string;
  padre1Ocupacion: string;
  padre2Nombre: string;
  padre2Telefono: string;
  padre2Ocupacion: string;
  contactoEmergenciaTipo: 'padre1' | 'padre2' | 'otro';
  otroNombre: string;
  otroApellidos: string;
  otroTelefono: string;
  otroOcupacion: string;
  otroParentesco: string;
}



// Configuración de grupos y matriculación
const PROGRAMAS_MATUTINO = [
  'TPROG-AM', 'TPGA-AM', 'TTPLAS-AM', 'TMECA-AM', 'TMECA-AMBI',
  'TMANTI-AM', 'TMANTI-AMBI', 'TELECA-AM', 'TELECA-AMBI'
] as const;
const PROGRAMAS_VESPERTINO = PROGRAMAS_MATUTINO.map((g) =>
  g.replace('-AMBI', '-AVBY').replace('-AM', '-AV')
) as unknown as readonly string[];
const SEMESTRES = [1, 2, 3, 4, 5, 6] as const;

const obtenerGruposPorTurno = (turno: 'Matutino' | 'Vespertino') => {
  const programas = turno === 'Matutino' ? PROGRAMAS_MATUTINO : PROGRAMAS_VESPERTINO;
  return SEMESTRES.flatMap((s) => programas.map((p) => `${s}${p}`))
    .filter((grupo) => !['2TRH-PM', '6AMBI-AM', '6AMBI-AVBY'].includes(grupo.toUpperCase()));
};

const obtenerCorreoInstitucional = (nombres: string, apellidoPaterno: string) => {
  const primerNombre = nombres.trim().split(' ')[0]?.toLowerCase() || '';
  const primerApellido = apellidoPaterno.trim().split(' ')[0]?.toLowerCase() || '';
  return `${primerNombre}${primerApellido}@cecyteq.edu.mx`;
};

const obtenerNumeroLista = (grupo: string, alumnosList: Alumno[]) => {
  const inscritos = alumnosList
    .filter((a) => a.grupo === grupo)
    .sort((a, b) => a.apellidoPaterno.localeCompare(b.apellidoPaterno));
  return inscritos.length + 1;
};

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedAlumnos, setExpandedAlumnos] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAlumnos = async () => {
      const res = await fetch('/api/alumnos');
      const data: Alumno[] = await res.json();
      setAlumnos(data);
    };

    loadAlumnos();
  }, []);

  // Estados del Formulario
  const [formData, setFormData] = useState<AlumnoFormData>({
    nombres: '', apellidoPaterno: '', apellidoMaterno: '', turno: 'Matutino', grupo: '', edad: '', faltas: '0', telefono: '', direccion: '', 
    correo: '', matricula: '', estatus: 'Inscrito', observaciones: '',
    padre1Nombre: '', padre1Telefono: '', padre1Ocupacion: '',
    padre2Nombre: '', padre2Telefono: '', padre2Ocupacion: '',
    contactoEmergenciaTipo: 'padre1',
    otroNombre: '', otroApellidos: '', otroTelefono: '', otroOcupacion: '', otroParentesco: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'matricula') {
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value } as AlumnoFormData;
      if (name === 'nombres' || name === 'apellidoPaterno') {
        next.correo = obtenerCorreoInstitucional(
          name === 'nombres' ? value : prev.nombres,
          name === 'apellidoPaterno' ? value : prev.apellidoPaterno
        );
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let nombreEmergencia = '';
    let telefonoEmergencia = '';

    if (formData.contactoEmergenciaTipo === 'padre1') {
      nombreEmergencia = `${formData.padre1Nombre} (Tutor 1)`;
      telefonoEmergencia = formData.padre1Telefono;
    } else if (formData.contactoEmergenciaTipo === 'padre2') {
      nombreEmergencia = `${formData.padre2Nombre} (Tutor 2)`;
      telefonoEmergencia = formData.padre2Telefono;
    } else {
      nombreEmergencia = `${formData.otroNombre} ${formData.otroApellidos} (${formData.otroParentesco})`;
      telefonoEmergencia = formData.otroTelefono;
    }

    const numeroLista = obtenerNumeroLista(formData.grupo, editingId ? alumnos.filter((a) => a.id !== editingId) : alumnos);
    const correoInstitucional = obtenerCorreoInstitucional(formData.nombres, formData.apellidoPaterno);

    const payload = {
      id: editingId,
      matricula: formData.matricula,
      correo: correoInstitucional,
      nombres: formData.nombres,
      apellidoPaterno: formData.apellidoPaterno,
      apellidoMaterno: formData.apellidoMaterno,
      turno: formData.turno,
      grupo: formData.grupo,
      numeroLista,
      edad: formData.edad,
      faltas: Number(formData.faltas ?? 0),
      telefono: formData.telefono,
      direccion: formData.direccion,
      estatus: formData.estatus,
      observaciones: formData.observaciones,
      contactoEmergenciaNombre: nombreEmergencia,
      contactoEmergenciaTelefono: telefonoEmergencia
    };

    if (editingId) {
      await fetch('/api/alumnos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/alumnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const res = await fetch('/api/alumnos');
    const data: Alumno[] = await res.json();
    setAlumnos(data);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (alumno: Alumno) => {
    setEditingId(alumno.id);
    // Pre-fill form with student data
    setFormData({
      nombres: alumno.nombres,
      apellidoPaterno: alumno.apellidoPaterno,
      apellidoMaterno: alumno.apellidoMaterno,
      turno: alumno.turno,
      grupo: alumno.grupo,
      edad: alumno.edad,
      faltas: alumno.faltas?.toString() ?? '0',
      telefono: alumno.telefono,
      direccion: alumno.direccion,
      correo: alumno.correo,
      matricula: alumno.matricula,
      estatus: alumno.estatus,
      observaciones: alumno.observaciones,
      padre1Nombre: '', // No se guarda en el mock actual
      padre1Telefono: '',
      padre1Ocupacion: '',
      padre2Nombre: '',
      padre2Telefono: '',
      padre2Ocupacion: '',
      contactoEmergenciaTipo: 'padre1',
      otroNombre: '',
      otroApellidos: '',
      otroTelefono: '',
      otroOcupacion: '',
      otroParentesco: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer.')) {
      await fetch('/api/alumnos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const res = await fetch('/api/alumnos');
      const data: Alumno[] = await res.json();
      setAlumnos(data);
    }
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
        <Link 
          href="/dashboard/alumnos/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <UserPlus size={18} /> Nuevo Alumno
        </Link>
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
                      <tr key={alumno.id} className="hover:bg-slate-800/20 transition-colors">
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
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => toggleAlumnoExpansion(alumno.id)} className="p-2 text-slate-400 hover:text-slate-300 transition-colors">
                            {expandedAlumnos.has(alumno.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <Link href={`/dashboard/alumnos/nuevo?id=${alumno.id}`} className="inline-block p-2 text-slate-400 hover:text-blue-400 transition-colors">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(alumno.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>

      {/* MODAL / FORMULARIO INTERACTIVO PARA AGREGAR ALUMNO */}
      {isModalOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="mt-4 bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[calc(100vh-5rem)] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><UserPlus size={24} /></div>
                <div>
                  <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}</h3>
                  <p className="text-xs text-slate-400">{editingId ? 'Modifique el expediente digital del estudiante.' : 'Complete el expediente digital del estudiante.'}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
              <form id="alumnoForm" onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECCIÓN 1: DATOS DEL ALUMNO */}
                <section>
                  <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <GraduationCap size={16}/> 1. Datos del Alumno
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3 lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Matrícula (14 dígitos, auto generada)</label>
                      <input type="text" name="matricula" readOnly value={formData.matricula} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-400 font-mono cursor-not-allowed" />
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Nombre(s)*</label>
                      <input type="text" name="nombres" required value={formData.nombres} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Apellido Paterno*</label>
                      <input type="text" name="apellidoPaterno" required value={formData.apellidoPaterno} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Apellido Materno*</label>
                      <input type="text" name="apellidoMaterno" required value={formData.apellidoMaterno} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>

                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Turno*</label>
                      <select name="turno" value={formData.turno} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                      </select>
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Grupo Asignado*</label>
                      <select name="grupo" required value={formData.grupo} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase">
                        <option value="" disabled>Seleccione un grupo</option>
                        {obtenerGruposPorTurno(formData.turno).map((grupo) => (
                          <option value={grupo} key={grupo}>{grupo}</option>
                        ))}
                      </select>
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Estatus Académico*</label>
                      <select name="estatus" value={formData.estatus} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                        <option value="Inscrito">Inscrito (Activo)</option>
                        <option value="Baja Temporal">Baja Temporal</option>
                        <option value="Baja">Baja Definitiva</option>
                        <option value="Egresado">Egresado</option>
                      </select>
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Edad</label>
                      <input type="number" name="edad" value={formData.edad} onChange={handleInputChange} min="14" max="99" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Faltas</label>
                      <input type="number" name="faltas" value={formData.faltas} onChange={handleInputChange} min="0" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono Personal</label>
                      <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="10 dígitos" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Correo Institucional (auto generado)</label>
                      <input type="email" readOnly value={obtenerCorreoInstitucional(formData.nombres, formData.apellidoPaterno)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-400 cursor-not-allowed" />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Dirección Completa</label>
                      <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Calle, Número, Colonia, Municipio" className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="flex items-center gap-1 text-xs font-medium text-amber-400 mb-1"><HeartPulse size={14}/> Observaciones Médicas (Enfermedades, Discapacidad, Alergias)</label>
                      <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows={2} placeholder="Especifique si requiere atención especial..." className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"></textarea>
                    </div>
                  </div>
                </section>

                {/* SECCIÓN 2: DATOS DE LOS PADRES */}
                <section>
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Users size={16}/> 2. Datos de los Padres o Tutores
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <p className="text-xs font-semibold text-slate-300 uppercase">Tutor / Padre 1</p>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase">Nombre Completo</label>
                        <input type="text" name="padre1Nombre" value={formData.padre1Nombre} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase">Teléfono</label>
                          <input type="tel" name="padre1Telefono" value={formData.padre1Telefono} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase">Ocupación</label>
                          <input type="text" name="padre1Ocupacion" value={formData.padre1Ocupacion} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <p className="text-xs font-semibold text-slate-300 uppercase">Tutor / Padre 2</p>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase">Nombre Completo</label>
                        <input type="text" name="padre2Nombre" value={formData.padre2Nombre} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase">Teléfono</label>
                          <input type="tel" name="padre2Telefono" value={formData.padre2Telefono} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase">Ocupación</label>
                          <input type="text" name="padre2Ocupacion" value={formData.padre2Ocupacion} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:border-emerald-500 outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECCIÓN 3: CONTACTO DE EMERGENCIA */}
                <section>
                  <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <AlertCircle size={16}/> 3. Contacto de Emergencia Oficial
                  </h4>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.contactoEmergenciaTipo === 'padre1' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                      <input type="radio" name="contactoEmergenciaTipo" value="padre1" checked={formData.contactoEmergenciaTipo === 'padre1'} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm font-medium">Asignar a Padre/Tutor 1</span>
                    </label>
                    <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.contactoEmergenciaTipo === 'padre2' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                      <input type="radio" name="contactoEmergenciaTipo" value="padre2" checked={formData.contactoEmergenciaTipo === 'padre2'} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm font-medium">Asignar a Padre/Tutor 2</span>
                    </label>
                    <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${formData.contactoEmergenciaTipo === 'otro' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                      <input type="radio" name="contactoEmergenciaTipo" value="otro" checked={formData.contactoEmergenciaTipo === 'otro'} onChange={handleInputChange} className="hidden" />
                      <span className="text-sm font-medium">Asignar a Otra Persona</span>
                    </label>
                  </div>

                  {formData.contactoEmergenciaTipo === 'otro' && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-300">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Nombre(s)*</label>
                        <input type="text" name="otroNombre" required={formData.contactoEmergenciaTipo === 'otro'} value={formData.otroNombre} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Apellidos*</label>
                        <input type="text" name="otroApellidos" required={formData.contactoEmergenciaTipo === 'otro'} value={formData.otroApellidos} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Parentesco (Ej. Abuela, Tío)*</label>
                        <input type="text" name="otroParentesco" required={formData.contactoEmergenciaTipo === 'otro'} value={formData.otroParentesco} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Teléfono*</label>
                        <input type="tel" name="otroTelefono" required={formData.contactoEmergenciaTipo === 'otro'} value={formData.otroTelefono} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Ocupación</label>
                        <input type="text" name="otroOcupacion" value={formData.otroOcupacion} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
                      </div>
                    </div>
                  )}
                </section>
              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="alumnoForm" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-colors flex items-center gap-2">
                <CheckCircle size={18} /> {editingId ? 'Actualizar Expediente' : 'Guardar Expediente'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}