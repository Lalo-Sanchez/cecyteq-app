"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Edit, Trash2, 
  UserPlus
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
                                <div className="flex gap-3 pt-4 border-t border-slate-700">
                                  <Link 
                                    href={`/dashboard/alumnos/nuevo?id=${alumno.id}`}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Edit size={18} /> Editar
                                  </Link>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(alumno); }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={18} /> Eliminar
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