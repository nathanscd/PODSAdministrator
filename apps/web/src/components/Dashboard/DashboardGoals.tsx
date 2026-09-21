import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, User, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../../lib/utils'; // Assumindo a utilidade do shadcn

interface DashboardGoalsProps {
  goals: any[];
  usersList: { id: string; name: string }[];
  searchQuery: string;
  addGoal: (text: string, userId: string) => Promise<boolean>;
  toggleGoal: (goal: any) => Promise<void>;
  deleteGoal: (id: string, text: string) => Promise<void>;
  t: any;
}

export const DashboardGoals: React.FC<DashboardGoalsProps> = ({
  goals,
  usersList,
  searchQuery,
  addGoal,
  toggleGoal,
  deleteGoal,
  t,
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedUserForGoal, setSelectedUserForGoal] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addGoal(newGoalText, selectedUserForGoal ?? 'all');
    if (success) {
      setNewGoalText('');
      setSelectedUserForGoal(null);
      setIsAddingGoal(false);
    }
  };

  const filteredGoals = goals.filter((g) =>
    g.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header integrado, mais limpo */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {today}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 hover:bg-muted/50"
          onClick={() => setIsAddingGoal(!isAddingGoal)}
        >
          {isAddingGoal ? <X size={16} /> : <Plus size={16} />}
        </Button>
      </div>

      {/* Formulário de Adição Refinado */}
      <AnimatePresence>
        {isAddingGoal && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="p-3 rounded-lg border border-border bg-card/60 space-y-3 shadow-inner"
          >
            <Input
              autoFocus
              className="text-base font-medium px-2 py-1.5 focus-visible:ring-0 border-none bg-transparent placeholder:text-muted-foreground/50"
              placeholder="Digite o novo objetivo..."
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
            />
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={14} />
                <Select
                  value={selectedUserForGoal}
                  onValueChange={setSelectedUserForGoal}
                >
                  <SelectTrigger className="w-[160px] h-8 text-xs font-medium border-none bg-transparent shadow-none focus:ring-0 p-0 text-foreground">
                    <SelectValue placeholder={t.forEveryone} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="rounded-lg text-xs">{t.forEveryone}</SelectItem>
                    {usersList.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="rounded-lg text-xs">
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="sm" className="h-8 rounded-full px-5 text-xs font-semibold">
                {t.post}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Lista de Objetivos */}
      <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 scrollbar-thin">
        {filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center flex-1">
            <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <span className="text-sm font-medium text-muted-foreground/60 uppercase tracking-widest">
              Nenhum objetivo
            </span>
          </div>
        ) : (
          <AnimatePresence>
            {filteredGoals.map((goal) => (
              <motion.div
                layout
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl p-3 transition-colors border border-transparent",
                  "hover:border-border/30 hover:bg-muted/30 cursor-default"
                )}
                onClick={() => toggleGoal(goal)}
              >
                <Checkbox
                  checked={goal.completed}
                  className={cn(
                    "h-6 w-6 rounded-full border-muted-foreground/30",
                    "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all pointer-events-none"
                  )}
                />
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
                  <span
                    className={cn(
                      "text-sm font-medium text-foreground transition-all",
                      goal.completed && 'text-muted-foreground/50 line-through'
                    )}
                  >
                    {goal.text}
                  </span>
                  {goal.assignedName && (
                    <span className={cn(
                      "text-[11px] font-medium flex items-center gap-1.5 transition-all",
                      goal.completed ? 'text-muted-foreground/40' : 'text-blue-600/80'
                    )}>
                      <User size={10} className="shrink-0" />
                      {goal.assignedName}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGoal(goal.id, goal.text);
                  }}
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                >
                  <Trash2 size={14} />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};