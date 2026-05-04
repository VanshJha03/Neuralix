
import React, { useState } from 'react';
import LandingPage from './LandingPage';
import AuthScreen from './AuthScreen';

const PublicHome: React.FC = () => {
    const [showAuth, setShowAuth] = useState(false);

    if (showAuth) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowAuth(false)}
                    className="fixed top-8 left-8 z-[1100] text-zinc-500 hover:text-white text-[0.7rem] tracking-[0.2em] uppercase font-normal"
                >
                    ← Back to Landing
                </button>
                <AuthScreen />
            </div>
        );
    }

    const handleGetStarted = (tier?: string) => {
        if (tier) {
            localStorage.setItem('CreatioX_pending_checkout_tier', tier);
        }
        setShowAuth(true);
    };

    return <LandingPage onGetStarted={handleGetStarted} />;
};

export default PublicHome;
