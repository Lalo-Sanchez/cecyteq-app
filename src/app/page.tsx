"use client"; // Obligatorio en Next.js para usar useState y onClick

import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, FileText, 
  LogOut, CheckCircle, GraduationCap, 
  Calendar, Bell, Search, Briefcase, ChevronRight, UserCircle
} from 'lucide-react';

// --- TIPOS DE DATOS (TYPESCRIPT) ---
type RoleType = 'admin' | 'docente' | 'alumno' | null;

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [role, setRole] = useState<RoleType>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Pantalla de inicio de sesión
  if (!role) {
    return <LoginScreen onLogin={setRole} />;
  }

  // Estructura principal de la plataforma
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Barra Lateral Izquierda */}
      <Sidebar 
        role={role} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={() => {
          setRole(null);
          setActiveView('dashboard');
        }} 
      />

      {/* Contenedor Principal (Barra Superior + Contenido) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar role={role} />
        
        {/* Área donde cambian las pantallas */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="max-w-7xl mx-auto border border-slate-800/50 bg-slate-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            {activeView === 'dashboard' && <Dashboard role={role} />}
            {activeView === 'aula' && <AulaVirtual />}
            {activeView === 'alumnos' && <ModuloAlumnos />}
            {activeView === 'tramites' && <ModuloTramites />}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- COMPONENTES SECUNDARIOS ---

interface LoginScreenProps {
  onLogin: (role: RoleType) => void;
}

function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">CECYTEQ</h1>
        <p className="text-slate-400 mb-8 text-sm">Plataforma de Gestión Escolar Integral</p>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 text-left mb-2 uppercase tracking-wider">Ingresar como:</p>
          
          <LoginButton 
            title="Director / Administrativo" 
            icon={<Briefcase size={20} />} 
            onClick={() => onLogin('admin')} 
            color="from-emerald-500 to-teal-700"
          />
          <LoginButton 
            title="Docente" 
            icon={<BookOpen size={20} />} 
            onClick={() => onLogin('docente')} 
            color="from-blue-500 to-indigo-700"
          />
          <LoginButton 
            title="Alumno / Tutor" 
            icon={<Users size={20} />} 
            onClick={() => onLogin('alumno')} 
            color="from-purple-500 to-purple-700"
          />
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>v2.0.1</span>
          <span>Desarrollado por <b className="text-blue-400">Lesty</b></span>
        </div>
      </div>
    </div>
  );
}

interface LoginButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

function LoginButton({ title, icon, onClick, color }: LoginButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 transition-all group`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-linear-to-br ${color} text-white`}>
          {icon}
        </div>
        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{title}</span>
      </div>
      <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={20} />
    </button>
  );
}

interface TopBarProps {
  role: RoleType;
}

