
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import LoginView from './components/LoginView';
import LandingPage from './components/landing/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationBell from './components/NotificationBell';

import { geminiService } from './services/gemini';

// Lazy loaded components
const ProjectDetailsModal = React.lazy(() => import('./components/ProjectDetailsModal'));
const NewProjectModal = React.lazy(() => import('./components/NewProjectModal'));
const AICreateModal = React.lazy(() => import('./components/AICreateModal'));
const MeusProjetosView = React.lazy(() => import('./components/MeusProjetosView'));
const BibliotecaView = React.lazy(() => import('./components/BibliotecaView'));
const PerfilView = React.lazy(() => import('./components/PerfilView'));
const MensagensView = React.lazy(() => import('./components/MensagensView'));
const ConfiguracoesView = React.lazy(() => import('./components/ConfiguracoesView'));
const ClientListView = React.lazy(() => import('./components/ClientListView'));
const OnboardingView = React.lazy(() => import('./components/OnboardingView'));
const RegistrationView = React.lazy(() => import('./components/RegistrationView'));

import {
  INITIAL_INSPIRATION,
  RECENT_ACTIVITIES,
  TEAM_MEMBERS
} from './constants';
import { InspirationItem, Project, Delivery, User, ClientAccount, mapUserFromDb, mapProjectFromDb } from './types';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { useClients } from './hooks/useClients';
import { useMembers } from './hooks/useMembers';
import { useNotifications } from './hooks/useNotifications';

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-20 animate-fade-in">
    <div className="flex flex-col items-center gap-4">
      <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando visualização...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const {
    user,
    profile,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    completeOnboarding,
    validateToken,
    signUpWithInvitation,
    createInvitation,
    signUpWithProjectInvite,
    joinProjectWithVariable
  } = useAuth();

  // Expose as global for child components to avoid prop drilling for now
  useEffect(() => {
    (window as any).authScope = { createInvitation };
  }, [createInvitation]);
  const { clients, loading: clientsLoading, createClient, deleteClient, refetch: refetchClients } = useClients(user?.id);
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    projects,
    loading: projectsLoading,
    createProject,
    updateProject: supabaseUpdateProject,
    deleteProject,
    addGoal,
    updateGoal,
    deleteGoal,
    addActivity
  } = useProjects(selectedClient?.id ?? null);

  const { members, deleteMember } = useMembers(selectedClient?.id ?? null);

  // Hook de notificações
  const { unreadCount } = useNotifications(user?.id);

  // Estados de UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAICreateModalOpen, setIsAICreateModalOpen] = useState(false);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) ? mapProjectFromDb(projects.find(p => p.id === selectedProjectId)!) : null;
  }, [projects, selectedProjectId]);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [registerToken, setRegisterToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStep, setInitStep] = useState(0);
  const [showLogin, setShowLogin] = useState(false); // State to toggle between Landing and Login

  const carouselRef = useRef<HTMLDivElement>(null);

  // Parse URL for token
  // Parse URL for token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const inviteCode = params.get('invite');
    const clientInvite = params.get('client_invite');
    const variable = params.get('variable');
    if (token) {
      setRegisterToken(token);
    } else if (inviteCode) {
      setRegisterToken(`invite:${inviteCode}`);
    } else if (clientInvite) {
      setRegisterToken(`client:${clientInvite}${variable ? `:${variable}` : ''}`);
    }
  }, []);

  // --- Derived State & Memos (Restored) ---

  const currentUser = useMemo(() => {
    return profile ? mapUserFromDb(profile) : null;
  }, [profile]);

  const mappedClients = useMemo(() => {
    return clients.map(client => ({
      id: client.id,
      name: client.name,
      logoUrl: client.logo_url || '',
      projectsCount: 0,
      activeDeliveries: 0,
      lastActivity: 'Hoje'
    }));
  }, [clients]);

  // Auto-select client for Members/Clients
  useEffect(() => {
    if (currentUser?.clientId && !selectedClient && !clientsLoading) {
      // Tentar encontrar o cliente na lista carregada
      const userClient = clients.find(c => c.id === currentUser.clientId);

      if (userClient) {
        setSelectedClient({
          id: userClient.id,
          name: userClient.name,
          logoUrl: userClient.logo_url || '',
          projectsCount: 0,
          activeDeliveries: 0,
          lastActivity: 'Hoje'
        });
      }
    }
  }, [currentUser, clients, selectedClient, clientsLoading]);

  const mappedProjects = useMemo(() => {
    return projects.map(mapProjectFromDb);
  }, [projects]);

  const filteredProjects = mappedProjects;

  const dynamicDeliveries = useMemo(() => {
    const allDeliveries: Delivery[] = [];
    mappedProjects.forEach(project => {
      project.creativeGoals.forEach(goal => {
        if (goal.dueDate) {
          const dueDate = new Date(goal.dueDate);
          allDeliveries.push({
            id: goal.id,
            title: goal.text,
            date: dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            fullDate: goal.dueDate,
            projectId: project.id,
            type: goal.type,
            colorClass: 'bg-primary',
            icon: 'flag',
            isLate: dueDate < new Date() && goal.status !== 'Concluído',
            status: goal.status
          } as Delivery);
        }
      });
    });
    return allDeliveries.sort((a, b) => new Date(a.fullDate || '').getTime() - new Date(b.fullDate || '').getTime());
  }, [mappedProjects]);

  // Adapter for updateProject to handle different component signatures
  const updateProject = async (arg1: any, arg2?: any) => {
    // If first arg is string (ID) and second is updates object -> Standard hook usage
    if (typeof arg1 === 'string') {
      return supabaseUpdateProject(arg1, arg2);
    }
    // If first arg is object (Project) -> Component usage (MeusProjetosView, etc)
    else if (typeof arg1 === 'object' && arg1.id) {
      const project = arg1;
      const updates: any = {};

      // Common fields mapping
      if (project.status) updates.status = project.status;
      if (project.progress !== undefined) updates.progress = project.progress;
      if (project.title) updates.title = project.title;
      if (project.description) updates.description = project.description;
      if (project.priority !== undefined) updates.priority = project.priority;

      // Add other fields as needed

      return supabaseUpdateProject(project.id, updates);
    }
  };

  // --- Event Handlers (Restored & Fixed) ---

  const handleCreateProject = async (projectData: any, goals: any[] = []): Promise<string> => {
    if (!selectedClient) return "";
    try {
      const { activities, ...restProjectData } = projectData;

      const newProject = await createProject({
        ...restProjectData,
        client_id: selectedClient.id
      }) as any;

      if (newProject) {
        // Add goals if provided
        if (goals && goals.length > 0) {
          for (const goal of goals) {
            await addGoal(newProject.id, goal);
          }
        }

        // Add activities if provided (e.g. from NewProjectModal)
        if (activities && activities.length > 0) {
          for (const activity of activities) {
            await addActivity(newProject.id, activity);
          }
        }

        setIsNewProjectModalOpen(false);
        return newProject.id;
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
    return "";
  };

  const handleAICreateProject = async (projectData: any, goals: any[] = []): Promise<string> => {
    if (!selectedClient) return "";
    try {
      const { activities, ...restProjectData } = projectData;

      const newProject = await createProject({
        ...restProjectData,
        client_id: selectedClient.id
      }) as any;

      if (newProject) {
        // Add goals if provided
        if (goals && goals.length > 0) {
          for (const goal of goals) {
            await addGoal(newProject.id, goal);
          }
        }

        // Add activities if provided
        if (activities && activities.length > 0) {
          for (const activity of activities) {
            await addActivity(newProject.id, activity);
          }
        }

        setSelectedProjectId(newProject.id);
        setActiveTab('projetos');
        setIsAICreateModalOpen(false);
        return newProject.id;
      }
    } catch (error) {
      console.error("Error creating AI project:", error);
    }
    return "";
  };

  const handleCreateClient = async (newClient: ClientAccount) => {
    // Client is already created by the modal, we just need to refresh list
    await refetchClients();
    setSelectedClient(newClient);
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  // ---------------------------------

  // ... (keep existing code)

  // ... (keep existing code)

  if (registerToken) {
    const isProjectInvite = registerToken.startsWith('invite:');
    const isClientInvite = registerToken.startsWith('client:');
    const parts = registerToken.split(':');
    const actualToken = isProjectInvite || isClientInvite ? parts[1] : registerToken;
    const urlVariable = isClientInvite && parts[2] ? parts[2] : undefined;

    return (
      <React.Suspense fallback={<LoadingFallback />}>
        <RegistrationView
          token={!isProjectInvite && !isClientInvite ? actualToken : ''}
          inviteCode={isProjectInvite ? actualToken : undefined}
          clientInvite={isClientInvite ? actualToken : undefined}
          urlVariable={urlVariable}
          onValidateToken={validateToken}
          onSignUp={isClientInvite ? joinProjectWithVariable : (!isProjectInvite ? signUpWithInvitation : signUpWithProjectInvite)}
          onCancel={() => {
            setRegisterToken(null);
            window.history.pushState({}, '', '/');
          }}
        />
      </React.Suspense>
    );
  }


  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users to /app
  useEffect(() => {
    if (user && profile && currentUser && (location.pathname === '/' || location.pathname === '/login')) {
      navigate('/app', { replace: true });
    }
  }, [user, profile, currentUser, location.pathname, navigate]);

  if (!user || !profile || !currentUser) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage onLoginClick={() => navigate('/login')} />} />
        <Route path="/login" element={<LoginView onLogin={signIn} onSignUp={signUp} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Se for CLIENT e não concluiu o onboarding, mostra a OnboardingView
  if (currentUser.accessLevel === 'CLIENT' && !currentUser.isOnboarded) {
    return (
      <React.Suspense fallback={<LoadingFallback />}>
        <OnboardingView
          user={currentUser}
          onComplete={async (data) => {
            const { error } = await completeOnboarding({
              name: data.name,
              email: data.email,
              whatsapp: data.whatsapp,
              avatar_url: data.avatarUrl,
              password: data.password
            });

            if (error) throw error;
          }}
          onLogout={handleLogout}
        />
      </React.Suspense>
    );
  }

  // Se for MANAGER e não selecionou cliente, mostra lista de clientes
  if (currentUser.accessLevel === 'MANAGER' && !selectedClient) {
    return (
      <React.Suspense fallback={<LoadingFallback />}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
          <header className="px-12 py-8 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src="https://majorhub.com.br/logo-majorhub.svg"
                alt="Major Hub"
                className="h-10 w-auto"
              />
              <span className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></span>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Gestão</span>
            </div>
            <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500">Sair da Conta</button>
          </header>
          <ClientListView
            clients={mappedClients as ClientAccount[]}
            isLoading={clientsLoading}
            onSelect={setSelectedClient}
            onAddClient={handleCreateClient}
            createClient={createClient}
            createInvitation={createInvitation}
          />
          {isInitializing && <LoadingFallback />}
        </div>
      </React.Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-background-light dark:bg-slate-950">


        <main className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-72'}`}>
          <header className="pt-4 md:pt-10 pb-4 md:pb-6 flex items-center justify-between px-4 md:px-12 sticky top-0 z-30 bg-gradient-to-b from-background-light via-background-light/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent backdrop-blur-md">
            <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
              {isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="hidden lg:flex p-2.5 text-primary hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 shrink-0"
                >
                  <span className="material-symbols-outlined !text-[20px]">side_navigation</span>
                </button>
              )}

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2.5 text-slate-500 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800 shrink-0"
              >
                <span className="material-symbols-outlined !text-[20px]">menu</span>
              </button>

              {/* Contexto do Cliente Atual */}
              {selectedClient && (
                <div className="flex items-center gap-2 md:gap-4 bg-white/80 dark:bg-slate-900/80 px-2 md:px-4 py-1.5 md:py-2 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in shrink-0">
                  <img src={selectedClient.logoUrl} className="size-5 md:size-6 object-contain filter grayscale" alt="" />
                  <span className="text-[10px] md:text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[80px] md:max-w-[120px]">{selectedClient.name}</span>
                  {currentUser.accessLevel === 'MANAGER' && (
                    <button onClick={() => setSelectedClient(null)} className="text-[9px] md:text-[10px] font-bold text-primary hover:underline">Trocar</button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-6 ml-3">
              {currentUser.accessLevel === 'MANAGER' && (
                <div className="flex items-center gap-2">


                  <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="bg-primary text-white p-2.5 md:py-3.5 md:px-8 rounded-full md:rounded-[1.25rem] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 group shrink-0"
                  >
                    <span className="material-symbols-outlined !text-[20px] md:!text-[22px] group-hover:rotate-90 transition-transform">add</span>
                    <span className="hidden md:inline font-bold text-sm">Novo Projeto</span>
                  </button>
                </div>
              )}

              {/* Botão de Logout Desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all shadow-sm active:scale-95 group"
              >
                <span className="material-symbols-outlined !text-[20px] group-hover:scale-110 transition-transform">logout</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
              </button>




            </div>
          </header>

          <div className={`w-full mx-auto ${activeTab === 'mensagens' ? 'h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] px-2 md:px-6' : 'px-4 md:px-12 max-w-[1600px] py-6 md:py-10'}`}>
            <React.Suspense fallback={<LoadingFallback />}>
              {activeTab === 'dashboard' && (
                <>
                  {/* Dashboard Header */}
                  <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
                    <div>
                      <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-2 text-gradient">
                        Dashboard {selectedClient?.name}
                      </h2>
                      <p className="text-slate-400 text-xs md:text-base font-medium">Seu fluxo criativo está pronto para hoje.</p>
                    </div>
                  </div>

                  {/* Upcoming Deliveries Section */}
                  <div className="mb-10 md:mb-16">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary !text-[18px]">calendar_month</span>
                      </div>
                      <h3 className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                        Próximas Entregas
                      </h3>
                    </div>

                    <div ref={carouselRef} className="flex overflow-x-auto gap-4 pb-6 no-scrollbar scroll-smooth touch-pan-x stagger-reveal">
                      {projectsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-white dark:bg-surface-elevated-dark p-6 rounded-lg border border-border-subtle dark:border-border-subtle-dark flex items-center gap-4 shrink-0 w-[280px] animate-pulse"
                          >
                            <div className="size-2.5 rounded-full shrink-0 bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                              <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                          </div>
                        ))
                      ) : dynamicDeliveries.length > 0 ? (
                        dynamicDeliveries.map((delivery) => (
                          <div
                            key={delivery.id}
                            onClick={() => {
                              const project = projects.find(p => p.id === delivery.projectId);
                              if (project) setSelectedProjectId(project.id);
                            }}
                            className={`bg-white dark:bg-surface-elevated-dark p-5 rounded-lg border-l-4 flex items-center gap-4 group hover:shadow-depth transition-all duration-300 cursor-pointer shrink-0 w-[280px] hover-lift ${delivery.isLate
                              ? 'border-l-accent-coral bg-accent-coral/5'
                              : 'border-l-primary'
                              }`}
                          >
                            <div className={`size-2.5 rounded-full shrink-0 ${delivery.isLate ? 'bg-accent-coral animate-pulse' : 'bg-primary glow-pulse'}`} />
                            <div className="flex-1 overflow-hidden">
                              <p className={`text-[9px] font-bold uppercase tracking-[0.15em] mb-1 ${delivery.isLate ? 'text-accent-coral' : 'text-slate-400'}`}>
                                {delivery.date} {delivery.isLate && '• Atrasado'}
                              </p>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">{delivery.title}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 px-6 text-slate-400 text-sm bg-slate-50 dark:bg-surface-dark rounded-lg border border-dashed border-border-subtle dark:border-border-subtle-dark">
                          <span className="material-symbols-outlined !text-[20px] mr-2 opacity-50">event_available</span>
                          Nenhuma entrega próxima.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-primary glow-pulse" />
                      <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">
                        Projetos em Foco
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 stagger-reveal">
                    {projectsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-[340px] bg-slate-50 dark:bg-surface-dark rounded-lg animate-pulse border border-border-subtle dark:border-border-subtle-dark" />
                      ))
                    ) : filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => setSelectedProjectId(project.id)}
                      />
                    ))}
                    {!projectsLoading && filteredProjects.length === 0 && (
                      <div className="col-span-full py-16 bg-white dark:bg-surface-elevated-dark rounded-xl border-2 border-dashed border-border-subtle dark:border-border-subtle-dark flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="size-16 bg-slate-100 dark:bg-surface-dark rounded-xl flex items-center justify-center">
                          <span className="material-symbols-outlined !text-[32px] opacity-40">folder_open</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Nenhum projeto encontrado para este cliente</p>
                        {currentUser.accessLevel === 'MANAGER' && (
                          <button onClick={() => setIsNewProjectModalOpen(true)} className="text-primary font-bold hover:underline text-sm btn-glow px-4 py-2 rounded-lg">
                            + Criar novo projeto
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'projetos' && (
                <MeusProjetosView
                  projects={filteredProjects}
                  upcomingDeliveries={dynamicDeliveries}
                  onUpdateProject={updateProject}
                  onSelectProject={(p) => setSelectedProjectId(p.id)}
                  isLoading={projectsLoading}
                />
              )}

              {activeTab === 'biblioteca' && <BibliotecaView projects={filteredProjects} />}
              {activeTab === 'perfil' && currentUser && (
                <PerfilView
                  user={currentUser}
                  onUpdateUser={async (updatedUser) => {
                    // Map frontend camelCase to backend snake_case
                    const dbUpdates: Record<string, any> = {};

                    // Mapear todos os campos corretamente
                    if (updatedUser.name !== undefined) dbUpdates.name = updatedUser.name;
                    if (updatedUser.role !== undefined) dbUpdates.role = updatedUser.role;
                    if (updatedUser.bio !== undefined) dbUpdates.bio = updatedUser.bio;
                    if (updatedUser.avatarUrl !== undefined) dbUpdates.avatar_url = updatedUser.avatarUrl;
                    if (updatedUser.coverUrl !== undefined) dbUpdates.cover_url = updatedUser.coverUrl;
                    if (updatedUser.skills !== undefined) dbUpdates.skills = updatedUser.skills;
                    if (updatedUser.location !== undefined) dbUpdates.location = updatedUser.location;
                    if (updatedUser.website !== undefined) dbUpdates.website = updatedUser.website;

                    return await updateProfile(dbUpdates);
                  }}
                />
              )}
              {activeTab === 'mensagens' && currentUser && <MensagensView currentUser={currentUser} />}
              {activeTab === 'configurações' && currentUser && (
                <ConfiguracoesView
                  currentUser={currentUser}
                  projects={filteredProjects}
                  onDeleteProject={async (id) => {
                    await deleteProject(id);
                  }}
                  selectedClient={selectedClient}
                  onDeleteClient={async (id) => {
                    await deleteClient(id);
                    setSelectedClient(null);
                  }}
                  members={members}
                  onDeleteMember={deleteMember}
                />
              )}
            </React.Suspense>
          </div>
        </main>

        <Sidebar
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
        />

        <React.Suspense fallback={null}>
          {selectedProject && (
            <ProjectDetailsModal
              project={selectedProject}
              onClose={() => setSelectedProjectId(null)}
              onUpdate={updateProject}
              onDelete={deleteProject}
              currentUser={currentUser}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
              onAddActivity={addActivity}
            />
          )}

          {isNewProjectModalOpen && selectedClient && (
            <NewProjectModal
              onClose={() => setIsNewProjectModalOpen(false)}
              onCreate={handleCreateProject}
              currentUser={currentUser}
              currentClient={selectedClient}
            />
          )}

          {isAICreateModalOpen && selectedClient && (
            <AICreateModal
              onClose={() => setIsAICreateModalOpen(false)}
              currentUser={currentUser}
              currentClient={selectedClient}
              onCreateProject={handleAICreateProject}
              onViewProject={(id) => {
                setSelectedProjectId(id);
                setIsAICreateModalOpen(false);
                setActiveTab('projetos');
              }}
              existingProjects={mappedProjects}
            />
          )}
        </React.Suspense>


      </div>
    </ErrorBoundary>
  );
};

export default App;
