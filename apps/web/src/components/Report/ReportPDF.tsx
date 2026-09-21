import React from 'react';
import {
  Award,
  ShieldCheck,
  Map as MapIcon,
  Globe,
  Target,
  Activity,
  Newspaper,
  ScrollText,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from 'recharts';
import { Opportunity, MonthlySnapshot } from '../../types';
import {
  podsMembers,
  regulations,
  staticKeyResults,
  staticKeyObjectives,
} from '../../data/reportData';

interface ReportPDFProps {
  reportRef: React.RefObject<HTMLDivElement | null>;
  selectedSnapshotId: string;
  snapshots: MonthlySnapshot[];
  businessStageData: any[];
  ecosystemData: any[];
  stackedChartData: any[];
  allUtilities: string[];
  utilitiesCountData: any[];
  winLossChunks: any[];
  winLossOnlyTotal: any[];
  groupStatsData: any[];
  openChunks: any[];
  colors: string[];
  stackColors: string[];
  winLossColors: { Win: string; Loss: string; Open: string };
  isWin: (stage?: string, status?: string) => boolean;
}

const PDFPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="pdf-page w-[210mm] min-h-[297mm] bg-white text-[#0f172a] p-[60px] box-border relative overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] flex flex-col mb-12 print:m-0 print:shadow-none font-sans">
    {/* Page Texture */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
    </div>
    {children}
  </div>
);

export const ReportPDF: React.FC<ReportPDFProps> = ({
  reportRef,
  selectedSnapshotId,
  snapshots,
  businessStageData,
  ecosystemData,
  stackedChartData,
  allUtilities,
  utilitiesCountData,
  winLossChunks,
  winLossOnlyTotal,
  groupStatsData,
  openChunks,
  colors,
  stackColors,
  winLossColors,
  isWin,
}) => {
  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId);

  return (
    <div ref={reportRef} className="flex flex-col gap-12 origin-top transition-transform duration-200 ease-out">
      {/* Cover Page */}
      <PDFPage>
            {/* Visual Cover Accent */}
            <div className="absolute inset-0 -z-10 bg-[#0a0a0a]" />
            <div className="absolute inset-0 -z-10 opacity-10 bg-[url('/Topology.png')] bg-cover mix-blend-overlay" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,0,0.1),transparent)]" />

            <div className="flex flex-col h-full relative z-10">
                <div className="flex justify-between items-start mb-20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Strategic Analytics</span>
                        <div className="w-12 h-1 bg-[var(--accent-color)] rounded-full" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Restricted Access</span>
                    </div>
                </div>

                <div className="mt-20">
                    <h1 className="text-[100px] font-black leading-[0.85] text-white m-0 tracking-tighter">
                        AMI <br/>
                        SOLUTIONS
                    </h1>
                    <div className="flex items-center gap-6 mt-12">
                        <div className="h-px flex-1 bg-white/5" />
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 whitespace-nowrap">Executive Performance Review</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    {selectedSnapshotId !== 'live' && (
                        <div className="inline-block text-[var(--accent-color)] font-black text-sm uppercase mt-8">
                            Period Archive: {selectedSnapshot?.month}/{selectedSnapshot?.year}
                        </div>
                    )}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-20">
                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-4">Report Structure</h3>
                        <ul className="list-none p-0 m-0 text-[10px] font-bold uppercase text-white/40 space-y-4">
                            {[
                                { n: '01', t: 'PODS Members', p: '02' },
                                { n: '02', t: 'Brazil Footprint', p: '03' },
                                { n: '03', t: 'LATAM Expansion', p: '04' },
                                { n: '04', t: 'Business Stages', p: '05' },
                                { n: '05', t: 'Ecosystem Insights', p: '06' },
                                { n: '06', t: 'Utilities Overview', p: '07' },
                                { n: '07', t: 'Win & Loss Analysis', p: '08' },
                                { n: '08', t: 'Strategic Pipelines', p: '15' },
                            ].map((item) => (
                                <li key={item.n} className="flex justify-between items-end group">
                                    <span className="text-white tabular-nums">{item.n}.</span>
                                    <span className="flex-1 border-b border-white/5 mx-3 mb-1" />
                                    <span className="text-white/40 font-medium group-hover:text-white transition-colors">{item.t}</span>
                                    <span className="ml-3 tabular-nums text-white/40">pg {item.p}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col justify-between items-end text-right">
                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-12 shadow-2xl border border-white/5">
                            <img src="/PODSS.png" alt="Logo" className="w-16 h-16 object-contain brightness-0 invert" />
                        </div>
                        <div className="text-[6rem] font-black italic leading-[0.8] text-white">
                            {String(new Date().getMonth() + 1).padStart(2, '0')}
                            <span className="text-white/10">.</span>
                            {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </div>
      </PDFPage>

      {/* PODS Members */}
      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Award size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">01. PODS Members</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Core Technical Leadership Team</p>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-12">
          {podsMembers.map((m) => (
            <div key={m.email} className="flex items-center justify-between bg-gray-50 border border-gray-100 p-6 rounded-[2rem] transition-all hover:bg-gray-100">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-black text-base">{m.name[0]}</div>
                <div>
                  <p className="font-black uppercase text-sm text-black m-0">
                    {m.name}
                  </p>
                  <p className="text-[10px] font-mono text-gray-400 mt-1 m-0">
                    {m.email}
                  </p>
                </div>
              </div>
              <ShieldCheck size={20} className="text-emerald-500 opacity-40" />
            </div>
          ))}
        </div>
        
        <div className="mt-auto p-12 border border-gray-100 rounded-[3rem] bg-gray-50/50 flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 mb-8 italic">System Topology & Architecture</span>
          <img src="/Topology.png" alt="Topology" className="max-h-[350px] mix-blend-multiply" />
        </div>
      </PDFPage>

      {/* Footprint */}
      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <MapIcon size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">02. Brazil Footprint</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">National Market Coverage</p>
                </div>
            </div>
        </div>
        <div className="flex-1 flex items-center justify-center border border-gray-100 rounded-[3rem] p-12 bg-gray-50/50">
          <img src="/Brazil Map.png" alt="Brazil Map" className="w-full h-full object-contain mix-blend-multiply" />
        </div>
      </PDFPage>

      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Globe size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">03. LATAM Expansion</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">International Strategic Growth</p>
                </div>
            </div>
        </div>
        <div className="flex-1 flex items-center justify-center border border-gray-100 rounded-[3rem] p-12 bg-gray-50/50">
          <img src="/LATAM Map.png" alt="LATAM Map" className="w-full h-full object-contain mix-blend-multiply" />
        </div>
      </PDFPage>

      {/* Charts */}
      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Target size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">04. Business Stages (Open)</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Active Pipeline Distribution</p>
                </div>
            </div>
        </div>
        <div className="flex-1 bg-gray-50/50 p-12 rounded-[3rem] border border-gray-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={businessStageData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#eee"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                fontSize={10}
                fontWeight={900}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#000' }}
              />
              <Bar
                dataKey="value"
                fill="#000"
                barSize={20}
                radius={[0, 10, 10, 0]}
                isAnimationActive={false}
              >
                <LabelList dataKey="value" position="right" fontSize={10} fontWeight={900} fill="#000" offset={15} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PDFPage>

      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Activity size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">05. Ecosystem Insights</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Market Ecosystem Penetration</p>
                </div>
            </div>
        </div>
        <div className="grid gap-10 h-full">
          <div className="flex-1 bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 flex flex-col">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center mb-10">
              Opportunities by Ecosystem
            </p>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={ecosystemData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    isAnimationActive={false}
                    fontSize={9}
                    fontWeight={700}
                    >
                    {ecosystemData.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} strokeWidth={4} stroke="#fff" />
                    ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, paddingTop: '20px' }} />
                </PieChart>
                </ResponsiveContainer>
            </div>
          </div>
          <div className="flex-1 bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 flex flex-col">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 text-center mb-10">
              Utilities per Ecosystem
            </p>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" fontSize={9} fontWeight={900} axisLine={false} tickLine={false} />
                    <YAxis fontSize={9} fontWeight={700} axisLine={false} tickLine={false} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 900, paddingTop: '10px' }} />
                    {allUtilities.map((util, index) => (
                    <Bar
                        key={util}
                        dataKey={util}
                        stackId="a"
                        fill={stackColors[index % stackColors.length]}
                        isAnimationActive={false}
                        barSize={40}
                    />
                    ))}
                </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </PDFPage>

      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Target size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">06. Utilities Overview</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Cumulative Opportunity Count</p>
                </div>
            </div>
        </div>
        <div className="flex-1 bg-gray-50/50 p-12 rounded-[3rem] border border-gray-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilitiesCountData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#eee"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                fontSize={9}
                fontWeight={900}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#000' }}
              />
              <Bar
                dataKey="value"
                fill="#000"
                barSize={12}
                radius={[0, 10, 10, 0]}
                isAnimationActive={false}
              >
                <LabelList dataKey="value" position="right" fontSize={9} fontWeight={900} fill="#000" offset={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PDFPage>

      {/* Win Loss Tables */}
      {winLossChunks.map((chunk, idx) => (
        <PDFPage key={`wl-${idx}`}>
          <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Award size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">
                    07. Win & Loss{' '}
                    {winLossChunks.length > 1 && idx > 0
                        ? `(${idx + 1}/${winLossChunks.length})`
                        : ''}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Closed Opportunity Analysis</p>
                </div>
            </div>
          </div>
          {chunk.isFirstPage && (
            <div className="h-[300px] mb-12 bg-gray-50/50 rounded-[3rem] border border-gray-100 p-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winLossOnlyTotal}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    isAnimationActive={false}
                    fontSize={10}
                    fontWeight={900}
                  >
                    <Cell fill={winLossColors.Win} strokeWidth={4} stroke="#fff" />
                    <Cell fill={winLossColors.Loss} strokeWidth={4} stroke="#fff" />
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {chunk.items.length > 0 && (
            <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm">
              <table className="w-full border-collapse text-[10px] table-fixed text-[#0f172a]">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-4 text-left uppercase font-black tracking-widest w-[15%] border-r border-white/10">Utility</th>
                    <th className="p-4 text-left uppercase font-black tracking-widest w-[35%] border-r border-white/10">Description</th>
                    <th className="p-4 text-left uppercase font-black tracking-widest w-[15%] border-r border-white/10">Stage</th>
                    <th className="p-4 text-left uppercase font-black tracking-widest w-[35%]">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.items.map((opp: any, i: number) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <td className="p-4 border-b border-gray-100 align-top break-words font-black">{opp.utility}</td>
                      <td className="p-4 border-b border-gray-100 align-top break-words font-medium">{opp.description}</td>
                      <td
                        className="p-4 border-b border-gray-100 align-top break-words font-black"
                        style={{
                          color: isWin(opp.businessStages, opp.status)
                            ? winLossColors.Win
                            : winLossColors.Loss,
                        }}
                      >
                        {opp.businessStages}
                      </td>
                      <td className="p-4 border-b border-gray-100 align-top break-words italic text-gray-400 font-medium">
                        {opp.reasonWinLoss || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PDFPage>
      ))}

      {/* Group Overviews */}
      {groupStatsData.map((g, idx) =>
        g.chunks.map((chunk: any, cIdx: number) => (
          <PDFPage key={`${g.name}-${cIdx}`}>
            <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">
                            {idx + 8}. {g.name} Overview{' '}
                            {g.chunks.length > 1 ? `(${cIdx + 1}/${g.chunks.length})` : ''}
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Cluster Specific Metrics</p>
                    </div>
                </div>
            </div>
            {chunk.isFirstPage && (
              <div className="h-[250px] mb-12 bg-gray-50/50 rounded-[3rem] border border-gray-100 p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={g.winLoss.filter((item: any) => item.name !== 'Open')}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} isAnimationActive={false} barSize={60}>
                      <Cell fill={winLossColors.Win} />
                      <Cell fill={winLossColors.Loss} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {chunk.items.length > 0 && (
              <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full border-collapse text-[10px] table-fixed text-[#0f172a]">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="p-4 text-left uppercase font-black tracking-widest w-[20%] border-r border-white/10">Utility</th>
                      <th className="p-4 text-left uppercase font-black tracking-widest w-[40%] border-r border-white/10">Description</th>
                      <th className="p-4 text-left uppercase font-black tracking-widest w-[20%] border-r border-white/10">Result</th>
                      <th className="p-4 text-right uppercase font-black tracking-widest w-[20%]">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.items.map((opp: any, i: number) => (
                      <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                        <td className="p-4 border-b border-gray-100 align-top break-words font-black">{opp.utility}</td>
                        <td className="p-4 border-b border-gray-100 align-top break-words font-medium">{opp.description}</td>
                        <td
                          className="p-4 border-b border-gray-100 align-top break-words font-black"
                          style={{
                            color: isWin(opp.businessStages, opp.status)
                              ? winLossColors.Win
                              : winLossColors.Loss,
                          }}
                        >
                          {opp.businessStages}
                        </td>
                        <td className="p-4 border-b border-gray-100 align-top break-words text-right italic text-gray-400 font-medium">
                          {opp.reasonWinLoss || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PDFPage>
        ))
      )}

      {/* Active Pipeline */}
      {openChunks.map((chunk, idx) => (
        <PDFPage key={`open-${idx}`}>
          <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Activity size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">
                    11. Active Pipeline{' '}
                    {openChunks.length > 1 ? `(${idx + 1}/${openChunks.length})` : ''}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Real-time Opportunity Tracking</p>
                </div>
            </div>
          </div>
          {chunk.items.length > 0 && (
            <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm">
              <table className="w-full border-collapse text-[7px] table-fixed text-[#0f172a]">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-2 text-left uppercase font-black border-r border-white/10 w-[15%]">Utility</th>
                    <th className="p-2 text-left uppercase font-black border-r border-white/10 w-[20%]">Description</th>
                    <th className="p-2 text-left uppercase font-black border-r border-white/10 w-[8%]">Group</th>
                    <th className="p-2 text-center uppercase font-black border-r border-white/10 w-[6%]">Start</th>
                    <th className="p-2 text-center uppercase font-black border-r border-white/10 w-[6%] text-emerald-400">End</th>
                    <th className="p-2 text-left uppercase font-black border-r border-white/10 w-[10%]">Country</th>
                    <th className="p-2 text-left uppercase font-black border-r border-white/10 w-[8%]">Eco</th>
                    <th className="p-2 text-left uppercase font-black border-r border-white/10 w-[12%]">Stage</th>
                    <th className="p-2 text-center uppercase font-black border-r border-white/10 w-[5%]">Qty</th>
                    <th className="p-2 text-left uppercase font-black w-[10%]">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.items.map((opp: any, i: number) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <td className="p-2 border-b border-gray-100 align-top break-words font-black">{opp.utility}</td>
                      <td className="p-2 border-b border-gray-100 align-top break-words font-medium">{opp.description}</td>
                      <td className="p-2 border-b border-gray-100 align-top break-words text-gray-400">
                        {String(opp.technicalSalesGroup || '').replace('Group', '').trim()}
                      </td>
                      <td className="p-2 border-b border-gray-100 align-top break-words text-center">{opp.yearStart}</td>
                      <td className="p-2 border-b border-gray-100 align-top break-words text-center font-black text-black">
                        {opp.yearEnd}
                      </td>
                      <td className="p-2 border-b border-gray-100 align-top break-words">{opp.country}</td>
                      <td className="p-2 border-b border-gray-100 align-top break-words">{opp.ecosystem}</td>
                      <td className="p-2 border-b border-gray-100 align-top break-words font-black uppercase text-[var(--accent-color)]">{opp.businessStages}</td>
                      <td className="p-2 border-b border-gray-100 align-top break-words text-center font-bold">{opp.quantity}</td>
                      <td className="p-2 border-b border-gray-100 align-top break-words italic text-gray-400 font-medium leading-tight">{opp.observation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PDFPage>
      ))}

      {/* Regulations */}
      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Newspaper size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">12. Key Regulations</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Legal & Compliance Roadmap</p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          {regulations.map((r) => (
            <div key={r.id} className="bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-10 h-[320px] flex flex-col justify-between hover:bg-gray-50 transition-colors">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-black text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">{r.tag}</span>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{r.date}</span>
                </div>
                <h4 className="text-xl font-black text-black mb-4 uppercase italic tracking-tight">{r.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{r.description}</p>
              </div>
            </div>
          ))}
        </div>
      </PDFPage>

      {/* OKR Result 2025 */}
      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <ScrollText size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">13. OKR Result 2025</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Fiscal Year Delivery Summary</p>
                </div>
            </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6">
            {staticKeyResults.map((r) => (
              <div key={r.id} className="bg-gray-50/50 border border-gray-100 p-8 rounded-[2rem] hover:bg-gray-50 transition-colors">
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-black m-0 uppercase italic tracking-tight">{r.goal}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 m-0">{r.delivery}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PDFPage>

      {/* OKR Objective 2026 */}
      <PDFPage>
        <div className="flex items-center justify-between border-b border-black pb-8 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                    <Target size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-black m-0">14. OKR Objective 2026</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Next Fiscal Year Strategic Pillars</p>
                </div>
            </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6">
            {staticKeyObjectives.map((o) => (
              <div key={o.id} className="bg-gray-50/50 border border-gray-100 p-8 rounded-[2rem] hover:bg-gray-50 transition-colors">
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-black m-0 uppercase italic tracking-tight">{o.goal}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2 m-0">Target Target: {o.delivery}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PDFPage>
    </div>
  );
};
