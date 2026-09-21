'use client';

import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { useAMIReport } from '../hooks/useAMIReport';
import { ReportControls } from '../components/Report/ReportControls';
import { ReportOverview } from '../components/Report/ReportOverview';
import { ReportPDF } from '../components/Report/ReportPDF';

export default function AMIWinLossReport() {
  const {
    snapshots,
    selectedSnapshotId,
    setSelectedSnapshotId,
    viewMode,
    setViewMode,
    loading,
    isExporting,
    zoomLevel,
    reportRef,
    COLORS,
    STACK_COLORS,
    WIN_LOSS_COLORS,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    businessStageData,
    ecosystemData,
    utilitiesCountData,
    stackedChartData,
    allUtilities,
    winLossChunks,
    winLossOnlyTotal,
    groupStatsData,
    openChunks,
    evolutionData,
    handleCreateSnapshot,
    handleExportPDF,
    isWin,
  } = useAMIReport();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[var(--accent-color)]/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Aggregating Enterprise Data...</span>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] selection:bg-[var(--accent-color)] selection:text-white">
        {/* Immersive Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[var(--accent-color)]/5 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]"
          />
        </div>

        <div className="relative z-10 p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col gap-10">
          <ReportControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedSnapshotId={selectedSnapshotId}
            setSelectedSnapshotId={setSelectedSnapshotId}
            snapshots={snapshots}
            zoomLevel={zoomLevel}
            handleZoomIn={handleZoomIn}
            handleZoomOut={handleZoomOut}
            handleResetZoom={handleResetZoom}
            handleCreateSnapshot={handleCreateSnapshot}
            handleExportPDF={handleExportPDF}
            isExporting={isExporting}
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            {viewMode === 'overview' ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/5 p-10 shadow-2xl">
                    <ReportOverview
                        evolutionData={evolutionData}
                        groupStatsData={groupStatsData}
                        winLossColors={WIN_LOSS_COLORS}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center py-16 bg-[#0f0f0f] rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative scale-90 md:scale-100 transition-transform duration-700">
                        <ReportPDF
                            reportRef={reportRef}
                            selectedSnapshotId={selectedSnapshotId}
                            snapshots={snapshots}
                            businessStageData={businessStageData}
                            ecosystemData={ecosystemData}
                            stackedChartData={stackedChartData}
                            allUtilities={allUtilities}
                            utilitiesCountData={utilitiesCountData}
                            winLossChunks={winLossChunks}
                            winLossOnlyTotal={winLossOnlyTotal}
                            groupStatsData={groupStatsData}
                            openChunks={openChunks}
                            colors={COLORS}
                            stackColors={STACK_COLORS}
                            winLossColors={WIN_LOSS_COLORS}
                            isWin={isWin}
                        />
                    </div>
                </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}