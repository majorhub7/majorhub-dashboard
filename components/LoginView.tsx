
import React, { useState, useEffect, useRef } from 'react';
import GlowButton from './landing/GlowButton';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp?: (email: string, password: string, name?: string) => Promise<{ error: Error | null; data?: any }>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Mouse tracking logic for the subtle gradient follow
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      container.style.setProperty('--mouse-x', `${x}%`);
      container.style.setProperty('--mouse-y', `${y}%`);
    };

    container.addEventListener('pointermove', handlePointerMove);
    return () => container.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp && onSignUp) {
        const { error: signUpError } = await onSignUp(email, password, name);
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Este e-mail já está cadastrado. Faça login ou use outro e-mail.');
          } else if (signUpError.message.includes('Password should be')) {
            setError('A senha deve ter pelo menos 6 caracteres.');
          } else {
            setError(signUpError.message);
          }
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        const { error: authError } = await onLogin(email, password);
        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha incorretos. Por favor, tente novamente.');
          } else if (authError.message.includes('too many requests')) {
            setError('Muitas tentativas de login. Tente novamente mais tarde.');
          } else {
            setError(authError.message);
          }
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado ao conectar ao servidor.');
      console.error('Auth submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-void flex items-center justify-center p-6 z-[100] font-body group overflow-hidden"
    >
      {/* 1. LAYER: TECHNICAL GRID (Static Base) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1a1f2e 1px, transparent 1px),
            linear-gradient(to bottom, #1a1f2e 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. LAYER: DOT MATRIX (Interactive Reveal) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          backgroundImage: 'radial-gradient(circle, #00F2FE 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-[480px] bg-[#03060a] relative z-20 rounded-sm border border-void-border p-10 md:p-12 shadow-2xl overflow-hidden backdrop-blur-sm">

        {/* Decorative Technical Borders */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-acid/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-acid/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-acid/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-acid/50" />

        <div className="flex flex-col items-center mb-10">
          {/* Logo - Technical Style */}
          {/* Logo - Official */}
          <div className="mb-6 flex items-center gap-2">
            <img
              src="https://majorhub.com.br/logo-major.svg"
              alt="Major Hub"
              className="h-12 w-auto"
            />
          </div>

          <p className="text-slate-400 text-xs font-mono uppercase tracking-[0.2em] text-center border-b border-void-border pb-2 w-full">
            {isSignUp ? 'Inicializar Novo Protocolo' : 'Acesso ao Sistema :: v2.0'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-acid mb-1 block uppercase tracking-widest pl-1">Identificação E-mail</label>
            <div className="relative group/input">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@agencia.com"
                className="w-full bg-[#050a14] border border-void-border rounded-sm py-4 px-4 text-sm text-white focus:border-acid focus:ring-1 focus:ring-acid/20 transition-all outline-none placeholder:text-slate-700 font-mono"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-void-border rounded-full group-focus-within/input:bg-acid transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-acid mb-1 block uppercase tracking-widest pl-1">Chave de Acesso</label>
            <div className="relative group/input">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050a14] border border-void-border rounded-sm py-4 px-4 text-sm text-white focus:border-acid focus:ring-1 focus:ring-acid/20 transition-all outline-none placeholder:text-slate-700 font-mono"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-void-border rounded-full group-focus-within/input:bg-acid transition-colors" />
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-2 animate-fade-in-up">
              <label className="text-[10px] font-mono text-acid mb-1 block uppercase tracking-widest pl-1">Nome do Operador</label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome Completo"
                  className="w-full bg-[#050a14] border border-void-border rounded-sm py-4 px-4 text-sm text-white focus:border-acid focus:ring-1 focus:ring-acid/20 transition-all outline-none placeholder:text-slate-700 font-mono"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-void-border rounded-full group-focus-within/input:bg-acid transition-colors" />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/20 text-red-400 text-[10px] font-mono border border-red-900/30 rounded-sm flex items-center gap-2">
              <span className="material-symbols-outlined !text-[14px]">error</span>
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-950/20 text-green-400 text-[10px] font-mono border border-green-900/30 rounded-sm flex items-center gap-2">
              <span className="material-symbols-outlined !text-[14px]">check_circle</span>
              {success}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              <div className={`
                    relative group overflow-hidden rounded-sm
                    bg-acid text-void font-bold uppercase tracking-widest text-xs
                    py-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'PROCESSANDO...' : isSignUp ? 'INICIAR REGISTRO' : 'ACESSAR SISTEMA'}
                  {!loading && <span className="material-symbols-outlined !text-[16px]">login</span>}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {onSignUp && (
            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-slate-500 hover:text-acid text-xs font-mono uppercase tracking-widest transition-colors py-2 border-t border-void-border/50 mt-4 pt-6"
            >
              {isSignUp ? '[ JÁ POSSUO ACESSO ]' : '[ SOLICITAR NOVO ACESSO ]'}
            </button>
          )}
        </form>
      </div>

      {/* Footer Status */}
      <div className="fixed bottom-6 text-center w-full pointer-events-none z-20">
        <span className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.3em]">
          CONEXÃO SEGURA :: ENCRIPTADA
        </span>
      </div>
    </div>
  );
};

export default LoginView;
