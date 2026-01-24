import React from 'react';
import { CreativeGoal, User, TeamMember } from '../../types';

interface CreativeGoalsProps {
    goals: CreativeGoal[];
    progress: number;
    currentUser: User;
    onToggleGoal: (goalId: string) => Promise<void>;
    onSelectGoal: (goal: CreativeGoal) => void;
    onAddGoal: () => Promise<void>;
    isAddingGoal: boolean;
    setIsAddingGoal: (val: boolean) => void;
    newGoalText: string;
    setNewGoalText: (val: string) => void;
    getResponsible: (id?: string) => TeamMember | undefined;
}

const CreativeGoals: React.FC<CreativeGoalsProps> = React.memo(({
    goals,
    progress,
    currentUser,
    onToggleGoal,
    onSelectGoal,
    onAddGoal,
    isAddingGoal,
    setIsAddingGoal,
    newGoalText,
    setNewGoalText,
    getResponsible,
}) => {
    return (
        <section className="bg-slate-50/50 dark:bg-slate-900/30 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 md:mb-10">
                <div className="flex items-center gap-4">
                    <div className="size-10 md:size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shadow-inner shrink-0">
                        <span className="material-symbols-outlined !text-[24px] md:!text-[28px]">checklist_rtl</span>
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">Objetivos Criativos</h3>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestão de resultados do projeto</p>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 bg-white/50 dark:bg-slate-800/50 p-3 sm:p-0 rounded-2xl sm:bg-transparent">
                    <span className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{progress}%</span>
                    <div className="flex-1 sm:flex-none w-full sm:w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-emerald-500 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="space-y-3 md:space-y-4">
                {goals.map((goal) => {
                    const resp = getResponsible(goal.responsibleId);
                    return (
                        <div key={goal.id} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl md:rounded-[2rem] group hover:shadow-xl transition-all shadow-sm">
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleGoal(goal.id); }}
                                className={`size-6 md:size-7 rounded-lg md:rounded-xl border-2 transition-all flex items-center justify-center shrink-0 ${goal.completed ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary'}`}
                            >
                                {goal.completed && <span className="material-symbols-outlined !text-[14px] md:!text-[18px] font-bold">check</span>}
                            </button>
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectGoal(goal)}>
                                <p className={`text-sm md:text-base font-bold transition-all truncate ${goal.completed ? 'text-slate-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{goal.text}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${goal.completed ? 'text-emerald-500/60' : 'text-amber-500'}`}>{goal.status}</span>
                                </div>
                            </div>
                            {resp && (
                                <div className="flex items-center pl-3 md:pl-4 md:border-l border-slate-100 dark:border-slate-800 shrink-0">
                                    <img src={resp.avatarUrl} className="size-8 md:size-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md group-hover:scale-110 transition-transform object-cover" title={resp.name} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 md:mt-10">
                {isAddingGoal ? (
                    <div className="bg-white dark:bg-slate-900 p-2 pl-4 md:p-3 md:pl-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-primary/20 flex items-center gap-3 animate-scale-up shadow-xl ring-4 ring-primary/5">
                        <input
                            type="text"
                            placeholder="Digite o objetivo e pressione Enter..."
                            value={newGoalText}
                            onChange={e => setNewGoalText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') onAddGoal();
                                if (e.key === 'Escape') setIsAddingGoal(false);
                            }}
                            autoFocus
                            className="flex-1 bg-transparent border-none p-0 text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 focus:ring-0 placeholder:text-slate-400"
                        />
                        <div className="flex items-center gap-1">
                            <button onClick={onAddGoal} className="size-8 md:size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined !text-[18px] md:!text-[20px]">check</span>
                            </button>
                            <button onClick={() => setIsAddingGoal(false)} className="size-8 md:size-10 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center transition-all">
                                <span className="material-symbols-outlined !text-[18px] md:!text-[20px]">close</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => setIsAddingGoal(true)} className="flex-1 flex items-center justify-center gap-3 py-4 md:py-5 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] text-slate-400 hover:text-primary transition-all font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                            <span className="material-symbols-outlined !text-[18px] md:!text-[20px]">add</span>
                            Nova Sub-Entrega no Fluxo
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
});

export default CreativeGoals;
