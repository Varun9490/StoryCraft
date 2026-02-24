'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                    <div className="text-4xl mb-3 opacity-30">⚠️</div>
                    <h3 className="text-sm font-semibold text-white/60 mb-2">
                        {this.props.errorTitle || 'Something went wrong'}
                    </h3>
                    <p className="text-xs text-white/30 mb-4">
                        {this.props.errorMessage || 'This section encountered an error.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110"
                        style={{ background: '#C4622D' }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;

export function withErrorBoundary(Component, fallbackProps = {}) {
    return function WrappedWithErrorBoundary(props) {
        return (
            <ErrorBoundary {...fallbackProps}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
