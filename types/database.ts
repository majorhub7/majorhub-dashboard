export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    name: string
                    email: string
                    role: string
                    access_level: 'MANAGER' | 'CLIENT'
                    avatar_url: string | null
                    bio: string | null
                    cover_url: string | null
                    skills: string[] | null
                    location: string | null
                    website: string | null
                    client_id: string | null
                    is_onboarded: boolean
                    whatsapp: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    role?: string
                    access_level: 'MANAGER' | 'CLIENT'
                    avatar_url?: string | null
                    bio?: string | null
                    cover_url?: string | null
                    skills?: string[] | null
                    location?: string | null
                    website?: string | null
                    client_id?: string | null
                    is_onboarded?: boolean
                    whatsapp?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    role?: string
                    access_level?: 'MANAGER' | 'CLIENT'
                    avatar_url?: string | null
                    bio?: string | null
                    cover_url?: string | null
                    skills?: string[] | null
                    location?: string | null
                    website?: string | null
                    client_id?: string | null
                    is_onboarded?: boolean
                    whatsapp?: string | null
                    created_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    name: string
                    logo_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    logo_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    logo_url?: string | null
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    client_id: string
                    title: string
                    description: string | null
                    image_url: string | null
                    status: 'In Progress' | 'Revision' | 'Completed'
                    due_date: string | null
                    progress: number
                    priority: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    title: string
                    description?: string | null
                    image_url?: string | null
                    status?: 'In Progress' | 'Revision' | 'Completed'
                    due_date?: string | null
                    progress?: number
                    priority?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    title?: string
                    description?: string | null
                    image_url?: string | null
                    status?: 'In Progress' | 'Revision' | 'Completed'
                    due_date?: string | null
                    progress?: number
                    priority?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            creative_goals: {
                Row: {
                    id: string
                    project_id: string
                    text: string
                    description: string | null
                    completed: boolean
                    status: 'Pendente' | 'Em Andamento' | 'Em Revisão' | 'Concluído'
                    type: 'video' | 'design' | 'campaign'
                    due_date: string | null
                    responsible_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    text: string
                    description?: string | null
                    completed?: boolean
                    status?: 'Pendente' | 'Em Andamento' | 'Em Revisão' | 'Concluído'
                    type: 'video' | 'design' | 'campaign'
                    due_date?: string | null
                    responsible_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    text?: string
                    description?: string | null
                    completed?: boolean
                    status?: 'Pendente' | 'Em Andamento' | 'Em Revisão' | 'Concluído'
                    type?: 'video' | 'design' | 'campaign'
                    due_date?: string | null
                    responsible_id?: string | null
                    created_at?: string
                }
            }
            documents: {
                Row: {
                    id: string
                    project_id: string | null
                    goal_id: string | null
                    name: string
                    type: 'pdf' | 'figma' | 'image' | 'video'
                    url: string
                    size: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    goal_id?: string | null
                    name: string
                    type: 'pdf' | 'figma' | 'image' | 'video'
                    url: string
                    size?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    goal_id?: string | null
                    name?: string
                    type?: 'pdf' | 'figma' | 'image' | 'video'
                    url?: string
                    size?: string | null
                    created_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    name: string
                    type: 'group' | 'private'
                    avatar: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'group' | 'private'
                    avatar?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'group' | 'private'
                    avatar?: string | null
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender_id?: string
                    text?: string
                    created_at?: string
                }
            }
            project_activities: {
                Row: {
                    id: string
                    project_id: string
                    user_name: string
                    user_avatar: string | null
                    type: 'comment' | 'system'
                    content: string
                    system_icon: string | null
                    timestamp: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    user_name: string
                    user_avatar?: string | null
                    type: 'comment' | 'system'
                    content: string
                    system_icon?: string | null
                    timestamp?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    user_name?: string
                    user_avatar?: string | null
                    type?: 'comment' | 'system'
                    content?: string
                    system_icon?: string | null
                    timestamp?: string
                }
            }
            user_activities: {
                Row: {
                    id: string
                    user_id: string
                    description: string
                    target: string | null
                    icon: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    description: string
                    target?: string | null
                    icon?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    description?: string
                    target?: string | null
                    icon?: string | null
                    created_at?: string
                }
            }
            invitations: {
                Row: {
                    id: string
                    token: string
                    client_id: string | null
                    role: string
                    invited_by: string | null
                    used_at: string | null
                    created_at: string
                    expires_at: string
                }
                Insert: {
                    id?: string
                    token: string
                    client_id?: string | null
                    role?: string
                    invited_by?: string | null
                    used_at?: string | null
                    created_at?: string
                    expires_at?: string
                }
                Update: {
                    id?: string
                    token?: string
                    client_id?: string | null
                    role?: string
                    invited_by?: string | null
                    used_at?: string | null
                    created_at?: string
                    expires_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
