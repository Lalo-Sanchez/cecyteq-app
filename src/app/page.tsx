"use client"; // Obligatorio en Next.js para usar interactividad

import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, FileText, 
  LogOut, CheckCircle, GraduationCap, 
  Calendar, Bell, Search, Briefcase, UserCircle,
  Mail, Lock
} from 'lucide-react';

// Simulación interna de la función de login para que la vista previa compile sin errores
const loginUser = async (email: string, password_hash: string) => {
  return new Promise<{success: boolean, role?: string, error?: string}>((resolve) => {
    setTimeout(() => {
      if (password_hash === '1234') {
        if (email === 'admin@cecyteq.edu.mx') resolve({ success: true, role: 'admin' });
        else if (email === 'docente@cecyteq.edu.mx') resolve({ success: true, role: 'docente' });
        else if (email === 'alumno@cecyteq.edu.mx') resolve({ success: true, role: 'alumno' });
        else resolve({ success: false, error: 'El correo no existe en la base de datos institucional.' });
      } else {
        resolve({ success: false, error: 'Contraseña incorrecta.' });
      }
    }, 1000);
  });
};

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Conexión REAL a la Base de Datos con Prisma
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Llamamos a nuestro servidor (Server Action)
      const result = await loginUser(email, password);
      
      if (result.success) {
        onLogin(result.role as RoleType); // Lo dejamos entrar
      } else {
        setError(result.error || 'Error desconocido'); // Mostramos el error real de la BD
      }
    } catch (err) {
      console.error(err);
      setError('Error crítico de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center">CECYTEQ N°5</h1>
          <p className="text-slate-400 text-sm mt-1 text-center">Plataforma de Gestión Escolar Integral</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <CheckCircle size={16} className="text-red-500" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Correo Institucional
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@cecyteq.edu.mx"
                required
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">¿Olvidaste tu contraseña?</a>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-4 text-slate-500">O continuar con</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl py-2.5 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium text-slate-200">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl py-2.5 transition-colors">
            <svg className="w-5 h-5 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.7 3.58-.6 1.58.15 2.82.72 3.82 1.83-3.15 1.89-2.63 5.92.54 7.23-1.05 2.65-2.28 3.56-2.99 3.71zm-4.32-15.01c.21-2.01 1.6-3.79 3.47-4.27-.42 2.15-2.07 3.75-3.69 4.22-.11.05-.21.05-.22.05z"/>
            </svg>
            <span className="text-sm font-medium text-slate-200">Apple</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500">
          <span>v2.0.1</span>
          <span>Desarrollado por <b className="text-blue-400">Lesty</b></span>
        </div>
      </div>
      
      {/* Datos de prueba para el desarrollo */}
      <div className="absolute bottom-4 text-xs text-slate-600 text-center pointer-events-none">
        <p>Asegúrate de estar registrado en la base de datos de CECyTEQ.</p>
      </div>
    </div>
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