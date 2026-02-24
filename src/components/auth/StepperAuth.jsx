'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleSelector from './RoleSelector';
import BuyerForm from './BuyerForm';
import ArtisanForm from './ArtisanForm';
import VerifyStep from './VerifyStep';

const registerSteps = ['Choose Role', 'Your Details', 'Welcome!'];
const loginSteps = ['Sign In', "You're In!"];

export default function StepperAuth({ mode = 'register', defaultRole = null }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedRole, setSelectedRole] = useState(defaultRole || '');
    const [userData, setUserData] = useState(null);

    const steps = mode === 'register' ? registerSteps : loginSteps;
    const totalSteps = steps.length;

    function onNext() {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    }

    function onBack() {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }

    function onRegistrationSuccess(user) {
        setUserData(user);
        onNext();
    }

    function onLoginSuccess(user) {
        setUserData(user);
        onNext();
    }

    function renderRegisterStep() {
        switch (currentStep) {
            case 0:
                return (
                    <RoleSelector
                        selected={selectedRole}
                        onSelect={setSelectedRole}
                        onNext={onNext}
                    />
                );
            case 1:
                return selectedRole === 'artisan' ? (
                    <ArtisanForm onSuccess={onRegistrationSuccess} onBack={onBack} />
                ) : (
                    <BuyerForm
                        onSuccess={onRegistrationSuccess}
                        onBack={onBack}
                        role="buyer"
                    />
                );
            case 2:
                return <VerifyStep user={userData} />;
            default:
                return null;
        }
    }

    function renderLoginStep() {
        switch (currentStep) {
            case 0:
                return <BuyerForm onSuccess={onLoginSuccess} mode="login" />;
            case 1:
                return <VerifyStep user={userData} mode="login" />;
            default:
                return null;
        }
    }

    return (
        <div className="w-full">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {steps.map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                            <motion.div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors"
                                style={{
                                    fontFamily: 'var(--font-inter)',
                                    background:
                                        i < currentStep
                                            ? '#52B788'
                                            : i === currentStep
                                                ? '#C4622D'
                                                : 'transparent',
                                    borderColor:
                                        i < currentStep
                                            ? '#52B788'
                                            : i === currentStep
                                                ? '#C4622D'
                                                : 'rgba(255,255,255,0.15)',
                                    color:
                                        i <= currentStep ? '#fff' : 'rgba(255,255,255,0.4)',
                                }}
                                animate={{ scale: i === currentStep ? 1.1 : 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {i < currentStep ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    i + 1
                                )}
                            </motion.div>
                            <span
                                className="text-[10px] mt-1 whitespace-nowrap"
                                style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: i <= currentStep ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                                }}
                            >
                                {step}
                            </span>
                        </div>
                        {i < totalSteps - 1 && (
                            <div
                                className="w-12 h-0.5 mb-4 rounded-full transition-colors"
                                style={{
                                    background: i < currentStep ? '#52B788' : 'rgba(255,255,255,0.1)',
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step content with AnimatePresence */}
            <div
                className="rounded-2xl border p-6 sm:p-8"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255,255,255,0.08)',
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {mode === 'register' ? renderRegisterStep() : renderLoginStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
