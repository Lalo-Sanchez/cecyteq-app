import React from 'react';
import { Users, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NuevoGrupoPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/docentes/grupos" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-cyan-500" /> Creación de Grupo Escolar
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configura un nuevo grupo para asignar materias, docentes y alumnos.</p>
        </div>
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-glow">
        <form className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-800 pb-2">Información del Grupo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Nombre del Grupo</label>
                <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all uppercase" placeholder="Ej. 1A, 3B PROGRAMACIÓN" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Turno</label>
                <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all appearance-none">
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Número Estimado de Materias</label>
                <input type="number" defaultValue={9} min={1} max={15} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
            <Link href="/dashboard/docentes/grupos" className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">
              Cancelar
            </Link>
            <button type="button" className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20">
              <Save size={20} /> Guardar Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
