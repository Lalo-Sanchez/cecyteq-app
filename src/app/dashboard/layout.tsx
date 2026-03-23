"use client";

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="max-w-7xl mx-auto border border-slate-800/50 bg-slate-900/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}