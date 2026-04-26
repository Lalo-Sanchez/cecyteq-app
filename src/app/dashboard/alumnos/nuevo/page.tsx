"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Users, AlertCircle } from 'lucide-react';

const PROGRAMAS_MATUTINO = [
  'TPROG-AM', 'TPGA-AM', 'TTPLAS-AM', 'TMECA-AM', 'TMECA-AMBI',
  'TMANTI-AM', 'TMANTI-AMBI', 'TELECA-AM', 'TELECA-AMBI'
] as const;
const PROGRAMAS_VESPERTINO = PROGRAMAS_MATUTINO.map((g) =>
  g.replace('-AMBI', '-AVBY').replace('-AM', '-AV')
) as unknown as readonly string[];
const SEMESTRES = [1, 2, 3, 4, 5, 6] as const;
const MATRICULA_BASE = BigInt('23422070050218');

type TurnoType = 'Matutino' | 'Vespertino';

type EstatusType = 'Inscrito' | 'Baja Temporal' | 'Baja' | 'Egresado';

interface FormData {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  turno: TurnoType;
  grupo: string;
  edad: number;
  telefono: string;
  direccion: string;
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

const obtenerGruposPorTurno = (turno: TurnoType) => {
  const programas = turno === 'Matutino' ? PROGRAMAS_MATUTINO : PROGRAMAS_VESPERTINO;
  return SEMESTRES.flatMap((s) => programas.map((p) => `${s}${p}`)).filter((grupo) => !['2TRH-PM', '6AMBI-AM', '6AMBI-AVBY'].includes(grupo.toUpperCase()));
};

const obtenerCorreoInstitucional = (nombres: string, apellidoPaterno: string) => {
  const primerNombre = nombres.trim().split(' ')[0]?.toLowerCase() || '';
  const primerApellido = apellidoPaterno.trim().split(' ')[0]?.toLowerCase() || '';
  return `${primerNombre}${primerApellido}@cecyteq.edu.mx`;
};

const calcularMatriculaSiguiente = (alumnos: Array<{ matricula: string }>) => {
  const maxActual = alumnos.reduce((max, al) => {
    const num = BigInt(al.matricula || '0');
    return num > max ? num : max;
  }, MATRICULA_BASE - BigInt(1));
  return (maxActual + BigInt(1)).toString();
};

export default function NuevoAlumnoPage() {
  const [formData, setFormData] = useState<FormData>({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    turno: 'Matutino',
    grupo: '',
    edad: 15,
    telefono: '',
    direccion: '',
    estatus: 'Inscrito',
    observaciones: '',
    padre1Nombre: '',
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
    otroParentesco: '',
  });
  const [matricula, setMatricula] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/alumnos');
        const data = await res.json();
        
        if (editId) {
          const idNum = parseInt(editId, 10);
          const alumno = data.find((a: { id: number }) => a.id === idNum);
          
          if (alumno) {
            setFormData({
              nombres: alumno.nombres,
              apellidoPaterno: alumno.apellidoPaterno,
              apellidoMaterno: alumno.apellidoMaterno,
              turno: alumno.turno,
              grupo: alumno.grupo,
              edad: alumno.edad || 15,
              telefono: alumno.telefono || '',
              direccion: alumno.direccion || '',
              estatus: alumno.estatus,
              observaciones: alumno.observaciones || '',
              padre1Nombre: alumno.padre1Nombre || '',
              padre1Telefono: alumno.padre1Telefono || '',
              padre1Ocupacion: alumno.padre1Ocupacion || '',
              padre2Nombre: alumno.padre2Nombre || '',
              padre2Telefono: alumno.padre2Telefono || '',
              padre2Ocupacion: alumno.padre2Ocupacion || '',
              contactoEmergenciaTipo: alumno.contactoEmergenciaTipo || 'padre1',
              otroNombre: alumno.otroNombre || '',
              otroApellidos: alumno.otroApellidos || '',
              otroTelefono: alumno.otroTelefono || '',
              otroOcupacion: alumno.otroOcupacion || '',
              otroParentesco: alumno.otroParentesco || '',
            });
            setMatricula(alumno.matricula);
            setIsEditing(true);
          }
        } else {
          setMatricula(calcularMatriculaSiguiente(data));
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    load();
  }, [editId]);

  const mano = obtenerCorreoInstitucional(formData.nombres, formData.apellidoPaterno);

