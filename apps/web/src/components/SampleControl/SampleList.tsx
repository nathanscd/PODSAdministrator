import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Truck,
  AlertCircle,
  Clock3,
  Activity,
  Edit2,
  Trash2,
  Save,
  Hash,
  Package,
  Building2,
  ClipboardList,
  Calendar,
} from 'lucide-react';

interface SampleListProps {
  items: any[];
  isLoading: boolean;
  search: string;
  setSearch: (s: string) => void;
  filterSt: string;
  setFilterSt: (s: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editData: any;
  setEditData: (data: any) => void;
  saveEdit: () => Promise<boolean>;
  removeItem: (id: string) => Promise<void>;
  quickChangeStatus: (id: string, st: string) => Promise<void>;
  deletingId: string | null;
  submitting: boolean;
  calculateDaysRemaining: (d: string) => number | null;
  calculateElapsedDays: (c: string) => number;
}

const STATUS_CONFIG: Record<string, any> = {
  Pendente: {
    icon: Clock3,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.22)',
    text: '#60A5FA',
  },
  Atrasado: {
    icon: AlertCircle,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.22)',
    text: '#F87171',
  },
  Enviado: {
    icon: Truck,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.22)',
    text: '#34D399',
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pendente'];
  const Icon = cfg.icon;
  return (
    <span
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.text,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {status}
    </span>
  );
};

