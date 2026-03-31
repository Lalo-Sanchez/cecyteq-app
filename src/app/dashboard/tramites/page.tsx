"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';

type Tramite = {
  id: number;
  alumnoId: number;
  tipo: string;
  motivo: string;
  estatus: string;
  observaciones?: string;
  respuestaAdministrador?: string | null;
  creadoEn: string;
  actualizadoEn: string;
  alumno: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    matricula: string;
  };
};

type Alumno = {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  matricula: string;
  grupo: string;
  turno: string;
  faltas: number;
};

export default function TramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(false);
  const [modoNuevo, setModoNuevo] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [matriculaBuscada, setMatriculaBuscada] = useState('');
  const [selectedAlumnoId, setSelectedAlumnoId] = useState('');
  const [tipoTramite, setTipoTramite] = useState('Kardex');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const grupos = useMemo(() => Array.from(new Set(alumnos.map((a) => a.grupo))).sort(), [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const queryMatricula = matriculaBuscada.trim().toLowerCase();

    return alumnos.filter((a) => {
      const matchGroup = selectedGroup ? a.grupo === selectedGroup : true;
      const matchMatricula = queryMatricula ? a.matricula.toLowerCase().includes(queryMatricula) : true;
      return matchGroup && matchMatricula;
    });
  }, [alumnos, selectedGroup, matriculaBuscada]);

  const alumnoSeleccionado = useMemo(() => {
    if (!selectedAlumnoId) return null;
    return alumnos.find((a) => a.id === Number(selectedAlumnoId)) ?? null;
  }, [alumnos, selectedAlumnoId]);
  const generados = React.useMemo(() => tramites.filter((t) => t.estatus === 'Generado').length, [tramites]);

  const handleGenerarPdf = async (tramite: Tramite) => {
    if (tramite.estatus === 'Generado') {
      alert('El PDF ya ha sido generado.');
      return;
    }

    const res = await fetch('/api/tramites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: tramite.id,
        estatus: 'Generado',
        respuestaAdministrador: `PDF generado para ${tramite.tipo}`,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Error al generar el PDF: ${error?.error || 'Revisa la solicitud.'}`);
      return;
    }

    alert(`PDF generado para la solicitud de ${tramite.tipo}.`);
    await loadData();
  };

  const handleRechazar = async (tramite: Tramite) => {
    const motivoRechazo = window.prompt('Motivo de rechazo:');
    if (!motivoRechazo?.trim()) return;
    await updateStatus(tramite.id, 'Rechazado', motivoRechazo.trim());
  };
  useEffect(() => {
    if (!matriculaBuscada.trim()) {
      if (selectedGroup && alumnosFiltrados.length === 1) {
        setSelectedAlumnoId(String(alumnosFiltrados[0].id));
      }
      return;
    }

    if (alumnosFiltrados.length === 1) {
      setSelectedAlumnoId(String(alumnosFiltrados[0].id));
      return;
    }

    if (selectedAlumnoId && !alumnosFiltrados.some((a) => String(a.id) === selectedAlumnoId)) {
      setSelectedAlumnoId('');
    }
  }, [matriculaBuscada, selectedGroup, alumnosFiltrados, selectedAlumnoId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([fetch('/api/tramites'), fetch('/api/alumnos')]);
      const tramitesJson: Tramite[] = await res1.json();
      const alumnosJson: Alumno[] = await res2.json();
      setTramites(tramitesJson);
      setAlumnos(alumnosJson);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('userRole'));
    }
    loadData();
  }, []);

  const generarTramite = async () => {
    if (!selectedAlumnoId || !motivo) {
      alert('Ingresa matrícula y describe el motivo del trámite.');
      return;
    }

    const estatusCreate = userRole === 'admin' ? 'Generado' : 'Pendiente';
    const respuestaAdministrador =
      userRole === 'admin' ? 'Trámite generado automáticamente por administración' : undefined;

    const res = await fetch('/api/tramites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alumnoId: Number(selectedAlumnoId),
        tipo: tipoTramite,
        motivo,
        observaciones,
        estatus: estatusCreate,
        respuestaAdministrador,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Error: ${error?.error || 'No se pudo crear la solicitud.'}`);
      return;
    }

    setModoNuevo(false);
    setMatriculaBuscada('');
    setSelectedAlumnoId('');
    setTipoTramite('Kardex');
    setMotivo('');
    setObservaciones('');
    await loadData();
  };

  const updateStatus = async (
    id: number,
    status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Generado',
    respuestaAdministrador?: string,
  ) => {
    await fetch('/api/tramites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estatus: status, respuestaAdministrador }),
    });
    await loadData();
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl animate-fadeInUp rounded-[2rem] border border-slate-800/60 bg-slate-950/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800/50 bg-slate-950/95 p-8 shadow-[0_25px_90px_rgba(14,165,233,0.10)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_18%)] opacity-80" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Panel escolar</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white flex items-center gap-3">
                <BookOpen className="text-cyan-400" /> Trámites Escolares
              </h2>
              <p className="mt-3 max-w-2xl text-slate-300">Gestiona solicitudes de kardex, constancias y cambios de turno con una experiencia visual e intuitiva.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-900">
                <p className="text-slate-400">Solicitudes</p>
                <p className="mt-1 text-xl font-semibold text-cyan-300">{tramites.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-900">
                <p className="text-slate-400">Alumnos</p>
                <p className="mt-1 text-xl font-semibold text-emerald-300">{alumnos.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 px-4 py-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-900">
                <p className="text-slate-400">Generados</p>
                <p className="mt-1 text-xl font-semibold text-emerald-300">{generados}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 shadow-glow animate-fadeInUp">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Solicitudes de trámite</h3>
              <p className="text-slate-400 text-sm">Crea nuevo trámite o revisa las solicitudes existentes.</p>
            </div>
            <button
              onClick={() => setModoNuevo((prev) => !prev)}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(34,211,238,0.35)]"
            >
              {modoNuevo ? 'Cerrar nuevo trámite' : 'Nuevo trámite'}
            </button>
          </div>

          {modoNuevo && (
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-[0.15em]">Grupo</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      setMatriculaBuscada('');
                      setSelectedAlumnoId('');
                    }}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Todos los grupos</option>
                    {grupos.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-[0.15em]">Buscar alumno por matrícula</label>
                  <input
                    type="text"
                    value={matriculaBuscada}
                    onChange={(e) => {
                      setMatriculaBuscada(e.target.value);
                      setSelectedAlumnoId('');
                    }}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                    placeholder="Ej. 23422070050218"
                  />
                </div>
              </div>

              {matriculaBuscada.trim() && (
                <div className="rounded-3xl border border-slate-800/60 bg-slate-950/90 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Resultados</p>
                  <div className="space-y-2 max-h-52 overflow-auto pr-1">
                    {alumnosFiltrados.length > 0 ? (
                      alumnosFiltrados.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            setSelectedAlumnoId(String(a.id));
                            setMatriculaBuscada(a.matricula);
                          }}
                          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-white transition hover:border-cyan-400 hover:bg-slate-800"
                        >
                          <p className="text-sm font-medium text-cyan-200">{a.matricula}</p>
                          <p className="text-xs text-slate-400">{a.apellidoPaterno} {a.apellidoMaterno}, {a.nombres} · {a.grupo}</p>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No se encontraron alumnos con esa matrícula.</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-[0.15em]">Alumno</label>
                <select
                  value={selectedAlumnoId}
                  onChange={(e) => setSelectedAlumnoId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  disabled={alumnosFiltrados.length === 0}
                >
                  <option value="">Selecciona alumno</option>
                  {alumnosFiltrados.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.matricula} — {a.apellidoPaterno} {a.apellidoMaterno} {a.nombres}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-[0.15em]">Tipo de trámite</label>
                <select
                  value={tipoTramite}
                  onChange={(e) => setTipoTramite(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  <option value="Kardex">Kardex</option>
                  <option value="Boleta">Boleta</option>
                  <option value="Cambio de Turno">Cambio de Turno</option>
                  <option value="Constancia">Constancia</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {alumnoSeleccionado && (
                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400 mb-3">Datos del alumno seleccionado</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 text-slate-300 text-sm">
                      <p className="text-slate-500">Matrícula</p>
                      <p className="text-white">{alumnoSeleccionado.matricula}</p>
                    </div>
                    <div className="space-y-1 text-slate-300 text-sm">
                      <p className="text-slate-500">Nombre</p>
                      <p className="text-white">{alumnoSeleccionado.nombres}</p>
                    </div>
                    <div className="space-y-1 text-slate-300 text-sm">
                      <p className="text-slate-500">Apellido paterno</p>
                      <p className="text-white">{alumnoSeleccionado.apellidoPaterno}</p>
                    </div>
                    <div className="space-y-1 text-slate-300 text-sm">
                      <p className="text-slate-500">Apellido materno</p>
                      <p className="text-white">{alumnoSeleccionado.apellidoMaterno}</p>
                    </div>
                    <div className="space-y-1 text-slate-300 text-sm">
                      <p className="text-slate-500">Grupo</p>
                      <p className="text-white">{alumnoSeleccionado.grupo}</p>
                    </div>
                    <div className="space-y-1 text-slate-300 text-sm">
                      <p className="text-slate-500">Turno</p>
                      <p className="text-white">{alumnoSeleccionado.turno}</p>
                    </div>
                    <div className="space-y-1 text-slate-300 text-sm">
                      <p className="text-slate-500">Faltas</p>
                      <p className="text-white">{alumnoSeleccionado.faltas}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-[0.15em]">Motivo</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="mt-2 h-24 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder="Describe el motivo del trámite"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-[0.15em]">Observaciones (opcional)</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="mt-2 h-20 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button onClick={generarTramite} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  Generar trámite
                </button>
                <button onClick={() => setModoNuevo(false)} className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:border-slate-500">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-800/50 bg-slate-950/80 p-6 shadow-glow">
          <h3 className="text-lg font-semibold text-white mb-4">Solicitudes</h3>
          {loading ? (
            <p className="text-slate-400">Cargando solicitudes...</p>
          ) : tramites.length === 0 ? (
            <p className="text-slate-400">No hay trámites registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm text-left">
                <thead className="text-slate-300 text-xs uppercase tracking-wide border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Alumno</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Motivo</th>
                    <th className="px-3 py-2">Estatus</th>
                    <th className="px-3 py-2">Respuesta</th>
                    <th className="px-3 py-2">Creado</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tramites.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 text-slate-300">{idx + 1}</td>
                      <td className="px-3 py-2 text-slate-200">{t.alumno.matricula} — {t.alumno.apellidoPaterno} {t.alumno.apellidoMaterno} {t.alumno.nombres}</td>
                      <td className="px-3 py-2 text-slate-200">{t.tipo}</td>
                      <td className="px-3 py-2 text-slate-200">{t.motivo}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.estatus === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-200' : t.estatus === 'Generado' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
                          {t.estatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-200">{t.respuestaAdministrador ?? '-'}</td>
                      <td className="px-3 py-2 text-slate-400">{new Date(t.creadoEn).toLocaleString()}</td>
                      <td className="px-3 py-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleGenerarPdf(t)}
                          className="rounded-2xl bg-emerald-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          disabled={t.estatus !== 'Pendiente'}
                        >{t.estatus === 'Generado' ? 'Generado' : 'Generar PDF'}</button>
                        <button
                          onClick={() => handleRechazar(t)}
                          className="rounded-2xl bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                          disabled={t.estatus !== 'Pendiente'}
                        >Rechazar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
