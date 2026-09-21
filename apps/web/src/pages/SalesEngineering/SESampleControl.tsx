'use client';

import { useState } from 'react';
import { Truck } from 'lucide-react';
import { useFavicon, useTitle } from '../../hooks/useTitle';
import { useSampleControl } from '../../hooks/useSampleControl';
import { SampleStats } from '../../components/SampleControl/SampleStats';
import { SampleForm } from '../../components/SampleControl/SampleForm';
import { SampleList } from '../../components/SampleControl/SampleList';
import { SampleModals } from '../../components/SampleControl/SampleModals';

export default function SampleControl() {
  useTitle('Controle de Envios');
  useFavicon('/locate.png');

  const {
    isLoading,
    submitting,
    deletingId,
    editingId,
    setEditingId,
    editData,
    setEditData,
    search,
    setSearch,
    filterSt,
    setFilterSt,
    showNotification,
    setShowNotification,
    notificationData,
    filteredItems,
    counts,
    handleAdd,
    saveEdit,
    quickChangeStatus,
    removeItem,
    calculateDaysRemaining,
    calculateElapsedDays,
  } = useSampleControl();

  const [showDate, setShowDate] = useState(false);
  const [showQuickStat, setShowQuickStat] = useState(false);
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState('Pendente');

  const fmt = (d: string) =>
    !d ? '--/--/----' : String(d).split('-').reverse().join('/');

  const S = {
    page: {
      minHeight: '100vh',
      background: '#07091562',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    },
    inner: {
      position: 'relative',
      zIndex: 1,
      maxWidth: 1180,
      margin: '0 auto',
      padding: '40px 24px',
    },
    section: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.18em',
      color: 'rgba(255,255,255,0.38)',
      textTransform: 'uppercase',
      fontFamily: "'Syne',sans-serif",
    },
  };

  return (
    <div style={S.page as any}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .d { font-family: 'Syne', sans-serif !important; }
        .orb { position:fixed;border-radius:50%;filter:blur(140px);pointer-events:none;z-index:0; }
        input::placeholder,textarea::placeholder { color:rgba(255,255,255,0.18); }
        input:focus,button:focus { outline:none; }
        .fi:focus { border-color:rgba(99,102,241,0.55) !important; box-shadow:0 0 0 3px rgba(99,102,241,0.1) !important; }
        .rc { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;transition:background 0.16s,border-color 0.16s,transform 0.16s; }
        .rc:hover { background:rgba(255,255,255,0.055);border-color:rgba(99,102,241,0.28);transform:translateY(-1px); }
        .bm { background:linear-gradient(135deg,#6366F1,#4F46E5);box-shadow:0 4px 20px rgba(99,102,241,0.3);transition:transform 0.15s,box-shadow 0.15s;border:none;cursor:pointer;color:white;font-family:'DM Sans',sans-serif; }
        .bm:hover { transform:translateY(-1px);box-shadow:0 6px 28px rgba(99,102,241,0.45); }
        .bm:active { transform:scale(0.98); }
        .bm:disabled { opacity:.45;cursor:not-allowed;transform:none; }
        .fw { overflow:hidden;transition:max-height 0.4s cubic-bezier(.4,0,.2,1),opacity 0.3s; }
        .fw.o { max-height:900px;opacity:1; }
        .fw.c { max-height:0;opacity:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation:spin 0.9s linear infinite; }
        @keyframes fadein { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none} }
        .fin { animation:fadein 0.22s ease both; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08);border-radius:2px; }
      `}</style>

      <div
        className="orb"
        style={{
          width: 700,
          height: 700,
          top: -280,
          left: -220,
          background: 'rgba(79,70,229,0.11)',
        }}
      />
      <div
        className="orb"
        style={{
          width: 440,
          height: 440,
          bottom: 0,
          right: -150,
          background: 'rgba(16,185,129,0.07)',
        }}
      />

      <div style={S.inner as any}>
        <header
          style={{
            marginBottom: 36,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  background: 'rgba(99,102,241,0.18)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Truck size={12} color="#818CF8" />
              </div>
              <span style={S.section as any}>Dashboard Operacional</span>
            </div>
            <h1
              className="d"
              style={{
                fontSize: 42,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
              }}
            >
              Controle de
              <br />
              <span style={{ color: '#818CF8' }}>Envios</span>
            </h1>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 14,
                color: 'rgba(255,255,255,0.32)',
                lineHeight: 1.65,
                maxWidth: 400,
              }}
            >
              Gestão centralizada de envios, prazos críticos e rastreamento de status de
              entregas.
            </p>
          </div>
          <SampleStats counts={counts} items={filteredItems} />
        </header>

        <SampleForm
          onAdd={handleAdd}
          submitting={submitting}
          onShowDate={() => setShowDate(true)}
          onShowStatus={() => setShowQuickStat(true)}
          deadline={newDeadline}
          status={newStatus}
        />

        <SampleList
          items={filteredItems}
          isLoading={isLoading}
          search={search}
          setSearch={setSearch}
          filterSt={filterSt}
          setFilterSt={setFilterSt}
          editingId={editingId}
          setEditingId={setEditingId}
          editData={editData}
          setEditData={setEditData}
          saveEdit={saveEdit}
          removeItem={removeItem}
          quickChangeStatus={quickChangeStatus}
          deletingId={deletingId}
          submitting={submitting}
          calculateDaysRemaining={calculateDaysRemaining}
          calculateElapsedDays={calculateElapsedDays}
        />

        <footer
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 26,
            marginTop: 40,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.1)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Sistema de Controle de Envios &amp; Logística
          </p>
        </footer>
      </div>

      <SampleModals
        showNotification={showNotification}
        setShowNotification={setShowNotification}
        notificationData={notificationData}
        showDate={showDate}
        setShowDate={setShowDate}
        deadline={newDeadline}
        onSelectDeadline={setNewDeadline}
        fmt={fmt}
      />
    </div>
  );
}