  const getContactoEmergencia = () => {
    if (formData.contactoEmergenciaTipo === 'padre1') {
      return {
        nombre: formData.padre1Nombre || 'Padre/Tutor 1',
        telefono: formData.padre1Telefono,
      };
    }
    if (formData.contactoEmergenciaTipo === 'padre2') {
      return {
        nombre: formData.padre2Nombre || 'Padre/Tutor 2',
        telefono: formData.padre2Telefono,
      };
    }
    return {
      nombre: `${formData.otroNombre} ${formData.otroApellidos}`,
      telefono: formData.otroTelefono,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emergencia = getContactoEmergencia();

    const payload = {
      id: editId,
      nombres: formData.nombres,
      apellidoPaterno: formData.apellidoPaterno,
      apellidoMaterno: formData.apellidoMaterno,
      turno: formData.turno,
      grupo: formData.grupo,
      edad: formData.edad,
      faltas: 0,
      telefono: formData.telefono,
      direccion: formData.direccion,
      estatus: formData.estatus,
      correo: mano,
      matricula,
      observaciones: formData.observaciones,
      contactoEmergenciaNombre: emergencia.nombre,
      contactoEmergenciaTelefono: emergencia.telefono,
      padre1Nombre: formData.padre1Nombre,
      padre1Telefono: formData.padre1Telefono,
      padre1Ocupacion: formData.padre1Ocupacion,
      padre2Nombre: formData.padre2Nombre,
      padre2Telefono: formData.padre2Telefono,
      padre2Ocupacion: formData.padre2Ocupacion,
      contactoEmergenciaTipo: formData.contactoEmergenciaTipo,
      otroNombre: formData.otroNombre,
      otroApellidos: formData.otroApellidos,
      otroTelefono: formData.otroTelefono,
      otroOcupacion: formData.otroOcupacion,
      otroParentesco: formData.otroParentesco,
    };

    const method = isEditing ? 'PUT' : 'POST';
    const response = await fetch('/api/alumnos', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Error al ${isEditing ? 'actualizar' : 'registrar'} alumno: ` + errorText);
      return;
    }

    router.push('/dashboard/alumnos');
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{isEditing ? 'Editar Alumno' : 'Registrar Alumno'}</h1>
        <Link href="/dashboard/alumnos" className="text-sm px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100">Regresar a Listado</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <section className="border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wide mb-4 flex items-center gap-2"><GraduationCap size={16} /> 1. Datos del Alumno</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400" htmlFor="nombres">Nombre(s)*</label>
              <input id="nombres" value={formData.nombres} onChange={(e) => setFormData((f) => ({ ...f, nombres: e.target.value }))} required className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="apellidoPaterno">Apellido Paterno*</label>
              <input id="apellidoPaterno" value={formData.apellidoPaterno} onChange={(e) => setFormData((f) => ({ ...f, apellidoPaterno: e.target.value }))} required className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="apellidoMaterno">Apellido Materno*</label>
              <input id="apellidoMaterno" value={formData.apellidoMaterno} onChange={(e) => setFormData((f) => ({ ...f, apellidoMaterno: e.target.value }))} required className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="turno">Turno*</label>
              <select id="turno" value={formData.turno} onChange={(e) => setFormData((f) => ({ ...f, turno: e.target.value as TurnoType, grupo: '' }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded">
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="grupo">Grupo*</label>
              <select id="grupo" value={formData.grupo} onChange={(e) => setFormData((f) => ({ ...f, grupo: e.target.value }))} required className="w-full bg-slate-800 text-slate-200 p-2 rounded">
                <option value="">Seleccione grupo</option>
                {obtenerGruposPorTurno(formData.turno).map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400" htmlFor="edad">Edad</label>
              <input id="edad" type="number" value={formData.edad} min={14} max={99} onChange={(e) => setFormData((f) => ({ ...f, edad: Number(e.target.value) }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>

            <div>
              <label className="text-xs text-slate-400" htmlFor="telefono">Teléfono</label>
              <input id="telefono" value={formData.telefono} onChange={(e) => setFormData((f) => ({ ...f, telefono: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-400" htmlFor="direccion">Dirección</label>
              <input id="direccion" value={formData.direccion} onChange={(e) => setFormData((f) => ({ ...f, direccion: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-slate-400" htmlFor="estatus">Estatus</label>
              <select id="estatus" value={formData.estatus} onChange={(e) => setFormData((f) => ({ ...f, estatus: e.target.value as EstatusType }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded">
                <option value="Inscrito">Inscrito</option>
                <option value="Baja Temporal">Baja Temporal</option>
                <option value="Baja">Baja</option>
                <option value="Egresado">Egresado</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-slate-400" htmlFor="observaciones">Observaciones</label>
              <textarea id="observaciones" value={formData.observaciones} onChange={(e) => setFormData((f) => ({ ...f, observaciones: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded min-h-21" placeholder="Ej. alumno con necesidades especiales, notas importantes..." />
            </div>

            <div>
              <label className="text-xs text-slate-400" htmlFor="matricula">Matrícula (auto generada)</label>
              <input id="matricula" type="text" value={matricula} readOnly className="w-full bg-slate-700 text-slate-300 p-2 rounded cursor-not-allowed font-mono" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400" htmlFor="correo">Correo Institucional (auto generado)</label>
              <input id="correo" type="email" value={mano} readOnly className="w-full bg-slate-700 text-slate-300 p-2 rounded cursor-not-allowed" />
            </div>
          </div>
        </section>

        <section className="border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wide mb-4 flex items-center gap-2"><Users size={16} /> 2. Datos de Padres/Tutores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 mb-2">Tutor 1</p>
              <input placeholder="Nombre" value={formData.padre1Nombre} onChange={(e) => setFormData((f) => ({ ...f, padre1Nombre: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded mb-2" />
              <input placeholder="Teléfono" value={formData.padre1Telefono} onChange={(e) => setFormData((f) => ({ ...f, padre1Telefono: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded mb-2" />
              <input placeholder="Ocupación" value={formData.padre1Ocupacion} onChange={(e) => setFormData((f) => ({ ...f, padre1Ocupacion: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <p className="text-xs font-semibold text-slate-400 mb-2">Tutor 2</p>
              <input placeholder="Nombre" value={formData.padre2Nombre} onChange={(e) => setFormData((f) => ({ ...f, padre2Nombre: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded mb-2" />
              <input placeholder="Teléfono" value={formData.padre2Telefono} onChange={(e) => setFormData((f) => ({ ...f, padre2Telefono: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded mb-2" />
              <input placeholder="Ocupación" value={formData.padre2Ocupacion} onChange={(e) => setFormData((f) => ({ ...f, padre2Ocupacion: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
          </div>
        </section>

        <section className="border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-red-300 uppercase tracking-wide mb-4 flex items-center gap-2"><AlertCircle size={16} /> 3. Contacto de Emergencia</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {['padre1', 'padre2', 'otro'].map((tipo) => (
              <label key={tipo} className={`cursor-pointer px-3 py-2 rounded-xl border ${formData.contactoEmergenciaTipo === tipo ? 'bg-red-500/10 border-red-500 text-red-300' : 'bg-slate-950 border-slate-700 text-slate-300'}`}>
                <input type="radio" name="contactoEmergenciaTipo" value={tipo} checked={formData.contactoEmergenciaTipo === tipo} onChange={(e) => setFormData((f) => ({ ...f, contactoEmergenciaTipo: e.target.value as 'padre1' | 'padre2' | 'otro' }))} className="hidden" />
                <span className="text-xs">{tipo === 'padre1' ? 'Padre/Tutor 1' : tipo === 'padre2' ? 'Padre/Tutor 2' : 'Otro'}</span>
              </label>
            ))}
          </div>
          {formData.contactoEmergenciaTipo === 'otro' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="Nombre" value={formData.otroNombre} onChange={(e) => setFormData((f) => ({ ...f, otroNombre: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
              <input placeholder="Apellidos" value={formData.otroApellidos} onChange={(e) => setFormData((f) => ({ ...f, otroApellidos: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
              <input placeholder="Parentesco" value={formData.otroParentesco} onChange={(e) => setFormData((f) => ({ ...f, otroParentesco: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
              <input placeholder="Teléfono" value={formData.otroTelefono} onChange={(e) => setFormData((f) => ({ ...f, otroTelefono: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
              <input placeholder="Ocupación" value={formData.otroOcupacion} onChange={(e) => setFormData((f) => ({ ...f, otroOcupacion: e.target.value }))} className="w-full bg-slate-800 text-slate-200 p-2 rounded" />
            </div>
          )}
        </section>

        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400">Matrícula (oculta): {matricula}</p>
          <p className="text-xs text-slate-400">Correo (oculto): {mano}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Guardar y regresar</button>
          <Link href="/dashboard/alumnos" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
