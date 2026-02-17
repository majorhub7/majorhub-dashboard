import React, { useState, useEffect, useRef } from 'react';
import { useInspirations } from '../hooks/useInspirations';
import type { Inspiration, InspirationTag, Project } from '../types';

interface InspiracaoViewProps {
    userId: string;
    projects: Project[];
}

const InspiracaoView: React.FC<InspiracaoViewProps> = ({ userId, projects }) => {
    const {
        inspirations,
        tags,
        loading,
        filters,
        addInspiration,
        updateInspiration,
        deleteInspiration,
        createTag,
        filterByTags,
        searchInspirations,
        clearFilters,
    } = useInspirations(userId);

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            searchInspirations(searchQuery);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery, searchInspirations]);

    // Apply tag filters
    useEffect(() => {
        filterByTags(activeTagFilters);
    }, [activeTagFilters, filterByTags]);

    const toggleTagFilter = (tagId: string) => {
        setActiveTagFilters((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta inspiração?')) {
            try {
                await deleteInspiration(id);
            } catch (err) {
                console.error('Error deleting inspiration:', err);
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-20 relative">
            {/* Under Construction Overlay */}
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-950/70 backdrop-blur-sm rounded-3xl">
                <div className="text-center p-8">
                    <div className="size-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50 flex items-center justify-center">
                        <span className="material-symbols-outlined !text-[48px] text-amber-500">construction</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Em Construção
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
                    </p>
                </div>
            </div>

            {/* Header */}
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Inspiração
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Curadoria estratégica de referências que desbloqueiam ideias executáveis.
                </p>
            </header>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 !text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar inspirações..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                </div>

                {/* Add Button */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 active:scale-95"
                >
                    <span className="material-symbols-outlined !text-[20px]">add</span>
                    Adicionar Inspiração
                </button>
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => toggleTagFilter(tag.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border active:scale-95 ${activeTagFilters.includes(tag.id)
                            ? 'text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                        style={{
                            backgroundColor: activeTagFilters.includes(tag.id) ? tag.color : undefined,
                            borderColor: activeTagFilters.includes(tag.id) ? tag.color : undefined,
                        }}
                    >
                        {tag.name}
                    </button>
                ))}
                {activeTagFilters.length > 0 && (
                    <button
                        onClick={() => setActiveTagFilters([])}
                        className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && inspirations.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
                    <div className="size-24 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 flex items-center justify-center">
                        <span className="material-symbols-outlined !text-[48px] text-amber-500">lightbulb</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            Nenhuma inspiração ainda
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            Comece adicionando referências do Instagram que te inspiram. Cole o link de posts ou
                            reels para salvar ideias executáveis.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
                    >
                        <span className="material-symbols-outlined !text-[20px]">add</span>
                        Adicionar primeira inspiração
                    </button>
                </div>
            )}

            {/* Inspiration Grid */}
            {!loading && inspirations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {inspirations.map((inspiration) => (
                        <InspirationCard
                            key={inspiration.id}
                            inspiration={inspiration}
                            projects={projects}
                            onEdit={() => setSelectedInspiration(inspiration)}
                            onDelete={() => handleDelete(inspiration.id)}
                        />
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <AddInspirationModal
                    tags={tags}
                    projects={projects}
                    onClose={() => setShowAddModal(false)}
                    onSave={async (data) => {
                        await addInspiration(data);
                        setShowAddModal(false);
                    }}
                    onCreateTag={createTag}
                />
            )}

            {/* Edit Modal */}
            {selectedInspiration && (
                <AddInspirationModal
                    tags={tags}
                    projects={projects}
                    inspiration={selectedInspiration}
                    onClose={() => setSelectedInspiration(null)}
                    onSave={async (data) => {
                        await updateInspiration(selectedInspiration.id, data);
                        setSelectedInspiration(null);
                    }}
                    onCreateTag={createTag}
                />
            )}
        </div>
    );
};

// ============================================
// INSPIRATION CARD COMPONENT
// ============================================

interface InspirationCardProps {
    inspiration: Inspiration;
    projects: Project[];
    onEdit: () => void;
    onDelete: () => void;
}

// Extract Instagram post/reel ID from URL
function extractInstagramId(url: string): { type: 'p' | 'reel' | 'tv'; id: string } | null {
    const patterns = [
        /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/([A-Za-z0-9._]+)\/(p|reel|tv)\/([A-Za-z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            // Handle both URL formats
            if (match[3]) {
                return { type: match[2] as 'p' | 'reel' | 'tv', id: match[3] };
            }
            return { type: match[1] as 'p' | 'reel' | 'tv', id: match[2] };
        }
    }
    return null;
}

const InspirationCard: React.FC<InspirationCardProps> = ({
    inspiration,
    projects,
    onEdit,
    onDelete,
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [embedLoaded, setEmbedLoaded] = useState(false);
    const [embedError, setEmbedError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Extract Instagram post ID for iframe embed
    const instagramPost = extractInstagramId(inspiration.instagramUrl);

    // Build iframe URL
    const embedUrl = instagramPost
        ? `https://www.instagram.com/${instagramPost.type}/${instagramPost.id}/embed/captioned/`
        : null;

    const linkedProjects = projects.filter((p) => inspiration.projectIds.includes(p.id));

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300">
            {/* Embed or Placeholder */}
            <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {embedUrl && !embedError ? (
                    <div className="w-full h-full relative">
                        {!embedLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        )}
                        <iframe
                            ref={iframeRef}
                            src={embedUrl}
                            className={`w-full h-full border-0 transition-opacity duration-300 ${embedLoaded ? 'opacity-100' : 'opacity-0'}`}
                            allowFullScreen
                            loading="lazy"
                            onLoad={() => setEmbedLoaded(true)}
                            onError={() => setEmbedError(true)}
                            title="Instagram Embed"
                        />
                    </div>
                ) : inspiration.thumbnailUrl ? (
                    <img
                        src={inspiration.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <a
                            href={inspiration.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center group/play"
                        >
                            <span className="material-symbols-outlined !text-[48px] text-slate-300 dark:text-slate-600 group-hover/play:text-primary transition-colors">
                                play_circle
                            </span>
                            <p className="text-xs text-slate-400 mt-2 group-hover/play:text-primary transition-colors">Ver no Instagram</p>
                        </a>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <a
                        href={inspiration.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white text-xs font-bold hover:underline"
                    >
                        <span className="material-symbols-outlined !text-[16px]">open_in_new</span>
                        Ver no Instagram
                    </a>
                </div>

                {/* Menu */}
                <div className="absolute top-3 right-3">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-white hover:text-primary transition-all shadow-lg opacity-0 group-hover:opacity-100"
                    >
                        <span className="material-symbols-outlined !text-[18px]">more_vert</span>
                    </button>

                    {showMenu && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-10">
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onEdit();
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined !text-[18px]">edit</span>
                                Editar
                            </button>
                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    onDelete();
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined !text-[18px]">delete</span>
                                Excluir
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Tags */}
                {inspiration.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {inspiration.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                                style={{ backgroundColor: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Metrics */}
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    {inspiration.likes > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[16px] text-rose-400">favorite</span>
                            <span className="font-bold">{formatNumber(inspiration.likes)}</span>
                        </div>
                    )}
                    {inspiration.views > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined !text-[16px] text-blue-400">visibility</span>
                            <span className="font-bold">{formatNumber(inspiration.views)}</span>
                        </div>
                    )}
                </div>

                {/* Notes */}
                {inspiration.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {inspiration.notes}
                    </p>
                )}

                {/* Linked Projects */}
                {linkedProjects.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="material-symbols-outlined !text-[14px]">link</span>
                            <span className="truncate">
                                {linkedProjects.map((p) => p.title).join(', ')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// ADD INSPIRATION MODAL
// ============================================

interface AddInspirationModalProps {
    tags: InspirationTag[];
    projects: Project[];
    inspiration?: Inspiration;
    onClose: () => void;
    onSave: (data: {
        instagramUrl: string;
        embedHtml?: string;
        likes?: number;
        views?: number;
        notes?: string;
        tagIds?: string[];
        projectIds?: string[];
    }) => Promise<void>;
    onCreateTag: (name: string, color: string) => Promise<InspirationTag>;
}

const AddInspirationModal: React.FC<AddInspirationModalProps> = ({
    tags,
    projects,
    inspiration,
    onClose,
    onSave,
    onCreateTag,
}) => {
    const [instagramUrl, setInstagramUrl] = useState(inspiration?.instagramUrl || '');
    const [likes, setLikes] = useState(inspiration?.likes?.toString() || '');
    const [views, setViews] = useState(inspiration?.views?.toString() || '');
    const [notes, setNotes] = useState(inspiration?.notes || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(
        inspiration?.tags.map((t) => t.id) || []
    );
    const [selectedProjects, setSelectedProjects] = useState<string[]>(
        inspiration?.projectIds || []
    );
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#6366f1');
    const [showTagCreator, setShowTagCreator] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);

    const isEditing = !!inspiration;

    // Extract Instagram ID for preview
    const instagramPost = extractInstagramId(instagramUrl);
    const previewUrl = instagramPost
        ? `https://www.instagram.com/${instagramPost.type}/${instagramPost.id}/embed/captioned/`
        : null;

    // Reset preview loaded state when URL changes
    useEffect(() => {
        setPreviewLoaded(false);
    }, [instagramUrl]);

    const toggleTag = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    const toggleProject = (projectId: string) => {
        setSelectedProjects((prev) =>
            prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
        );
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const newTag = await onCreateTag(newTagName.trim(), newTagColor);
            setSelectedTags((prev) => [...prev, newTag.id]);
            setNewTagName('');
            setShowTagCreator(false);
        } catch (err) {
            console.error('Error creating tag:', err);
        }
    };

    const handleSave = async () => {
        if (!instagramUrl.trim()) return;

        setSaving(true);
        try {
            await onSave({
                instagramUrl: instagramUrl.trim(),
                likes: likes ? parseInt(likes) : undefined,
                views: views ? parseInt(views) : undefined,
                notes: notes.trim() || undefined,
                tagIds: selectedTags,
                projectIds: selectedProjects,
            });
        } catch (err) {
            console.error('Error saving inspiration:', err);
        } finally {
            setSaving(false);
        }
    };

    const tagColors = [
        '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899',
    ];

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {isEditing ? 'Editar Inspiração' : 'Nova Inspiração'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Instagram URL */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Link do Instagram
                        </label>
                        <input
                            type="url"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            placeholder="Cole o link do post ou reel..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                    </div>

                    {/* Embed Preview */}
                    {previewUrl && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-center">Preview do Vídeo</p>
                            <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                                {!previewLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    </div>
                                )}
                                <iframe
                                    src={previewUrl}
                                    className={`w-full h-full border-0 transition-opacity duration-300 ${previewLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    allowFullScreen
                                    loading="lazy"
                                    onLoad={() => setPreviewLoaded(true)}
                                    title="Instagram Preview"
                                />
                            </div>
                            <div className="flex items-center justify-center mt-3 gap-2 text-sm text-green-600 dark:text-green-400">
                                <span className="material-symbols-outlined !text-[20px]">check_circle</span>
                                <span>Link válido detectado</span>
                            </div>
                        </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Curtidas
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 !text-[18px]">
                                    favorite
                                </span>
                                <input
                                    type="number"
                                    value={likes}
                                    onChange={(e) => setLikes(e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Visualizações
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 !text-[18px]">
                                    visibility
                                </span>
                                <input
                                    type="number"
                                    value={views}
                                    onChange={(e) => setViews(e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedTags.includes(tag.id)
                                        ? 'text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}
                                    style={{
                                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                                        borderColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                                    }}
                                >
                                    {tag.name}
                                </button>
                            ))}
                            <button
                                onClick={() => setShowTagCreator(!showTagCreator)}
                                className="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined !text-[14px]">add</span>
                                Nova
                            </button>
                        </div>

                        {/* Tag Creator */}
                        {showTagCreator && (
                            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                                <input
                                    type="text"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="Nome da tag..."
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                />
                                <div className="flex items-center gap-2">
                                    {tagColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewTagColor(color)}
                                            className={`size-7 rounded-full transition-transform ${newTagColor === color ? 'scale-125 ring-2 ring-white shadow-lg' : ''
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowTagCreator(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCreateTag}
                                        disabled={!newTagName.trim()}
                                        className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg disabled:opacity-50"
                                    >
                                        Criar Tag
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                Vincular a Projetos (opcional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => toggleProject(project.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedProjects.includes(project.id)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        {project.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Anotações (opcional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Por que essa inspiração é relevante? O que você quer lembrar?"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!instagramUrl.trim() || saving}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined !text-[18px]">check</span>
                                {isEditing ? 'Salvar' : 'Adicionar'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export default InspiracaoView;
