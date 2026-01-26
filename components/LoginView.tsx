
import React, { useState } from 'react';

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
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 z-[100] font-body">
      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] p-10 md:p-16 border border-slate-100 dark:border-slate-800 animate-scale-up">
        <div className="flex flex-col items-center mb-12">
          <div className="size-16 bg-gradient-to-br from-violet-400 to-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-6">
            <span className="material-symbols-outlined !text-[36px]">palette</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Major Hub</h1>
          <p className="text-slate-400 text-sm font-medium">
            {isSignUp ? 'Crie sua conta' : 'Acesse seu workspace criativo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Nome (opcional)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
              />
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[11px] font-bold rounded-xl animate-fade-in text-center border border-rose-100 dark:border-rose-500/20">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-xl animate-fade-in text-center border border-emerald-100 dark:border-emerald-500/20">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Validando...' : isSignUp ? 'Criar conta' : 'Entrar no Hub'}
          </button>

          {onSignUp && (
            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-slate-500 hover:text-primary text-sm font-medium transition-colors py-2"
            >
              {isSignUp ? 'Já tenho uma conta' : 'Criar uma conta'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginView;