export const SampleList: React.FC<SampleListProps> = ({
  items,
  isLoading,
  search,
  setSearch,
  filterSt,
  setFilterSt,
  editingId,
  setEditingId,
  editData,
  setEditData,
  saveEdit,
  removeItem,
  quickChangeStatus,
  deletingId,
  submitting,
  calculateDaysRemaining,
  calculateElapsedDays,
}) => {
  const [showFilt, setShowFilt] = useState(false);
  const [showQuickStatus, setShowQuickStatus] = useState<string | null>(null);

  const S = {
    section: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.18em',
      color: 'rgba(255,255,255,0.38)',
      textTransform: 'uppercase',
      fontFamily: "'Syne',sans-serif",
    },
    glass: {
      background: 'rgba(255,255,255,0.028)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(6px)',
    },
    field: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      color: 'white',
      fontFamily: "'DM Sans',sans-serif",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 500,
      transition: 'border-color 0.18s, box-shadow 0.18s',
    },
    label: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.15em',
      color: 'rgba(255,255,255,0.3)',
      textTransform: 'uppercase',
    },
  };

  const fmt = (d: string) =>
    !d ? '--/--/----' : String(d).split('-').reverse().join('/');

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <h2
          className="d"
          style={{
            ...(S.section as any),
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 160,
          }}
        >
          Envios em Andamento
          <span
            style={{
              background: 'rgba(99,102,241,0.14)',
              border: '1px solid rgba(99,102,241,0.27)',
              color: '#818CF8',
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 20,
              fontWeight: 800,
            }}
          >
            {items.length}
          </span>
        </h2>
        <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 260 }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.22)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fi"
            style={{ ...S.field, width: '100%', padding: '8px 12px 8px 32px', fontSize: 12 }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFilt((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '8px 13px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <Filter size={12} />
            {filterSt}
            <ChevronDown
              size={11}
              style={{
                transform: showFilt ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>
          {showFilt && (
            <div
              className="fin"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                background: '#0D1525',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: 6,
                zIndex: 20,
                minWidth: 165,
                boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
              }}
            >
              {['Todos', 'Pendente', 'Atrasado', 'Enviado'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setFilterSt(opt);
                    setShowFilt(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 11px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      filterSt === opt ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: filterSt === opt ? '#818CF8' : 'rgba(255,255,255,0.45)',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            ...S.glass,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
          }}
        >
          <Loader2 size={30} className="spin" style={{ color: '#6366F1' }} />
          <p
            style={{
              marginTop: 14,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.18)',
              textTransform: 'uppercase',
            }}
          >
            Sincronizando...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            border: '1px dashed rgba(255,255,255,0.07)',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '72px 24px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Truck size={20} color="rgba(255,255,255,0.1)" />
          </div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.16)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 5px',
            }}
          >
            Sem Registros
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.14)', margin: 0 }}>
            Cadastre um envio acima
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {items.map((s, i) => {
            const cfg = STATUS_CONFIG[s.Status] || STATUS_CONFIG['Pendente'];
            const daysRemaining = calculateDaysRemaining(s.Deadline);
            const elapsedDays = calculateElapsedDays(s.createdAt);
            const isUrgent =
              daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;
            const isEditing = editingId === s.id;

            return (
              <div
                key={s.id}
                className="rc fin"
                style={{
                  padding: '15px 18px',
                  background: isUrgent
                    ? 'rgba(239,68,68,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  borderColor: isUrgent
                    ? 'rgba(239,68,68,0.28)'
                    : 'rgba(255,255,255,0.06)',
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
                        gap: 10,
                      }}
                    >
                      {[
                        { label: 'Linha', key: 'Linha', icon: Hash },
                        { label: 'Modelo', key: 'Modelo', icon: Package },
                        { label: 'Concessionária', key: 'Concessionária', icon: Building2 },
                        { label: 'Cliente', key: 'Cliente', icon: ClipboardList },
                        { label: 'Quantidade', key: 'Quantidade', icon: Hash },
                      ].map(({ label, key, icon: Icon }) => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <label style={{ ...(S.label as any), fontSize: 9 }}>{label}</label>
                          <div style={{ position: 'relative' }}>
                            <Icon
                              size={12}
                              style={{
                                position: 'absolute',
                                left: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255,255,255,0.2)',
                              }}
                            />
                            <input
                              type="text"
                              value={editData[key] || ''}
                              onChange={(e) =>
                                setEditData({ ...editData, [key]: e.target.value })
                              }
                              className="fi"
                              style={{ ...S.field, width: '100%', padding: '8px 10px 8px 32px', fontSize: 11 }}
                            />
                          </div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ ...(S.label as any), fontSize: 9 }}>Deadline</label>
                        <div style={{ position: 'relative' }}>
                          <Calendar
                            size={12}
                            style={{
                              position: 'absolute',
                              left: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: 'rgba(255,255,255,0.2)',
                            }}
                          />
                          <input
                            type="date"
                            value={editData.Deadline || ''}
                            onChange={(e) =>
                              setEditData({ ...editData, Deadline: e.target.value })
                            }
                            className="fi"
                            style={{ ...S.field, width: '100%', padding: '8px 10px 8px 32px', fontSize: 11 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{ ...(S.label as any), fontSize: 9 }}>Justificativa</label>
                      <textarea
                        value={editData.Justificativa || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, Justificativa: e.target.value })
                        }
                        className="fi"
                        style={{
                          ...S.field,
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: 11,
                          minHeight: 60,
                          resize: 'vertical',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <label style={{ ...(S.label as any), fontSize: 9 }}>Comentários</label>
                      <textarea
                        value={editData.Comentários || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, Comentários: e.target.value })
                        }
                        className="fi"
                        style={{
                          ...S.field,
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: 11,
                          minHeight: 60,
                          resize: 'vertical',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={submitting}
                        className="bm"
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {submitting ? (
                          <Loader2 size={10} className="spin" />
                        ) : (
                          <Save size={10} />
                        )}
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        flexWrap: 'wrap',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
                      >
                        <div
                          style={{
                            width: 3,
                            height: 38,
                            background: cfg.color,
                            borderRadius: 99,
                            opacity: 0.65,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: 'rgba(255,255,255,0.12)',
                            minWidth: 18,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 9,
                            marginBottom: 6,
                          }}
                        >
                          <h3
                            className="d"
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: 'white',
                              margin: 0,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {s.Modelo}
                          </h3>
                          <StatusBadge status={s.Status} />
                          {isUrgent && (
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.28)',
                                color: '#F87171',
                                fontSize: 9,
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: 6,
                              }}
                            >
                              <AlertCircle size={10} />
                              {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '5px 16px',
                            fontSize: 10,
                            color: 'rgba(255,255,255,0.5)',
                          }}
                        >
                          <span>
                            <strong>Linha:</strong> {s.Linha}
                          </span>
                          <span>
                            <strong>Concessionária:</strong> {s.Concessionária}
                          </span>
                          <span>
                            <strong>Cliente:</strong> {s.Cliente}
                          </span>
                          <span>
                            <strong>Qtd:</strong> {s.Quantidade}
                          </span>
                          <span>
                            <strong>Deadline:</strong> {fmt(s.Deadline)}
                          </span>
                        </div>
                        {s.Comentários && (
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 10,
                              color: 'rgba(255,255,255,0.4)',
                              fontStyle: 'italic',
                              borderLeft: '2px solid rgba(99,102,241,0.3)',
                              paddingLeft: 10,
                            }}
                          >
                            {s.Comentários}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        paddingTop: 10,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.35)',
                          fontWeight: 600,
                        }}
                      >
                        <Clock3 size={12} />
                        <span>
                          {elapsedDays} dia{elapsedDays !== 1 ? 's' : ''} em processamento
                        </span>
                      </div>
                      <div style={{ flex: 1 }} />
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() =>
                            setShowQuickStatus(showQuickStatus === s.id ? null : s.id)
                          }
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            background: 'rgba(99,102,241,0.12)',
                            border: '1px solid rgba(99,102,241,0.28)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            color: '#818CF8',
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          <Activity size={11} />
                          Mudar Status
                        </button>
                        {showQuickStatus === s.id && (
                          <div
                            className="fin"
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 'calc(100% + 6px)',
                              background: '#0D1525',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 10,
                              padding: 6,
                              zIndex: 20,
                              minWidth: 140,
                              boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
                            }}
                          >
                            {Object.keys(STATUS_CONFIG).map((st) => (
                              <button
                                key={st}
                                onClick={() => {
                                  quickChangeStatus(s.id, st);
                                  setShowQuickStatus(null);
                                }}
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '8px 10px',
                                  borderRadius: 7,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background:
                                    s.Status === st ? 'rgba(99,102,241,0.15)' : 'transparent',
                                  color: s.Status === st ? '#818CF8' : 'rgba(255,255,255,0.45)',
                                  fontSize: 10,
                                  fontWeight: 600,
                                  fontFamily: "'DM Sans',sans-serif",
                                }}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingId(s.id);
                          setEditData({ ...s });
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          border: '1px solid rgba(255,255,255,0.07)',
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255,255,255,0.2)',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => removeItem(s.id)}
                        disabled={deletingId === s.id}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          border: '1px solid rgba(255,255,255,0.07)',
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255,255,255,0.2)',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                      >
                        {deletingId === s.id ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
