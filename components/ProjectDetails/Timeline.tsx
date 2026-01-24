import React, { useMemo, useEffect, useRef } from 'react';
import { ProjectActivity, User } from '../../types';

// Skeleton animado para atividades
const ActivitySkeleton = () => (
    <div className="relative pl-8 animate-pulse">
        <div className="absolute left-[-5px] top-1.5 size-[9px] rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-50 dark:border-slate-900" />
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="size-4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48" />
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-6" />
        </div>
    </div>
);

const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => (
    <div className={`relative pl-8 animate-pulse ${isOwn ? 'flex flex-col items-end' : ''}`}>
        <div className="absolute left-[-5px] top-1.5 size-[9px] rounded-full bg-primary/50 border-2 border-slate-50 dark:border-slate-900" />
        <div className="flex items-center gap-2 mb-2">
            {!isOwn && <div className="size-6 rounded-lg bg-slate-200 dark:bg-slate-700" />}
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        </div>
        <div className={`px-5 py-4 rounded-[1.5rem] w-48 ${isOwn ? 'bg-primary/20 rounded-tr-none' : 'bg-slate-200 dark:bg-slate-700 rounded-tl-none'}`}>
            <div className="h-4 bg-slate-300/50 dark:bg-slate-600/50 rounded w-full mb-2" />
            <div className="h-4 bg-slate-300/50 dark:bg-slate-600/50 rounded w-3/4" />
        </div>
    </div>
);

interface ProjectTimelineProps {
    activities: ProjectActivity[];
    currentUser: User;
    formatTime: (isoString: string) => string;
    loading?: boolean;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = React.memo(({ activities, currentUser, formatTime, loading = false }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activities]);

    const processedActivities = useMemo(() => {
        const deduped = activities.reduce((acc: ProjectActivity[], curr) => {
            const last = acc[acc.length - 1];
            if (last && last.type === 'system' && curr.type === 'system' &&
                last.content === curr.content && last.userName === curr.userName) {
                return acc;
            }
            return [...acc, curr];
        }, []);

        const groups: { [key: string]: ProjectActivity[] } = {};
        deduped.forEach(activity => {
            const date = new Date(activity.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
            if (!groups[date]) groups[date] = [];
            groups[date].push(activity);
        });

        return groups;
    }, [activities]);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col px-8 py-10">
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-12 pb-10">
                {loading ? (
                    <div className="space-y-10">
                        <ActivitySkeleton />
                        <MessageSkeleton />
                        <ActivitySkeleton />
                        <MessageSkeleton isOwn />
                        <ActivitySkeleton />
                    </div>
                ) : Object.keys(processedActivities).length > 0 ? (
                    (Object.entries(processedActivities) as [string, ProjectActivity[]][]).map(([date, items]) => (
                        <div key={date} className="relative">
                            <div className="sticky top-0 z-10 -ml-4 mb-8">
                                <span className="bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-400 dark:text-slate-500 py-1 px-4 rounded-full border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-widest shadow-sm">
                                    {date}
                                </span>
                            </div>

                            <div className="space-y-10">
                                {items.map((activity) => (
                                    <div key={activity.id} className="relative pl-8">
                                        <div className={`absolute left-[-5px] top-1.5 size-[9px] rounded-full border-2 border-slate-50 dark:border-slate-900 z-10 ${activity.type === 'system' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]'}`} />

                                        {activity.type === 'system' ? (
                                            <div className="flex flex-col gap-1.5 animate-fade-in">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined !text-[16px] text-slate-300">{activity.systemIcon || 'history'}</span>
                                                    <p className="text-[11px] text-slate-400 font-medium">
                                                        <span className="text-slate-900 dark:text-slate-200 font-bold">{activity.userName}</span> {activity.content}
                                                    </p>
                                                </div>
                                                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest ml-6">{formatTime(activity.timestamp)}</span>
                                            </div>
                                        ) : (
                                            <div className={`flex flex-col gap-2 max-w-full animate-fade-in ${activity.userName === currentUser.name ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {activity.userName !== currentUser.name && activity.userAvatar && (
                                                        <img src={activity.userAvatar} className="size-6 rounded-lg object-cover border border-slate-100 dark:border-slate-800" alt="" />
                                                    )}
                                                    <span className="text-[10px] font-bold text-slate-500">{activity.userName}</span>
                                                    <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">• {formatTime(activity.timestamp)}</span>
                                                </div>

                                                <div className={`px-5 py-3.5 rounded-[1.5rem] text-[13px] leading-relaxed shadow-sm transition-all border ${activity.userName === currentUser.name
                                                    ? 'bg-primary text-white border-primary/20 rounded-tr-none'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    {activity.content}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4 opacity-40 ml-[-1rem]">
                        <span className="material-symbols-outlined !text-[48px] animate-pulse">auto_stories</span>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-center">Nenhum histórico disponível<br />neste projeto</p>
                    </div>
                )}
            </div>
            <div ref={chatEndRef} />
        </div>
    );
});

export default ProjectTimeline;
