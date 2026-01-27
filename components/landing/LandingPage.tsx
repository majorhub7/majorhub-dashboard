
import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import FeatureGrid from './FeatureGrid';
import Footer from './Footer';
import ComparisonSection from './ComparisonSection';
import RetentionSection from './RetentionSection';
import QualificationSection from './QualificationSection';
import OnboardingSection from './OnboardingSection';

interface LandingPageProps {
    onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-void text-white font-sans selection:bg-acid/30 font-body">
            {/* Navigation Bar - Technical HUD Style */}
            <nav
                className={`
            fixed top-0 w-full z-50 transition-all duration-300 border-b
            ${scrolled
                        ? 'bg-void/90 backdrop-blur-md border-void-border/50 py-4 shadow-depth'
                        : 'bg-transparent border-transparent py-8'}
          `}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-default">
                        {/* Simplified Logo Concept for Technical Vibe */}
                        <div className="w-8 h-8 bg-gradient-to-br from-acid to-primary rounded-sm flex items-center justify-center transform rotate-45 group-hover:rotate-0 transition-transform duration-500">
                            <span className="material-symbols-outlined text-void font-bold !text-[20px] transform -rotate-45 group-hover:rotate-0 transition-transform duration-500">diamond</span>
                        </div>
                        <span className="font-display font-bold text-xl tracking-tighter hidden sm:block">
                            MAJOR<span className="text-acid">HUB</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-xs font-mono font-medium text-slate-400">
                        <a href="#" className="hover:text-acid transition-colors">[FUNCIONALIDADES]</a>
                        <a href="#" className="hover:text-acid transition-colors">[PREÇOS]</a>
                        <a href="#" className="hover:text-acid transition-colors">[SOBRE]</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLoginClick}
                            className="text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors px-2 uppercase tracking-wide"
                        >
                        // ENTRAR
                        </button>
                        {/* Using a custom pill button for CTA */}
                        <button
                            onClick={onLoginClick}
                            className="
                           relative overflow-hidden
                           bg-void-surface border border-acid/50 
                           text-acid hover:text-void hover:bg-acid
                           px-6 py-2.5 rounded-full 
                           text-xs font-bold uppercase tracking-widest
                           transition-all duration-300
                           shadow-[0_0_10px_rgba(0,242,254,0.1)]
                           hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]
                           group
                        "
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                CRIAR MEU HUB
                                <span className="material-symbols-outlined !text-[14px] group-hover:translate-x-1 transition-transform">terminal</span>
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                <HeroSection onLoginClick={onLoginClick} />

                {/* Section 1: Comparison */}
                <ComparisonSection />

                {/* Section 2: Features (Existing) */}
                <FeatureGrid />

                {/* Section 3: Lock-in/Retention */}
                <RetentionSection />

                {/* Section 4: Qualification */}
                <QualificationSection />

                {/* Section 5: Onboarding */}
                <OnboardingSection />
            </main>

            <Footer onLoginClick={onLoginClick} />
        </div>
    );
};

export default LandingPage;
