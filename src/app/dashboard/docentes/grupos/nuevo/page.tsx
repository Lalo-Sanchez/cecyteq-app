import React from 'react';
import { Users, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NuevoGrupoPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeInUp">
      <div className="flex items-center gap-6">
        <Link href="/dashboard/docentes/grupos" className="w-12 h-12 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center text-text-secondary hover:text-cecyteq-green hover:border-cecyteq-green transition-all shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-text-primary flex items-center gap-3 tracking-tight">
            <Users className="text-cecyteq-green" /> Alta de Grupo Escolar
          </h2>
          <p className="text-text-secondary text-sm mt-1 font-medium">Configura un nuevo grupo para asignar materias, docentes y alumnos.</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 md:p-10 shadow-glow">
        <form className="space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-border-subtle pb-4">
              <div className="w-2 h-8 bg-cecyteq-green rounded-full"></div>
              <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Detalles del Grupo</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Identificador del Grupo</label>
                <input type="text" required className="w-full bg-bg-main border border-border-subtle rounded-2xl px-5 py-4 text-text-primary font-black focus:border-cecyteq-green outline-none transition-all uppercase tracking-wider" placeholder="Ej. 1A, 3B PROGRAMACIÓN" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Turno Escolar</label>
                <select required className="w-full bg-bg-main border border-border-subtle rounded-2xl px-5 py-4 text-text-primary focus:border-cecyteq-green outline-none transition-all appearance-none font-bold">
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-widest ml-1">Carga Académica (Materias)</label>
                <input type="number" defaultValue={9} min={1} max={15} required className="w-full bg-bg-main border border-border-subtle rounded-2xl px-5 py-4 text-text-primary focus:border-cecyteq-green outline-none transition-all font-bold" />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-border-subtle flex justify-end gap-4">
            <Link href="/dashboard/docentes/grupos" className="px-8 py-4 rounded-2xl border border-border-subtle text-text-secondary font-black uppercase tracking-widest hover:bg-bg-main transition-all">
              Cancelar
            </Link>
            <button type="button" className="px-10 py-4 rounded-2xl bg-cecyteq-green hover:bg-cecyteq-green/90 text-white font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-cecyteq-green/20 hover:scale-[1.02]">
              <Save size={20} /> Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
