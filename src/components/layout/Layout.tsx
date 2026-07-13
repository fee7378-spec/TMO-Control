import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Users, Activity, Play } from 'lucide-react';
import { cn } from '../../utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Registro', href: '/historico', icon: History },
  { name: 'Esteiras', href: '/esteiras', icon: Settings },
  { name: 'Analistas', href: '/analistas', icon: Users },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 text-slate-300 min-h-screen flex flex-col">
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
