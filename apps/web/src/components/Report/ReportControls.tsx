import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  BarChart3,
  History,
  Clock,
  Loader2,
  FileDown,
  ZoomOut,
  ZoomIn,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MonthlySnapshot } from '../../types';
import { motion } from 'framer-motion';

interface ReportControlsProps {
  viewMode: 'report' | 'overview';
  setViewMode: (mode: 'report' | 'overview') => void;
  selectedSnapshotId: string;
  setSelectedSnapshotId: (id: string) => void;
  snapshots: MonthlySnapshot[];
  zoomLevel: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleCreateSnapshot: () => void;
  handleExportPDF: () => void;
  isExporting: boolean;
}

export const ReportControls: React.FC<ReportControlsProps> = ({
  viewMode,
  setViewMode,
  selectedSnapshotId,
  setSelectedSnapshotId,
  snapshots,
  zoomLevel,
  handleZoomIn,
  handleZoomOut,
  handleResetZoom,
  handleCreateSnapshot,
  handleExportPDF,
  isExporting,
}) => {
  return (
    <>
      {viewMode === 'report' && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0d0d0d]/80 text-white px-8 py-4 rounded-3xl flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-2xl"
        >
          <button className="bg-none border-none text-white/40 cursor-pointer flex items-center hover:text-white transition-all active:scale-90" onClick={handleZoomOut}>
            <ZoomOut size={18} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Scale</span>
            <span className="text-xs font-mono font-bold tabular-nums text-[var(--accent-color)]">
                {(zoomLevel * 100).toFixed(0)}%
            </span>
          </div>
          <button className="bg-none border-none text-white/40 cursor-pointer flex items-center hover:text-white transition-all active:scale-90" onClick={handleZoomIn}>
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-6 bg-white/5 mx-2" />
          <button className="bg-none border-none text-white/40 cursor-pointer flex items-center hover:text-white transition-all active:scale-90" onClick={handleResetZoom}>
            <RotateCcw size={16} />
          </button>
        </motion.div>
      )}

      <div className="w-full max-w-[1400px] mx-auto">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 flex justify-between items-center flex-wrap gap-8 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)] mb-1">
                Data Snapshots
              </p>
              <div className="relative flex items-center">
                <select
                    value={selectedSnapshotId}
                    onChange={(e) => setSelectedSnapshotId(e.target.value)}
                    className="bg-transparent text-2xl font-black italic uppercase tracking-tighter border-none outline-none text-white cursor-pointer appearance-none pr-8 hover:text-[var(--accent-color)] transition-colors"
                >
                    <option value="live" className="bg-[#111] text-white">Current Report</option>
                    {snapshots.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#111] text-white">
                        Snapshot: {s.month}/{s.year}
                    </option>
                    ))}
                </select>
                <ChevronLeft size={20} className="absolute -right-2 rotate-[270deg] text-white/20 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/Reports" 
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all hover:border-white/20"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Dashboard</span>
            </Link>

            <div className="h-10 w-px bg-white/5 mx-2" />

            <button
              onClick={() => setViewMode(viewMode === 'report' ? 'overview' : 'report')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all hover:bg-white/10"
            >
              {viewMode === 'report' ? <BarChart3 size={16} /> : <History size={16} />}
              {viewMode === 'report' ? 'Analytics View' : 'Document View'}
            </button>

            {selectedSnapshotId === 'live' && (
              <button 
                onClick={handleCreateSnapshot} 
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <Clock size={16} /> Finalize Period
              </button>
            )}

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-gradient-to-br from-[var(--accent-color)] to-orange-600 text-white shadow-lg shadow-[var(--accent-color)]/20 hover:scale-105 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
            >
              {isExporting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <FileDown size={16} className="group-hover:translate-y-1 transition-transform" />
              )}{' '}
              Generate PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
