
import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null };
    declare props: Readonly<Props>;

    constructor(props: Props) {
        super(props);
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full p-8 bg-[#f3f2f1]">
                    <div className="bg-white border border-[#edebe9] rounded-md shadow-sm max-w-md w-full p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-[#323130] mb-2">Wystąpił nieoczekiwany błąd</h2>
                        <p className="text-sm text-[#605e5c] mb-6">
                            Odśwież stronę — jeśli błąd się powtarza, wyczyść dane przeglądarki.
                        </p>
                        {this.state.error && (
                            <p className="text-xs text-[#a19f9d] font-mono mb-6 break-all">
                                {this.state.error.message}
                            </p>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#0078d4] text-white text-sm font-semibold rounded-sm hover:bg-[#106ebe] transition-colors"
                        >
                            Odśwież stronę
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
