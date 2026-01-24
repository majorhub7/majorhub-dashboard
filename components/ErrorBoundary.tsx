import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to external service in production (Sentry, LogRocket, etc.)
        if (import.meta.env.PROD) {
            // TODO: Send to monitoring service
            console.error('ErrorBoundary caught:', error, errorInfo);
        } else {
            console.error('Uncaught error:', error, errorInfo);
        }
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Optionally reload the page
        // window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-500 to-orange-500 p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Algo deu errado
                            </h1>

                            <p className="text-gray-600 mb-6">
                                Desculpe, encontramos um erro inesperado. Tente novamente.
                            </p>

                            {!import.meta.env.PROD && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                        Detalhes técnicos (DEV)
                                    </summary>
                                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                                        {this.state.error.message}
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                                >
                                    Tentar Novamente
                                </button>

                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200"
                                >
                                    Início
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
