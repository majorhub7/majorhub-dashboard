
import type { Database } from './types/database';

export type Role = 'MANAGER' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  role: string; // Ex: "Diretor de Marketing"
  accessLevel: Role;
  avatarUrl: string;
  bio?: string;
  coverUrl?: string;
  skills?: string[];
  location?: string;
  email?: string;
  website?: string;
  clientId?: string; // Se for cliente, a qual conta pertence
  isOnboarded: boolean;
  whatsapp?: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  logoUrl: string;
  projectsCount: number;
  activeDeliveries: number;
  lastActivity: string;
}

export interface TeamMember extends User { }

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  name: string;
  type: 'group' | 'private';
  avatar: string;
  lastMessage: string;
  lastTimestamp: string;
  participantsCount?: number;
  online?: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'figma' | 'image' | 'video';
  url: string;
  size?: string;
  createdAt?: string;
}

export interface Delivery {
  id: string;
  title: string;
  date: string;
  fullDate?: string;
  type: 'video' | 'design' | 'campaign';
  colorClass: string;
  icon: string;
  projectId?: string;
  responsible?: TeamMember;
  status?: string;
  isLate?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CreativeGoal {
  id: string;
  text: string;
  completed: boolean;
  description?: string;
  documents?: Document[];
  dueDate?: string;
  responsibleId?: string;
  status: 'Pendente' | 'Em Andamento' | 'Em Revisão' | 'Concluído';
  type: 'video' | 'design' | 'campaign';
  internalChecklist?: ChecklistItem[];
  position?: number;
  share_token?: string; // UUID for public sharing
}

export interface ProjectActivity {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  type: 'comment' | 'system';
  content: string;
  timestamp: string;
  systemIcon?: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  imageUrl: string;
  status: 'In Progress' | 'Revision' | 'Completed';
  statusLabel: string;
  description: string;
  tags: string[];
  dueDate: string;
  dueDateLabel: string;
  startDate?: string;
  endDate?: string;
  creativeGoals: CreativeGoal[];
  activities: ProjectActivity[];
  filesCount: number;
  commentsCount: number;
  progress: number;
  team: string[];
  fullTeam?: TeamMember[];
  documents?: Document[];
  priority?: boolean;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface InspirationItem {
  id: string;
  imageUrl: string;
}

export interface InspirationTag {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  userId?: string;
}

export interface Inspiration {
  id: string;
  userId: string;
  instagramUrl: string;
  embedHtml?: string;
  thumbnailUrl?: string;
  likes: number;
  views: number;
  notes?: string;
  tags: InspirationTag[];
  projectIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'deadline' | 'mention' | 'project_created' | 'status_changed' | 'goal_completed';
export type NotificationLinkType = 'project' | 'goal' | 'comment';

export interface Notification {
  id: string;
  userId: string;
  clientId?: string;
  type: NotificationType;
  title: string;
  message: string;
  linkType?: NotificationLinkType;
  linkId?: string;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: string;
  inAppEnabled: boolean;
  notifyDeadlines: boolean;
  notifyMentions: boolean;
  notifyProjectUpdates: boolean;
  notifyGoalCompleted: boolean;
  updatedAt?: string;
}

// Re-export database types for compatibility

export type { Database };

export type DbProjectWithRelations = Database['public']['Tables']['projects']['Row'] & {
  creative_goals?: Database['public']['Tables']['creative_goals']['Row'][];
  documents?: Database['public']['Tables']['documents']['Row'][];
  project_activities?: Database['public']['Tables']['project_activities']['Row'][];
};

// Helper type to convert database row to frontend type
export function mapUserFromDb(dbUser: Database['public']['Tables']['users']['Row']): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    role: dbUser.role,
    accessLevel: dbUser.access_level,
    avatarUrl: dbUser.avatar_url || '',
    bio: dbUser.bio || undefined,
    coverUrl: dbUser.cover_url || undefined,
    skills: dbUser.skills || [],
    location: dbUser.location || undefined,
    website: dbUser.website || undefined,
    email: dbUser.email,
    clientId: dbUser.client_id || undefined,
    isOnboarded: dbUser.is_onboarded,
    whatsapp: dbUser.whatsapp || undefined,
  };
}

export function mapProjectFromDb(dbProject: DbProjectWithRelations): Project {
  // Mapeamento de status para label amigável
  const statusLabels: Record<string, string> = {
    'In Progress': 'Em andamento',
    'Revision': 'Em revisão',
    'Completed': 'Concluído'
  };

  const creativeGoals = (dbProject.creative_goals || [])
    .map((g: any) => ({
      id: g.id,
      text: g.text,
      completed: g.completed,
      status: g.status,
      type: g.type,
      dueDate: g.due_date,
      responsibleId: g.responsible_id,
      description: g.description,
      internalChecklist: g.internal_checklist || [],
      position: g.position || 0
    }))
    .sort((a: any, b: any) => (a.position - b.position) || 0);

  const documents = (dbProject.documents || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    url: d.url,
    size: d.size
  }));

  const activities = (dbProject.project_activities || []).map((a: any) => ({
    id: a.id,
    userName: a.user_name,
    userAvatar: a.user_avatar,
    type: a.type,
    content: a.content,
    timestamp: a.timestamp,
    systemIcon: a.system_icon
  })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    id: dbProject.id,
    clientId: dbProject.client_id,
    title: dbProject.title,
    description: dbProject.description || '',
    imageUrl: (dbProject.image_url && !dbProject.image_url.includes('via.placeholder.com'))
      ? dbProject.image_url
      : 'https://placehold.co/600x400?text=Projeto',
    status: dbProject.status,
    statusLabel: statusLabels[dbProject.status] || dbProject.status,
    progress: creativeGoals.length > 0
      ? Math.round((creativeGoals.filter(g => g.completed).length / creativeGoals.length) * 100)
      : dbProject.progress,
    priority: dbProject.priority,
    dueDate: dbProject.due_date || 'A definir',
    dueDateLabel: dbProject.due_date ? new Date(dbProject.due_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : 'Prazo pendente',
    tags: [], // Tags podem ser implementadas como uma tabela separada no futuro
    team: [], // Team pode ser implementado como uma tabela de junção no futuro
    creativeGoals,
    activities,
    documents,
    filesCount: documents.length,
    commentsCount: activities.filter((a: any) => a.type === 'comment').length
  };
}
