import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Edit2, Trash2, Check, Plus, X } from 'lucide-react';

interface ComboboxProps {
  fieldKey: string;
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onAddOption: (val: string) => void;
  onRemoveOption: (val: string) => void;
  onRenameOption: (oldVal: string, newVal: string) => void;
  disabled?: boolean;
}

export function SmartCombobox({
  value,
  options,
  onChange,
  onAddOption,
  onRemoveOption,
  onRenameOption,
  disabled,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTempText, setEditTempText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setEditingItem(null);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = Array.from(new Set(options))
    .filter((opt) => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort();

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[var(--bg-app)] border px-3 py-2 rounded-md transition-all ${
          disabled
            ? 'border-[var(--border-color)] opacity-50 cursor-not-allowed'
            : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] cursor-pointer focus:border-[var(--text-primary)]'
        } ${
          isOpen ? 'border-[var(--text-primary)] ring-1 ring-[var(--text-primary)]' : ''
        }`}
      >
        <div className="flex-1 text-left truncate pr-4">
          {value ? (
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {value}
            </span>
          ) : (
            <span className="text-sm text-[var(--text-secondary)] opacity-80">
              Select...
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-[var(--text-secondary)] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[var(--text-primary)]' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[300] top-[calc(100%+4px)] left-0 w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center px-3 py-2 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
            <Search
              size={14}
              className="text-[var(--text-secondary)] mr-2 shrink-0"
            />
            <input
              ref={inputRef}
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or create..."
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 && searchQuery === '' && (
              <div className="px-3 py-4 text-xs text-[var(--text-secondary)] text-center">
                No options available
              </div>
            )}

            {filteredOptions.map((opt) => (
              <div
                key={opt}
                className="group/item flex items-center justify-between px-2 py-1.5 hover:bg-[var(--bg-app)] rounded-sm transition-colors cursor-pointer"
                onClick={() => handleSelect(opt)}
              >
                {editingItem === opt ? (
                  <div
                    className="flex items-center w-full gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      className="flex-1 bg-[var(--bg-app)] border border-[var(--text-primary)] rounded px-2 py-1 text-sm text-[var(--text-primary)] outline-none"
                      value={editTempText}
                      onChange={(e) => setEditTempText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onRenameOption(opt, editTempText);
                          setEditingItem(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        onRenameOption(opt, editTempText);
                        setEditingItem(null);
                      }}
                      className="p-1 text-[var(--text-secondary)] hover:text-emerald-500 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="p-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-left text-sm text-[var(--text-primary)] truncate pr-2">
                      {opt}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTempText(opt);
                          setEditingItem(opt);
                        }}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Permanently delete the option "${opt}"?`))
                            onRemoveOption(opt);
                        }}
                        className="p-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {opt === value && (
                      <Check
                        size={14}
                        className="text-[var(--text-primary)] ml-2 shrink-0"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {searchQuery && !filteredOptions.includes(searchQuery) && (
            <div className="p-1 border-t border-[var(--border-color)] bg-[var(--card-bg)]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddOption(searchQuery);
                  handleSelect(searchQuery);
                }}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--bg-app)] text-[var(--text-primary)] rounded-sm text-sm transition-colors"
              >
                <Plus size={14} className="text-[var(--text-secondary)]" />
                <span className="truncate font-medium">Create "{searchQuery}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}