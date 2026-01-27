
import React from 'react';

const Footer = ({ onLoginClick }: { onLoginClick: () => void }) => {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="https://majorhub.com.br/logo-majorhub.svg" alt="MajorHub" className="h-8 brightness-0 invert" />
                            <span className="text-white font-bold text-xl tracking-tight">MajorHub</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            O Sistema Operacional de Experiência do Cliente para agências criativas visionárias.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
                        <div>
                            <h4 className="text-white font-bold mb-6">Produto</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Novidades</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Empresa</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Acesso</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><button onClick={onLoginClick} className="hover:text-white transition-colors text-left">Entrar</button></li>
                                <li><button onClick={onLoginClick} className="hover:text-white transition-colors text-left">Cadastrar</button></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} MajorHub. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-600 hover:text-slate-400 text-xs">Política de Privacidade</a>
                        <a href="#" className="text-slate-600 hover:text-slate-400 text-xs">Termos de Uso</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
