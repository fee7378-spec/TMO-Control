import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Users, Activity, Play } from 'lucide-react';
import { cn, formatTime } from '../../utils';
import { useTimerStore } from '../../store/timerStore';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Registro', href: '/historico', icon: History },
  { name: 'Esteiras', href: '/esteiras', icon: Settings },
  { name: 'Analistas', href: '/analistas', icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const { timers, tick } = useTimerStore();

  useEffect(() => {
    const hasRunning = timers.some(t => t.isRunning);
    if (!hasRunning) return;
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [timers, tick]);

  const runningTimers = timers.filter(t => t.isRunning || t.elapsedTime > 0);
  const showPopup = location.pathname !== '/historico' && runningTimers.length > 0;

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-screen flex flex-col relative">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Activity className="h-6 w-6 text-blue-800 mr-2" />
        <span className="font-bold text-lg text-white">TMO Control</span>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-900 text-white border-l-4 border-blue-400"
                  : "hover:bg-slate-900 hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {showPopup && (
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Cronômetros Ativos
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {runningTimers.map((t, idx) => (
              <div key={t.id} className="bg-slate-800 rounded-lg p-3 flex flex-col gap-1 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Cronômetro {idx + 1}</span>
                  {t.isRunning ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <div className="text-lg font-mono font-bold text-white tabular-nums tracking-tight">
                  {formatTime(t.elapsedTime)}
                </div>
              </div>
            ))}
          </div>
          <NavLink to="/historico" className="mt-3 block w-full text-center text-xs text-blue-400 hover:text-blue-300">
            Ir para Registro &rarr;
          </NavLink>
        </div>
      )}
    </aside>
  );
}

export function Topbar() {
  const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex flex-col">
        {/* Removed title */}
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500 capitalize">{date}</span>
        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-800 font-bold">
          AD
        </div>
      </div>
    </header>
  );
}

export function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1 p-6">
            <Outlet />
          </div>
          <footer className="py-4 text-center text-sm text-slate-500 border-t border-slate-200 bg-white">
            &copy; Developed by Felipe Nascimento
          </footer>
        </main>
      </div>
    </div>
  );
}
