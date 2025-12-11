"use client";

import Link from "next/link";
import { 
  FileText, Video, Users, TrendingUp, 
  ArrowUpRight, Plus, Clock, Activity, 
  Search, Bell, ChevronRight, PlayCircle
} from "lucide-react";

export default function AdminDashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="pb-20">
      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">
        
        

        {/* --- Main Action Grid --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Actions */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-slate-400" size={18} /> 
              Content Management
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Articles Card */}
              <div className="group relative bg-white rounded-3xl p-1 shadow-sm border border-slate-200 hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-900/5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative p-7 h-full flex flex-col">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-6 group-hover:-translate-y-1 transition-transform">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Articles</h3>
                  <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
                    Manage written content, translations, and editorial blocks.
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link href="/admin/articles/new" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                      <Plus size={16} /> New
                    </Link>
                    <Link href="/admin/articles" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                      View All
                    </Link>
                  </div>
                </div>
              </div>

              {/* Media Card */}
              <div className="group relative bg-white rounded-3xl p-1 shadow-sm border border-slate-200 hover:border-emerald-300 transition-all hover:shadow-xl hover:shadow-emerald-900/5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative p-7 h-full flex flex-col">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mb-6 group-hover:-translate-y-1 transition-transform">
                    <PlayCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Watch & Listen</h3>
                  <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
                    Upload videos, audio tracks, and manage media metadata.
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link href="/admin/media" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                      <Plus size={16} /> Upload
                    </Link>
                    <Link href="/admin/media" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                      Library
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          
        </section>

      </main>
    </div>
  );
}