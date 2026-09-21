import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

interface SystemUpdateFormProps {
  isSendingUpdate: boolean;
  handleLaunchUpdate: (version: string, changes: string) => Promise<void>;
}

export const SystemUpdateForm: React.FC<SystemUpdateFormProps> = ({
  isSendingUpdate,
  handleLaunchUpdate,
}) => {
  const [version, setVersion] = useState('1.2.5');
  const [changes, setChanges] = useState('');

  const onSubmit = async () => {
    await handleLaunchUpdate(version, changes);
    setChanges('');
  };

  return (
    <div className="lg:col-span-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden h-fit">
      <div className="relative z-10">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-[var(--accent-color)] flex items-center gap-2">
          <Sparkles size={16} /> System Update
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase opacity-40 mb-2 block">
              Version Tag
            </label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-3 rounded-xl outline-none text-sm font-bold text-[var(--accent-color)]"
              placeholder="e.g. 1.2.6"
            />
          </div>

          <div>
            <label className="text-[9px] font-black uppercase opacity-40 mb-2 block">
              What's New (one per line)
            </label>
            <textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] p-4 rounded-xl outline-none text-xs font-medium text-[var(--text-primary)] h-32 resize-none"
              placeholder="Nova tradução para Chinês&#10;Melhoria no Dashboard"
            />
          </div>

          <button
            onClick={onSubmit}
            disabled={isSendingUpdate}
            className="w-full py-4 bg-[var(--accent-color)] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:brightness-110 transition-all flex justify-center items-center gap-2 border-none cursor-pointer"
          >
            {isSendingUpdate ? (
              'Sending...'
            ) : (
              <>
                <Send size={14} /> Launch Update
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
