"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Users, AlertCircle, ArrowLeft, Save } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="w-10 h-10 border-4 border-cecyteq-green border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-main p-6 lg:p-10 animate-fadeInUp">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <Link href="/dashboard/alumnos" className="inline-flex items-center gap-2 text-text-secondary hover:text-cecyteq-green transition-colors text-xs font-black uppercase tracking-widest mb-2">
              <ArrowLeft size={14} /> Volver al listado
            </Link>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">
              {isEditing ? 'Editar Expediente' : 'Nuevo Ingreso'}
            </h1>
            <p className="text-text-secondary font-medium">Completa la información institucional para dar de alta al alumno.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 shadow-glow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-cecyteq-green/10 rounded-xl flex items-center justify-center text-cecyteq-green">
                <GraduationCap size={20} />
              </div>
              <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">1. Información del Alumno</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Nombre(s)*</label>
                <input value={formData.nombres} onChange={(e) => setFormData((f) => ({ ...f, nombres: e.target.value }))} required className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Apellido Paterno*</label>
                <input value={formData.apellidoPaterno} onChange={(e) => setFormData((f) => ({ ...f, apellidoPaterno: e.target.value }))} required className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Apellido Materno*</label>
                <input value={formData.apellidoMaterno} onChange={(e) => setFormData((f) => ({ ...f, apellidoMaterno: e.target.value }))} required className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Turno*</label>
                <select value={formData.turno} onChange={(e) => setFormData((f) => ({ ...f, turno: e.target.value as TurnoType, grupo: '' }))} className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold appearance-none">
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Grupo Asignado*</label>
                <select value={formData.grupo} onChange={(e) => setFormData((f) => ({ ...f, grupo: e.target.value }))} required className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold appearance-none">
                  <option value="">Seleccione grupo</option>
                  {obtenerGruposPorTurno(formData.turno).map((g) => (<option key={g} value={g}>{g}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Edad</label>
                <input type="number" value={formData.edad} min={14} max={99} onChange={(e) => setFormData((f) => ({ ...f, edad: Number(e.target.value) }))} className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold" />
              </div>

              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Teléfono</label>
                  <input value={formData.telefono} onChange={(e) => setFormData((f) => ({ ...f, telefono: e.target.value }))} className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Estatus Escolar</label>
                  <select value={formData.estatus} onChange={(e) => setFormData((f) => ({ ...f, estatus: e.target.value as EstatusType }))} className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold appearance-none">
                    <option value="Inscrito">Inscrito</option>
                    <option value="Baja Temporal">Baja Temporal</option>
                    <option value="Baja">Baja</option>
                    <option value="Egresado">Egresado</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Dirección Completa</label>
                <input value={formData.direccion} onChange={(e) => setFormData((f) => ({ ...f, direccion: e.target.value }))} className="w-full bg-bg-main border border-border-subtle text-text-primary p-3.5 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold" />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Observaciones Académicas</label>
                <textarea value={formData.observaciones} onChange={(e) => setFormData((f) => ({ ...f, observaciones: e.target.value }))} className="w-full bg-bg-main border border-border-subtle text-text-primary p-4 rounded-2xl outline-none focus:border-cecyteq-green transition-all font-bold min-h-[100px] resize-none" placeholder="Escribe notas relevantes aquí..." />
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4 p-6 bg-bg-main rounded-3xl border border-border-subtle">
              <div className="flex-1 space-y-1">
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Matrícula (Sistema)</p>
                <p className="text-xl font-black text-cecyteq-green tracking-wider">{matricula}</p>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Correo Institucional</p>
                <p className="text-xl font-black text-cecyteq-orange tracking-tight">{mano}</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: TUTORES */}
          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 shadow-glow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-cecyteq-orange/10 rounded-xl flex items-center justify-center text-cecyteq-orange">
                <Users size={20} />
              </div>
              <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">2. Datos de Tutores</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 p-6 bg-bg-main rounded-[1.5rem] border border-border-subtle">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4">Tutor Principal</p>
                <input placeholder="Nombre Completo" value={formData.padre1Nombre} onChange={(e) => setFormData((f) => ({ ...f, padre1Nombre: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-orange transition-all font-bold" />
                <input placeholder="Teléfono de contacto" value={formData.padre1Telefono} onChange={(e) => setFormData((f) => ({ ...f, padre1Telefono: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-orange transition-all font-bold" />
                <input placeholder="Ocupación" value={formData.padre1Ocupacion} onChange={(e) => setFormData((f) => ({ ...f, padre1Ocupacion: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-orange transition-all font-bold" />
              </div>
              <div className="space-y-4 p-6 bg-bg-main rounded-[1.5rem] border border-border-subtle">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4">Tutor Secundario</p>
                <input placeholder="Nombre Completo" value={formData.padre2Nombre} onChange={(e) => setFormData((f) => ({ ...f, padre2Nombre: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-orange transition-all font-bold" />
                <input placeholder="Teléfono de contacto" value={formData.padre2Telefono} onChange={(e) => setFormData((f) => ({ ...f, padre2Telefono: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-orange transition-all font-bold" />
                <input placeholder="Ocupación" value={formData.padre2Ocupacion} onChange={(e) => setFormData((f) => ({ ...f, padre2Ocupacion: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-orange transition-all font-bold" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: EMERGENCIA */}
          <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 shadow-glow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-cecyteq-red/10 rounded-xl flex items-center justify-center text-cecyteq-red">
                <AlertCircle size={20} />
              </div>
              <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">3. Protocolo de Emergencia</h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {['padre1', 'padre2', 'otro'].map((tipo) => (
                  <label key={tipo} className={`cursor-pointer px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${formData.contactoEmergenciaTipo === tipo ? 'bg-cecyteq-red/10 border-cecyteq-red text-cecyteq-red font-black' : 'bg-bg-main border-border-subtle text-text-secondary font-bold hover:border-text-secondary'}`}>
                    <input type="radio" name="contactoEmergenciaTipo" value={tipo} checked={formData.contactoEmergenciaTipo === tipo} onChange={(e) => setFormData((f) => ({ ...f, contactoEmergenciaTipo: e.target.value as 'padre1' | 'padre2' | 'otro' }))} className="hidden" />
                    <span className="text-xs uppercase tracking-widest">{tipo === 'padre1' ? 'Tutor 1' : tipo === 'padre2' ? 'Tutor 2' : 'Otra Persona'}</span>
                  </label>
                ))}
              </div>

              {formData.contactoEmergenciaTipo === 'otro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-bg-main rounded-3xl border border-red-500/20 animate-fadeIn">
                  <input placeholder="Nombre" value={formData.otroNombre} onChange={(e) => setFormData((f) => ({ ...f, otroNombre: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-red transition-all font-bold" />
                  <input placeholder="Apellidos" value={formData.otroApellidos} onChange={(e) => setFormData((f) => ({ ...f, otroApellidos: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-red transition-all font-bold" />
                  <input placeholder="Parentesco" value={formData.otroParentesco} onChange={(e) => setFormData((f) => ({ ...f, otroParentesco: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-red transition-all font-bold" />
                  <input placeholder="Teléfono" value={formData.otroTelefono} onChange={(e) => setFormData((f) => ({ ...f, otroTelefono: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-red transition-all font-bold" />
                  <input placeholder="Ocupación" value={formData.otroOcupacion} onChange={(e) => setFormData((f) => ({ ...f, otroOcupacion: e.target.value }))} className="w-full bg-bg-surface border border-border-subtle text-text-primary p-3 rounded-xl outline-none focus:border-cecyteq-red transition-all font-bold" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-4 pt-6">
            <Link href="/dashboard/alumnos" className="px-10 py-4 rounded-2xl border border-border-subtle text-text-secondary font-black uppercase tracking-widest hover:bg-bg-surface transition-all text-center">
              Cancelar
            </Link>
            <button type="submit" className="px-12 py-4 rounded-2xl bg-cecyteq-green text-white font-black uppercase tracking-widest shadow-lg shadow-cecyteq-green/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <Save size={18} /> {isEditing ? 'Guardar Cambios' : 'Registrar Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
