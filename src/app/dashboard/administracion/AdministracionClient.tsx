"use client";

import React, { useState } from 'react';
import { ShieldCheck, Users, Lock, Key, Plus, Trash2, CheckCircle, XCircle, Info, ChevronRight, Settings } from 'lucide-react';
import { crearUsuarioAdministrativo, togglePermisoRol, eliminarUsuario } from '@/actions/administracion';

type Usuario = {
  id: number;
  email: string;
  nombreCompleto: string;
  estatus: boolean;
  rol: {
    id: number;
    nombre: string;
  }
};

type Rol = {
  id: number;
  nombre: string;
  descripcion: string | null;
  permisos: Permiso[];
};

type Permiso = {
  id: number;
  nombre: string;
};

export default function AdministracionClient({ 
  initialUsuarios, 
  initialRoles, 
  allPermisos 
}: { 
  initialUsuarios: any[], 
  initialRoles: any[], 
  allPermisos: any[] 
}) {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'permisos'>('usuarios');
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [roles, setRoles] = useState(initialRoles);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states for new user
  const [newUser, setNewUser] = useState({
    email: '',
    nombreCompleto: '',
    rolId: initialRoles[0]?.id || 0,
    password: ''
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await crearUsuarioAdministrativo(newUser);
    if (res.success) {
      setUsuarios([res.user, ...usuarios]);
      setShowNewUserModal(false);
      setNewUser({ email: '', nombreCompleto: '', rolId: initialRoles[0]?.id || 0, password: '' });
    } else {
      alert("Error: " + res.error);
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este acceso?")) return;
    const res = await eliminarUsuario(id);
    if (res.success) {
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const handleTogglePermiso = async (rolId: number, permisoId: number, currentStatus: boolean) => {
    const res = await togglePermisoRol(rolId, permisoId, !currentStatus);
    if (res.success) {
      // Optimistic update
      setRoles(roles.map(r => {
        if (r.id === rolId) {
          const newPermisos = !currentStatus 
            ? [...r.permisos, allPermisos.find((p: any) => p.id === permisoId)]
            : r.permisos.filter((p: any) => p.id !== permisoId);
          return { ...r, permisos: newPermisos };
        }
        return r;
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-border-subtle bg-bg-surface p-10 shadow-glow">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,108,34,0.08),transparent_25%)]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cecyteq-orange/10 border border-cecyteq-orange/20 text-cecyteq-orange text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              Centro de Seguridad
            </div>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">Administración</h1>
            <p className="text-text-secondary max-w-md">Gestiona los privilegios de los coordinadores y administrativos del sistema.</p>
          </div>
          
          <div className="flex bg-bg-main p-1 rounded-2xl border border-border-subtle">
            <button 
              onClick={() => setActiveTab('usuarios')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'usuarios' ? 'bg-cecyteq-orange text-white shadow-lg shadow-cecyteq-orange/20' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Usuarios
            </button>
            <button 
              onClick={() => setActiveTab('permisos')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'permisos' ? 'bg-cecyteq-orange text-white shadow-lg shadow-cecyteq-orange/20' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Módulos
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'usuarios' ? (
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Users className="text-cecyteq-orange" size={24} />
              Personal Administrativo
            </h2>
            <button 
              onClick={() => setShowNewUserModal(true)}
              className="flex items-center gap-2 bg-cecyteq-green hover:bg-cecyteq-green/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cecyteq-green/20"
            >
              <Plus size={18} />
              Nuevo Acceso
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((u) => (
              <div key={u.id} className="container-frost rounded-3xl border border-slate-800/50 p-6 group transition-all hover:border-orange-500/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <Lock size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{u.nombreCompleto}</h3>
                <p className="text-slate-500 text-sm mb-4">{u.email}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.rol.nombre === 'admin' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {u.rol.nombre}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Activo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="text-orange-400" size={24} />
            <h2 className="text-xl font-bold text-white">Configuración de Privilegios por Rol</h2>
          </div>

          <div className="grid gap-8">
            {roles.map((rol) => (
              <div key={rol.id} className="container-frost rounded-3xl border border-slate-800/50 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{rol.nombre}</h3>
                    <p className="text-slate-400 text-sm mt-1">{rol.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>{rol.permisos.length} Permisos Activos</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allPermisos.map((permiso) => {
                    const isGranted = rol.permisos.some((p: any) => p.id === permiso.id);
                    return (
                      <button
                        key={permiso.id}
                        onClick={() => handleTogglePermiso(rol.id, permiso.id, isGranted)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                          isGranted 
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-wider mb-0.5">
                            {permiso.nombre.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] opacity-70">Acceso al módulo</span>
                        </div>
                        {isGranted ? <CheckCircle size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-slate-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl animate-scaleIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-orange-400" />
              Crear Nuevo Acceso
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                  value={newUser.nombreCompleto}
                  onChange={e => setNewUser({...newUser, nombreCompleto: e.target.value})}
                  placeholder="Ej. Lic. Roberto Carlos"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Correo Institucional</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  placeholder="usuario@cecyteq.edu.mx"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Rol en el Sistema</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-all appearance-none"
                  value={newUser.rolId}
                  onChange={e => setNewUser({...newUser, rolId: parseInt(e.target.value)})}
                >
                  {initialRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Creando...' : 'Dar Acceso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
