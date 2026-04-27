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
      <div className="mx-auto max-w-6xl animate-fadeInUp rounded-[2rem] border border-border-subtle bg-bg-surface/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border-subtle bg-bg-main p-8 shadow-[0_25px_90px_rgba(59,166,74,0.05)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,166,74,0.1),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(240,108,34,0.08),transparent_18%)] opacity-80" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cecyteq-green/80 font-bold">Panel escolar</p>
              <h2 className="text-3xl md:text-4xl font-black text-text-primary flex items-center gap-3 tracking-tighter">
                <BookOpen className="text-cecyteq-green" /> Trámites Escolares
              </h2>
              <p className="mt-3 max-w-2xl text-text-secondary font-medium">Gestiona solicitudes de kardex, constancias y cambios de turno con una experiencia visual e intuitiva.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-3xl border border-border-subtle bg-bg-surface px-4 py-3 text-text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-bg-surface/80">
                <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Solicitudes</p>
                <p className="mt-1 text-xl font-black text-cecyteq-green">{tramites.length}</p>
              </div>
              <div className="rounded-3xl border border-border-subtle bg-bg-surface px-4 py-3 text-text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-bg-surface/80">
                <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Alumnos</p>
                <p className="mt-1 text-xl font-black text-cecyteq-green">{alumnos.length}</p>
              </div>
              <div className="rounded-3xl border border-border-subtle bg-bg-surface px-4 py-3 text-text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-bg-surface/80">
                <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Generados</p>
                <p className="mt-1 text-xl font-black text-cecyteq-orange">{generados}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-border-subtle bg-bg-main/50 p-6 shadow-glow animate-fadeInUp">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-text-primary">Solicitudes de trámite</h3>
              <p className="text-text-secondary text-sm">Crea nuevo trámite o revisa las solicitudes existentes.</p>
            </div>
            <button
              onClick={() => setModoNuevo((prev) => !prev)}
              className="rounded-2xl bg-cecyteq-orange px-6 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cecyteq-orange/20"
            >
              {modoNuevo ? 'Cerrar' : 'Nuevo trámite'}
            </button>
          </div>

          {modoNuevo && (
            <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 space-y-6 shadow-inner">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Grupo</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      setMatriculaBuscada('');
                      setSelectedAlumnoId('');
                    }}
                    className="mt-2 w-full rounded-2xl border border-border-subtle bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-cecyteq-green"
                  >
                    <option value="">Todos los grupos</option>
                    {grupos.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Buscar por matrícula</label>
                  <input
                    type="text"
                    value={matriculaBuscada}
                    onChange={(e) => {
                      setMatriculaBuscada(e.target.value);
                      setSelectedAlumnoId('');
                    }}
                    className="mt-2 w-full rounded-2xl border border-border-subtle bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-cecyteq-green"
                    placeholder="Ej. 23422070050218"
                  />
                </div>
              </div>

              {matriculaBuscada.trim() && (
                <div className="rounded-3xl border border-border-subtle bg-bg-main/90 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-3 ml-1">Resultados</p>
                  <div className="space-y-2 max-h-52 overflow-auto pr-1">
                    {alumnosFiltrados.length > 0 ? (
                      alumnosFiltrados.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            setSelectedAlumnoId(String(a.id));
                            setMatriculaBuscada(a.matricula);
                          }}
                          className="w-full rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3 text-left text-text-primary transition hover:border-cecyteq-green hover:bg-bg-surface/80"
                        >
                          <p className="text-sm font-black text-cecyteq-green">{a.matricula}</p>
                          <p className="text-xs text-text-secondary font-medium">{a.apellidoPaterno} {a.apellidoMaterno}, {a.nombres} · {a.grupo}</p>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-text-secondary p-2">No se encontraron alumnos con esa matrícula.</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Alumno Seleccionado</label>
                <select
                  value={selectedAlumnoId}
                  onChange={(e) => setSelectedAlumnoId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border-subtle bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-cecyteq-green"
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
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Tipo de trámite</label>
                <select
                  value={tipoTramite}
                  onChange={(e) => setTipoTramite(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border-subtle bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-cecyteq-green"
                >
                  <option value="Kardex">Kardex</option>
                  <option value="Boleta">Boleta</option>
                  <option value="Cambio de Turno">Cambio de Turno</option>
                  <option value="Constancia">Constancia</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {alumnoSeleccionado && (
                <div className="rounded-3xl border border-border-subtle bg-bg-main p-5">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-text-secondary font-black mb-4 ml-1">Datos del alumno</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold uppercase">Matrícula</p>
                      <p className="text-text-primary font-bold">{alumnoSeleccionado.matricula}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold uppercase">Nombre</p>
                      <p className="text-text-primary font-bold">{alumnoSeleccionado.nombres}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold uppercase">Grupo</p>
                      <p className="text-text-primary font-bold">{alumnoSeleccionado.grupo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold uppercase">Turno</p>
                      <p className="text-text-primary font-bold">{alumnoSeleccionado.turno}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.15em] ml-1">Motivo</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="mt-2 h-24 w-full rounded-2xl border border-border-subtle bg-bg-main px-4 py-3 text-text-primary outline-none transition focus:border-cecyteq-green resize-none"
                  placeholder="Describe el motivo del trámite"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
                <button onClick={() => setModoNuevo(false)} className="px-6 py-3 rounded-2xl border border-border-subtle text-text-secondary font-bold hover:bg-bg-main transition-all">
                  Cancelar
                </button>
                <button onClick={generarTramite} className="px-8 py-3 rounded-2xl bg-cecyteq-green text-white font-black shadow-lg shadow-cecyteq-green/20 hover:scale-[1.02] transition-all">
                  Generar trámite
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-border-subtle bg-bg-surface p-6 shadow-glow">
          <h3 className="text-lg font-bold text-text-primary mb-6 ml-2">Historial de Solicitudes</h3>
          {loading ? (
            <p className="text-text-secondary p-4">Cargando solicitudes...</p>
          ) : tramites.length === 0 ? (
            <p className="text-text-secondary p-4">No hay trámites registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm text-left">
                <thead className="text-text-secondary text-[10px] font-black uppercase tracking-widest border-b border-border-subtle">
                  <tr>
                    <th className="px-4 py-4 text-center">#</th>
                    <th className="px-4 py-4">Alumno</th>
                    <th className="px-4 py-4">Tipo</th>
                    <th className="px-4 py-4">Estatus</th>
                    <th className="px-4 py-4">Respuesta</th>
                    <th className="px-4 py-4">Fecha</th>
                    <th className="px-4 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {tramites.map((t, idx) => (
                    <tr key={t.id} className="group hover:bg-bg-main/50 transition-colors">
                      <td className="px-4 py-4 text-center text-text-secondary font-bold">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <p className="text-text-primary font-bold">{t.alumno.matricula}</p>
                        <p className="text-xs text-text-secondary">{t.alumno.apellidoPaterno} {t.alumno.nombres}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-bg-main px-3 py-1 rounded-lg border border-border-subtle text-text-primary font-medium text-xs">
                          {t.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                          t.estatus === 'Pendiente' ? 'bg-cecyteq-orange/10 text-cecyteq-orange border-cecyteq-orange/20' : 
                          t.estatus === 'Generado' ? 'bg-cecyteq-green/10 text-cecyteq-green border-cecyteq-green/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {t.estatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-text-secondary text-xs italic">{t.respuestaAdministrador ?? 'Sin respuesta aún'}</td>
                      <td className="px-4 py-4 text-text-secondary text-xs">{new Date(t.creadoEn).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleGenerarPdf(t)}
                            className="rounded-xl bg-cecyteq-green/10 text-cecyteq-green border border-cecyteq-green/20 px-3 py-1.5 text-xs font-bold transition-all hover:bg-cecyteq-green hover:text-white disabled:opacity-30"
                            disabled={t.estatus !== 'Pendiente'}
                          >
                            {t.estatus === 'Generado' ? 'Listo' : 'Generar'}
                          </button>
                          <button
                            onClick={() => handleRechazar(t)}
                            className="rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 text-xs font-bold transition-all hover:bg-red-500 hover:text-white disabled:opacity-30"
                            disabled={t.estatus !== 'Pendiente'}
                          >
                            Rechazar
                          </button>
                        </div>
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
