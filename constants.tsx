
import { User, Delivery, Project, RecentActivity, InspirationItem, TeamMember, Conversation, Message, ClientAccount } from './types';

// Estes dados foram migrados para o Supabase. 
// Mantendo as constantes vazias para evitar erros de importação nos componentes que ainda as utilizam.

export const CLIENT_ACCOUNTS: ClientAccount[] = [];
export const TEST_USERS: Record<string, User> = {};
export const TEAM_MEMBERS: TeamMember[] = [];
export const PROJECTS: Project[] = [];
export const INITIAL_INSPIRATION: InspirationItem[] = [];
export const RECENT_ACTIVITIES: RecentActivity[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Record<string, Message[]> = {};
