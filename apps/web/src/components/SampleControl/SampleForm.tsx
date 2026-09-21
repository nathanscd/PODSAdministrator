import React, { useState } from 'react';
import {
  Plus,
  Package,
  Building2,
  ClipboardList,
  Calendar,
  Hash,
  FileText,
  Activity,
  Loader2,
  ChevronDown,
} from 'lucide-react';

interface SampleFormProps {
  onAdd: (item: any) => Promise<boolean>;
  submitting: boolean;
  onShowDate: () => void;
  onShowStatus: () => void;
  deadline: string;
  status: string;
}

export const SampleForm: React.FC<SampleFormProps> = ({
  onAdd,
  submitting,
  onShowDate,
  onShowStatus,
  deadline,
  status,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [linha, setLinha] = useState('');
  const [modelo, setModelo] = useState('');
  const [concessionaria, setConcessionaria] = useState('');
  const [cliente, setCliente] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [prazoEnvio, setPrazoEnvio] = useState('');
  const [dataEnvio, setDataEnvio] = useState('');
  const [comentarios, setComentarios] = useState('');

  const S = {
    section: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.18em',
      color: 'rgba(255,255,255,0.38)',
      textTransform: 'uppercase',
      fontFamily: "'Syne',sans-serif",
    },
    label: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.15em',
      color: 'rgba(255,255,255,0.3)',
      textTransform: 'uppercase',
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo || !cliente || !deadline) return;

    const item = {
      id: crypto.randomUUID(),
      Linha: linha,
      Modelo: modelo,
      Concessionária: concessionaria,
      Cliente: cliente,
      Quantidade: quantidade,
      Justificativa: justificativa,
      'Prazo de envio': prazoEnvio,
      Deadline: deadline,
      'Data de envio': dataEnvio,
      Status: status,
      Comentários: comentarios,
      createdAt: new Date().toISOString(),
    };

    const success = await onAdd(item);
    if (success) {
      setLinha('');
      setModelo('');
      setConcessionaria('');
      setCliente('');
      setQuantidade('');
      setJustificativa('');
      setPrazoEnvio('');
      setDataEnvio('');
      setComentarios('');
      setFormOpen(false);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.028)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(6px)',
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 22,
      }}
    >
      <button
        onClick={() => setFormOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          borderBottom: formOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
          cursor: 'pointer',
          padding: '17px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              background: 'rgba(99,102,241,0.14)',
              border: '1px solid rgba(99,102,241,0.27)',
              borderRadius: 8,
              width: 27,
              height: 27,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={13} color="#818CF8" />
          </div>
          <span style={S.section as any}>Cadastrar Novo Envio</span>
        </div>
        <ChevronDown
          size={15}
          color="rgba(255,255,255,0.28)"
          style={{
            transform: formOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.28s',
          }}
        />
      </button>

      <div className={`fw ${formOpen ? 'o' : 'c'}`}>
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
              gap: 14,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: 'Linha',
                icon: Hash,
                placeholder: 'Ex: 001',
                value: linha,
                set: setLinha,
              },
              {
                label: 'Modelo',
                icon: Package,
                placeholder: 'Ex: Model X',
                value: modelo,
                set: setModelo,
              },
              {
                label: 'Concessionária',
                icon: Building2,
                placeholder: 'Concessionária',
                value: concessionaria,
                set: setConcessionaria,
              },
              {
                label: 'Cliente',
                icon: ClipboardList,
                placeholder: 'Nome do cliente',
                value: cliente,
                set: setCliente,
              },
              {
                label: 'Quantidade',
                icon: Hash,
                placeholder: '0',
                value: quantidade,
                set: setQuantidade,
              },
            ].map(({ label, icon: Icon, placeholder, value, set }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={S.label as any}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="fi"
                    style={{ ...S.field, width: '100%', padding: '11px 13px 11px 36px' }}
                  />
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={S.label as any}>Deadline</label>
              <button
                type="button"
                onClick={onShowDate}
                className="fi"
                style={{
                  ...S.field,
                  width: '100%',
                  padding: '11px 13px 11px 36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  textAlign: 'left',
                }}
              >
                <Calendar
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 12,
                    color: 'rgba(255,255,255,0.2)',
                  }}
                />
                <span
                  style={{ color: deadline ? 'white' : 'rgba(255,255,255,0.2)' }}
                >
                  {deadline
                    ? deadline.split('-').reverse().join('/')
                    : 'Selecione'}
                </span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
              gap: 14,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: 'Prazo de Envio',
                icon: Calendar,
                placeholder: 'Ex: 5 dias',
                value: prazoEnvio,
                set: setPrazoEnvio,
              },
              {
                label: 'Data de Envio',
                icon: Calendar,
                placeholder: 'Data',
                value: dataEnvio,
                set: setDataEnvio,
              },
            ].map(({ label, icon: Icon, placeholder, value, set }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={S.label as any}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="fi"
                    style={{ ...S.field, width: '100%', padding: '11px 13px 11px 36px' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            <label style={S.label as any}>Justificativa</label>
            <div style={{ position: 'relative' }}>
              <FileText
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 12,
                  color: 'rgba(255,255,255,0.2)',
                }}
              />
              <textarea
                placeholder="Justificativa do envio"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                className="fi"
                style={{
                  ...S.field,
                  width: '100%',
                  padding: '11px 13px 11px 36px',
                  minHeight: 80,
                  fontFamily: "'DM Sans',sans-serif",
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            <label style={S.label as any}>Comentários</label>
            <div style={{ position: 'relative' }}>
              <FileText
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 12,
                  color: 'rgba(255,255,255,0.2)',
                }}
              />
              <textarea
                placeholder="Comentários adicionais"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                className="fi"
                style={{
                  ...S.field,
                  width: '100%',
                  padding: '11px 13px 11px 36px',
                  minHeight: 80,
                  fontFamily: "'DM Sans',sans-serif",
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                flex: 1,
                minWidth: 160,
              }}
            >
              <label style={S.label as any}>Status</label>
              <button
                type="button"
                onClick={onShowStatus}
                className="fi"
                style={{
                  ...S.field,
                  width: '100%',
                  padding: '9px 13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.22)',
                    color: '#60A5FA',
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
                  <Activity size={10} strokeWidth={2.5} />
                  {status}
                </span>
                <Activity size={13} color="rgba(255,255,255,0.2)" />
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bm"
              style={{
                padding: '12px 26px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              {submitting ? (
                <Loader2 size={12} className="spin" />
              ) : (
                <Plus size={12} />
              )}
              Registrar Envio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