function TopBar({ role }: TopBarProps) {
  const getRoleName = () => {
    switch(role) {
      case 'admin': return 'Dirección General';
      case 'docente': return 'Prof. Carlos Mendoza';
      case 'alumno': return 'Ana Sofía Pérez (5to Semestre)';
      default: return 'Usuario';
    }
  };

  return (
    <header className="h-20 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
      <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-2 w-64 md:w-96 focus-within:border-blue-500 transition-colors">
        <Search className="text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar alumnos, clases o trámites..." 
          className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder-slate-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-200">{getRoleName()}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
          <UserCircle size={38} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}

interface SidebarProps {
  role: RoleType;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
}

function Sidebar({ role, activeView, setActiveView, onLogout }: SidebarProps) {
  const adminMenu = [
    { id: 'dashboard', label: 'Panel de Control', icon: <LayoutDashboard size={20} /> },
    { id: 'alumnos', label: 'Servicios Escolares', icon: <Users size={20} /> },
    { id: 'docentes', label: 'Servicios Docentes', icon: <Briefcase size={20} /> },
    { id: 'tramites', label: 'Trámites y Reportes', icon: <FileText size={20} /> },
  ];

  const docenteMenu = [
    { id: 'dashboard', label: 'Mi Día', icon: <LayoutDashboard size={20} /> },
    { id: 'aula', label: 'Aula Virtual', icon: <BookOpen size={20} /> },
    { id: 'alumnos', label: 'Pase de Lista', icon: <CheckCircle size={20} /> },
  ];

  const alumnoMenu = [
    { id: 'dashboard', label: 'Mi Resumen', icon: <LayoutDashboard size={20} /> },
    { id: 'aula', label: 'Aula Virtual', icon: <BookOpen size={20} /> },
    { id: 'tramites', label: 'Kardex y Boletas', icon: <FileText size={20} /> },
  ];

  const menuItems = role === 'admin' ? adminMenu : role === 'docente' ? docenteMenu : alumnoMenu;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-white leading-tight">CECYTEQ</h2>
          <p className="text-[10px] text-blue-400 tracking-widest uppercase">Powered by Lesty</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

interface DashboardProps {
  role: RoleType;
}

function Dashboard({ role }: DashboardProps) {
  if (role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Panel de Control General</h2>
          <p className="text-slate-400 text-sm mt-1">Visión global de la generación activa (1,042 alumnos).</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Alumnos Activos" value="1,042" subtitle="+12 ingresos recientes" color="blue" />
          <MetricCard title="Asistencia Global Hoy" value="94.5%" subtitle="57 ausencias detectadas" color="emerald" />
          <MetricCard title="Alertas de Riesgo" value="18" subtitle="Alumnos con +3 faltas" color="red" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Hola, {role === 'docente' ? 'Profesor(a)' : 'Ana'}</h2>
      <p className="text-slate-400 text-sm mt-1">Aquí tienes el resumen de tus actividades de hoy.</p>
    </div>
  );
}

function AulaVirtual() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Aula Virtual</h2>
          <p className="text-slate-400 text-sm mt-1">Gestión de clases, tareas y evidencias físicas.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ClassCard title="Programación Web I" group="Grupo 501" time="Lunes y Miércoles" color="border-blue-500/30 text-blue-400" />
        <ClassCard title="Cálculo Integral" group="Grupo 502" time="Martes y Jueves" color="border-emerald-500/30 text-emerald-400" />
      </div>
    </div>
  );
}

function ModuloAlumnos() {
  return (
    <div className="text-center p-10">
      <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white">Servicios Escolares</h2>
      <p className="text-slate-400 mt-2">Módulo en construcción: Base de datos de alumnos.</p>
    </div>
  );
}

function ModuloTramites() {
  return (
    <div className="text-center p-10">
      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white">Trámites y Reportes</h2>
      <p className="text-slate-400 mt-2">Módulo en construcción: Emisión de constancias.</p>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'emerald' | 'red';
}

function MetricCard({ title, value, subtitle, color }: MetricCardProps) {
  const colors = {
    blue: "from-blue-600/20 to-blue-900/10 border-blue-500/20 text-blue-400",
    emerald: "from-emerald-600/20 to-emerald-900/10 border-emerald-500/20 text-emerald-400",
    red: "from-red-600/20 to-red-900/10 border-red-500/20 text-red-400",
  };
  return (
    <div className={`bg-linear-to-br ${colors[color]} border rounded-2xl p-5`}>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="mt-2 mb-1"><span className="text-3xl font-bold text-white">{value}</span></div>
      <p className="text-xs font-medium opacity-80">{subtitle}</p>
    </div>
  );
}

interface ClassCardProps {
  title: string;
  group: string;
  time: string;
  color: string;
}

function ClassCard({ title, group, time, color }: ClassCardProps) {
  return (
    <div className={`border rounded-xl p-5 bg-slate-950/50 hover:scale-[1.02] transition-transform cursor-pointer`}>
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${color}`}>{group}</div>
      <h3 className="font-bold text-lg text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> {time}</p>
    </div>
  );
}