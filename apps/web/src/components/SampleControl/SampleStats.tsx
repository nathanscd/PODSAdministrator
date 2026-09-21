import React from 'react';
import {
  BarChart2,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SampleStatsProps {
  counts: { total: number; pendente: number; atrasado: number; enviado: number };
  items: any[];
}

const STATUS_CONFIG = {
  Pendente: { color: '#3B82F6', text: '#60A5FA' },
  Atrasado: { color: '#EF4444', text: '#F87171' },
  Enviado: { color: '#10B981', text: '#34D399' },
};

const DonutChart = ({ counts }: { counts: any }) => {
  const total = counts.total || 1;
  const data = [
    { val: counts.pendente, color: '#3B82F6' },
    { val: counts.atrasado, color: '#EF4444' },
    { val: counts.enviado, color: '#10B981' },
  ];
  const r = 52,
    cx = 68,
    cy = 68,
    sw = 11;
  const circ = 2 * Math.PI * r;
  let off = 0;
  const arcs = data.map((d) => {
    const pct = d.val / total;
    const dash = pct * circ;
    const arc = { ...d, dash, gap: circ - dash, offset: off * circ };
    off += pct;
    return arc;
  });
  return (
    <svg width="136" height="136" viewBox="0 0 136 136">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={sw}
      />
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={a.color}
          strokeWidth={sw}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={-a.offset + circ / 4}
          style={{ transition: 'all 0.6s ease' }}
        />
      ))}
      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        fill="white"
        fontSize="21"
        fontWeight="800"
        fontFamily="Syne,sans-serif"
      >
        {counts.total}
      </text>
      <text
        x={cx}
        y={cx + 11}
        textAnchor="middle"
        fill="rgba(255,255,255,0.28)"
        fontSize="9"
        fontWeight="700"
        fontFamily="DM Sans,sans-serif"
        letterSpacing="1.2"
      >
        TOTAL
      </text>
    </svg>
  );
};

const Sparkline = ({ color, data }: { color: string; data: number[] }) => {
  if (!data || data.length < 2) return null;
  const W = 76,
    H = 30;
  const max = Math.max(...data, 1);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * (H - 2)}`)
    .join(' ');
  const fill = `M0,${H} ${pts
    .split(' ')
    .map((p, i) => (i === 0 ? `L${p}` : p))
    .join(' ')} L${W},${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg${color.replace('#', '')})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const TimelineBar = ({ items }: { items: any[] }) => {
  const grouped: Record<string, any> = {};
  items.forEach((s) => {
    const d = String(s.Deadline || '').substring(0, 7);
    if (!d) return;
    if (!grouped[d]) grouped[d] = { p: 0, a: 0, e: 0 };
    grouped[d][
      s.Status === 'Pendente' ? 'p' : s.Status === 'Atrasado' ? 'a' : 'e'
    ]++;
  });
  const months = Object.keys(grouped).sort().slice(-6);
  if (!months.length)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 72,
          fontSize: 11,
          color: 'rgba(255,255,255,0.18)',
          fontWeight: 600,
        }}
      >
        Nenhum dado ainda
      </div>
    );
  const maxVal = Math.max(
    ...months.map((m) => grouped[m].p + grouped[m].a + grouped[m].e),
    1
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        height: 80,
        padding: '0 4px',
      }}
    >
      {months.map((m) => {
        const g = grouped[m];
        const tot = g.p + g.a + g.e;
        const h = Math.max((tot / maxVal) * 60, tot > 0 ? 4 : 0);
        const lbl = new Date(m + '-01')
          .toLocaleDateString('pt-BR', { month: 'short' })
          .replace('.', '');
        return (
          <div
            key={m}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                width: '100%',
                height: 68,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <div
                title={`${tot} registros`}
                style={{
                  width: '100%',
                  height: h,
                  borderRadius: '4px 4px 3px 3px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'default',
                  transition: 'height 0.5s',
                }}
              >
                {g.e > 0 && <div style={{ flex: g.e, background: '#10B981' }} />}
                {g.p > 0 && <div style={{ flex: g.p, background: '#3B82F6' }} />}
                {g.a > 0 && <div style={{ flex: g.a, background: '#EF4444' }} />}
              </div>
            </div>
            <span
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.22)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {lbl}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const SampleStats: React.FC<SampleStatsProps> = ({ counts, items }) => {
  const S = {
    glass: {
      background: 'rgba(255,255,255,0.028)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(6px)',
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
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginBottom: 36,
          justifyContent: 'flex-end',
        }}
      >
        <DonutChart counts={counts} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(
            (k) => {
              const cfg = STATUS_CONFIG[k];
              const c =
                k === 'Pendente'
                  ? counts.pendente
                  : k === 'Atrasado'
                  ? counts.atrasado
                  : counts.enviado;
              const p = counts.total ? Math.round((c / counts.total) * 100) : 0;
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: cfg.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.42)',
                      fontWeight: 500,
                      minWidth: 95,
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: cfg.text,
                      minWidth: 20,
                      textAlign: 'right',
                    }}
                  >
                    {c}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.22)',
                      minWidth: 30,
                    }}
                  >
                    {p}%
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: 'Total de Envios',
            val: counts.total,
            color: '#818CF8',
            spark: [2, 3, 4, 3, 5, 4, counts.total],
            icon: BarChart2,
          },
          {
            label: 'Pendentes',
            val: counts.pendente,
            color: '#3B82F6',
            spark: [2, 3, 2, 4, 3, 3, counts.pendente],
            icon: Clock,
          },
          {
            label: 'Atrasados',
            val: counts.atrasado,
            color: '#EF4444',
            spark: [1, 1, 2, 1, 2, 1, counts.atrasado],
            icon: AlertCircle,
          },
          {
            label: 'Enviados',
            val: counts.enviado,
            color: '#10B981',
            spark: [0, 1, 2, 3, 2, 3, counts.enviado],
            icon: CheckCircle2,
          },
        ].map(({ label, val, color, spark, icon: Icon }) => (
          <div
            key={label}
            style={{
              ...S.glass,
              borderRadius: 18,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  background: `${color}16`,
                  border: `1px solid ${color}28`,
                  borderRadius: 9,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={14} color={color} />
              </div>
              <Sparkline color={color} data={spark} />
            </div>
            <div>
              <div
                className="d"
                style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: 'white' }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.28)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginTop: 5,
                }}
              >
                {label}
              </div>
            </div>
            {label !== 'Total de Envios' && counts.total > 0 && (
              <div
                style={{
                  height: 3,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: 3,
                    width: `${(val / counts.total) * 100}%`,
                    background: color,
                    borderRadius: 99,
                    transition: 'width 0.6s',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          ...S.glass,
          borderRadius: 18,
          padding: '20px 24px',
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 100 }}>
          <div style={{ ...S.section, marginBottom: 6 }}>Distribuição</div>
          <div className="d" style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
            por Mês
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <TimelineBar items={items} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            ['#3B82F6', 'Pendente'],
            ['#EF4444', 'Atrasado'],
            ['#10B981', 'Enviado'],
          ].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.32)',
                  fontWeight: 600,
                }}
              >
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
