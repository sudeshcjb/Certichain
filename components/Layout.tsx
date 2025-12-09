import React from 'react';
import { LayoutDashboard, PlusCircle, Server, FileCheck } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Server size={18} className="text-white" />
            </div>
            CertiChain
          </div>
          <p className="text-xs text-slate-500 mt-2">Academic Integrity Ledger</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView(AppView.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.DASHBOARD ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="font-medium">Ledger Overview</span>
          </button>

          <button
            onClick={() => setView(AppView.ISSUER)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.ISSUER ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'
            }`}
          >
            <PlusCircle size={18} />
            <span className="font-medium">Issue Certificate</span>
          </button>

          <button
            onClick={() => setView(AppView.AUDITOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.AUDITOR ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'
            }`}
          >
            <FileCheck size={18} />
            <span className="font-medium">Auditor & Verification</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
          <p>Security Demo</p>
          <p>CI7100 Coursework</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;