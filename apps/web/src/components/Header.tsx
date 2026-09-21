import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, X, Command } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { NotificationsModal } from './Modals';
import { SettingsModal } from './SettingsModal';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

type SearchItem = {
  label: string;
  path: string;
  description: string;
  keywords: string[];
  category: string;
};

const searchCatalog: SearchItem[] = [
  { label: 'Dashboard', path: '/', description: 'Overview and main command center', keywords: ['home', 'overview', 'stats'], category: 'Overview' },
  { label: 'Tasks', path: '/todo', description: 'Track and manage personal or team tasks', keywords: ['todo', 'work items', 'assignments', 'task list'], category: 'Tasks' },
  { label: 'Task Tracker', path: '/task-tracker', description: 'Monitor active tracking workflows and progress', keywords: ['tracker', 'tracking', 'progress', 'workflow'], category: 'Tracking' },
  { label: 'Opportunities', path: '/opportunities', description: 'Explore opportunities, leads, and prospects', keywords: ['leads', 'prospects', 'sales', 'opportunity'], category: 'Sales' },
  { label: 'Reports', path: '/reports', description: 'Review reports and business insights', keywords: ['analytics', 'reporting', 'data', 'insights'], category: 'Reports' },
  { label: 'AMI Win Loss Report', path: '/AMIWinLossReport', description: 'Analyze win and loss performance', keywords: ['ami', 'win loss', 'performance'], category: 'Reports' },
  { label: 'Workspace', path: '/workspace', description: 'Open workspace boards and tools', keywords: ['board', 'kanban', 'projects', 'workspace'], category: 'Workspace' },
  { label: 'Pages', path: '/paginas', description: 'Browse workspace pages and folders', keywords: ['pages', 'folders', 'documents'], category: 'Workspace' },
  { label: 'Search', path: '/pesquisas', description: 'ETL research and discovery tools', keywords: ['etl', 'research', 'search tools', 'data search'], category: 'Research' },
  { label: 'Testbooks', path: '/testbooks', description: 'Browse and manage testbooks and manuals', keywords: ['books', 'manuals', 'tests', 'testbook'], category: 'Knowledge' },
  { label: 'Templates', path: '/templates', description: 'Open reusable templates and structures', keywords: ['template', 'structure', 'reuse'], category: 'Workspace' },
  { label: 'Settings', path: '/settings', description: 'Update application settings and preferences', keywords: ['preferences', 'config', 'setup'], category: 'Settings' },
  { label: 'Profile', path: '/profile', description: 'Manage your personal account details', keywords: ['account', 'user', 'details'], category: 'Account' },
  { label: 'Admin', path: '/admin', description: 'Manage users and administrator access', keywords: ['users', 'permissions', 'access'], category: 'Admin' },
  { label: 'Sample Control', path: '/amostras', description: 'Manage sample records and inventory', keywords: ['samples', 'inventory', 'records'], category: 'Operations' },
  { label: 'Equipment', path: '/tracking-equipments', description: 'Monitor equipment and tracked assets', keywords: ['assets', 'equipment', 'tracking'], category: 'Operations' },
  { label: 'Chips', path: '/chips', description: 'Review chip controls and device details', keywords: ['chip', 'carrier', 'device'], category: 'Operations' },
  { label: 'Change Log', path: '/changelog', description: 'Review recent changes and updates', keywords: ['updates', 'history', 'release notes'], category: 'Overview' },
  { label: 'Environments', path: '/ambients', description: 'Access environment management and deployment areas', keywords: ['ambient', 'environment', 'deploy'], category: 'Operations' },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const Header = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAdmin, userDisplayName, hasUnread } = useDashboard();

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return [];

    const normalizedQuery = normalizeText(trimmedQuery);
    const queryWords = normalizedQuery.split(' ').filter(Boolean);

    return searchCatalog
      .map((item) => {
        const label = normalizeText(item.label);
        const description = normalizeText(item.description);
        const keywords = item.keywords.map(normalizeText).join(' ');
        const haystack = `${label} ${description} ${keywords} ${item.path}`;

        let score = 0;
        if (label === normalizedQuery || item.path === normalizedQuery) score += 120;
        if (label.includes(normalizedQuery) || description.includes(normalizedQuery)) score += 70;
        if (queryWords.every((word) => haystack.includes(word))) score += 25;
        if (queryWords.some((word) => label.includes(word) || description.includes(word))) score += 10;

        return score > 0 ? { ...item, score } : null;
      })
      .filter((item): item is SearchItem & { score: number } => Boolean(item))
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
  }, [searchQuery]);

  const handleSearchSelect = (item: SearchItem) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    navigate(item.path);
  };

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchResults[0]) {
      event.preventDefault();
      handleSearchSelect(searchResults[0]);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-[70px] right-0 z-[6000] h-13 bg-[var(--background)] border-b border-[var(--border)] px-6 flex items-center justify-between gap-4 transition-all">
        {/* Brand / Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-amber-500 text-[var(--primary-foreground)] flex items-center justify-center font-black text-xs shadow-sm">
            A
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold tracking-tight text-[var(--foreground)]">Atlas</span>
            <span className="hidden sm:inline-block text-[10px] font-semibold text-[var(--muted-foreground)] opacity-70">
              Commercial SaaS
            </span>
          </div>
        </div>

        {/* Global Search Bar - Apple Pill Input */}
        <div className="flex-1 max-w-sm relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-3.5 h-3.5 text-[var(--muted-foreground)] pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar ou ir para..."
              className="w-full h-8 pl-9 pr-12 text-xs font-medium bg-[var(--muted)]/60 hover:bg-[var(--muted)]/90 focus:bg-[var(--card)] border border-[var(--border)]/40 rounded-full text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]/40 focus:ring-2 focus:ring-[var(--primary)]/10 transition-all shadow-inner"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchSubmit}
              onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 150)}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-3 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)]/60 rounded-md shadow-2xs">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            )}
          </div>

          {/* Search Dropdown Results */}
          <AnimatePresence>
            {isSearchOpen && (searchQuery ? searchResults.length > 0 : false) && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.14 }}
                className="absolute left-0 right-0 top-full mt-2 bg-[var(--popover)]/90 backdrop-blur-2xl border border-[var(--border)]/60 rounded-2xl shadow-[var(--shadow-elevation)] overflow-hidden z-[9000]"
              >
                <div className="px-3 py-2 border-b border-[var(--border)]/50 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Resultados Sugeridos
                </div>
                <div className="py-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.path}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSearchSelect(item)}
                      className="w-full text-left px-3.5 py-2 hover:bg-[var(--muted)] transition-colors flex flex-col"
                    >
                      <span className="text-xs font-semibold text-[var(--foreground)]">{item.label}</span>
                      <span className="text-[11px] text-[var(--muted-foreground)] truncate">{item.description}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative w-8 h-8 rounded-full hover:bg-[var(--muted)] text-[var(--foreground)]"
          >
            <Bell className="w-3.5 h-3.5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-full hover:bg-[var(--muted)] text-[var(--foreground)]"
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>

          <div className="h-3.5 w-px bg-[var(--border)]/50 mx-1" />

          {/* Apple Profile Pill */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-[var(--muted)]/60 transition-all text-left group"
          >
            <Avatar className="w-6 h-6 rounded-full ring-2 ring-[var(--primary)]/20">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold rounded-full">
                {userDisplayName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-medium text-[var(--foreground)] leading-none group-hover:text-[var(--primary)] transition-colors">
                {userDisplayName || 'Usuário'}
              </span>
            </div>
          </button>
        </div>
      </header>

      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Header;
