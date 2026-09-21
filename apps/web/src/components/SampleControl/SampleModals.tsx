import React, { useState } from 'react';
import { X, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

interface SampleModalsProps {
  showNotification: boolean;
  setShowNotification: (b: boolean) => void;
  notificationData: any[] | null;
  showDate: boolean;
  setShowDate: (b: boolean) => void;
  deadline: string;
  onSelectDeadline: (d: string) => void;
  fmt: (d: string) => string;
}

export const SampleModals: React.FC<SampleModalsProps> = ({
  showNotification,
  setShowNotification,
  notificationData,
  showDate,
  setShowDate,
  deadline,
  onSelectDeadline,
  fmt,
}) => {
  const [curMonth, setCurMonth] = useState(new Date());

  const calDays = () => {
    const arr = [];
    const fd = new Date(curMonth.getFullYear(), curMonth.getMonth(), 1).getDay();
    const nd = new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 0).getDate();
    for (let i = 0; i < fd; i++) arr.push(null);
    for (let i = 1; i <= nd; i++) arr.push(i);
    return arr;
  };

  const isPast = (day: number | null) => {
    if (!day) return false;
    const d = new Date(curMonth.getFullYear(), curMonth.getMonth(), day),
      t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const isSel = (day: number | null) => {
    if (!day || !deadline) return false;
    return (
      new Date(curMonth.getFullYear(), curMonth.getMonth(), day)
        .toISOString()
        .split('T')[0] === deadline
    );
  };

  const mName = curMonth.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const S = {
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
    <>
      {showNotification && notificationData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 70,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="fin"
            style={{
              background: '#0B1223',
              border: '1px solid rgba(239,68,68,0.28)',
              borderRadius: 24,
              maxWidth: 420,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.65)',
            }}
          >
            <div
              style={{
                padding: '17px 22px',
                borderBottom: '1px solid rgba(239,68,68,0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(239,68,68,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={16} color="#F87171" />
                <span style={{ ...(S.section as any), color: '#F87171' }}>
                  Envios com Prazo Próximo
                </span>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 22, maxHeight: 300, overflowY: 'auto' }}>
              {notificationData.map((s) => (
                <div
                  key={s.id}
                  style={{
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div
                      style={{
                        width: 3,
                        height: 40,
                        background: '#EF4444',
                        borderRadius: 99,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'white',
                          margin: '0 0 4px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {s.Modelo}
                      </h4>
                      <p
                        style={{
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.5)',
                          margin: '0 0 6px',
                        }}
                      >
                        {s.Concessionária} • {s.Cliente}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#F87171',
                            background: 'rgba(239,68,68,0.15)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Prazo próximo
                        </span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                          Deadline: {fmt(s.Deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                padding: '12px 22px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                gap: 8,
              }}
            >
              <button
                onClick={() => setShowNotification(false)}
                className="bm"
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {showDate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 60,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            className="fin"
            style={{
              background: '#0B1223',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              maxWidth: 340,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.65)',
            }}
          >
            <div
              style={{
                padding: '17px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={S.section as any}>Selecionar Deadline</span>
              <button
                onClick={() => setShowDate(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 22 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <button
                  onClick={() =>
                    setCurMonth(
                      new Date(curMonth.getFullYear(), curMonth.getMonth() - 1)
                    )
                  }
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8,
                    padding: 7,
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.38)',
                    display: 'flex',
                  }}
                >
                  <ChevronLeft size={15} />
                </button>
                <span
                  className="d"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  {mName}
                </span>
                <button
                  onClick={() =>
                    setCurMonth(
                      new Date(curMonth.getFullYear(), curMonth.getMonth() + 1)
                    )
                  }
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8,
                    padding: 7,
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.38)',
                    display: 'flex',
                  }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7,1fr)',
                  gap: 2,
                  marginBottom: 4,
                }}
              >
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: 'center',
                      fontSize: 9,
                      fontWeight: 800,
                      color: 'rgba(255,255,255,0.18)',
                      padding: '5px 0',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7,1fr)',
                  gap: 2,
                }}
              >
                {calDays().map((day, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!day) return;
                      onSelectDeadline(
                        new Date(curMonth.getFullYear(), curMonth.getMonth(), day)
                          .toISOString()
                          .split('T')[0]
                      );
                      setShowDate(false);
                    }}
                    disabled={!day || isPast(day)}
                    style={{
                      visibility: day ? 'visible' : 'hidden',
                      aspectRatio: '1',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      border: '1px solid transparent',
                      background: isSel(day) ? '#6366F1' : 'rgba(255,255,255,0.03)',
                      color: isSel(day)
                        ? 'white'
                        : isPast(day)
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(255,255,255,0.62)',
                      boxShadow: isSel(day)
                        ? '0 4px 14px rgba(99,102,241,0.4)'
                        : 'none',
                      cursor: isPast(day) || !day ? 'not-allowed' : 'pointer',
                      transition: 'all 0.14s',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {deadline && (
                <div
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 12,
                    padding: '11px 14px',
                    marginTop: 14,
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: '#818CF8',
                      textTransform: 'uppercase',
                      margin: '0 0 3px',
                    }}
                  >
                    Selecionado
                  </p>
                  <p
                    className="d"
                    style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}
                  >
                    {fmt(deadline)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
