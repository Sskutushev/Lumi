import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
    <div className="text-center max-w-md w-full space-y-6">
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-text-primary">Что-то пошло не так</h2>
        <p className="text-text-secondary">
          {error?.message || 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.'}
        </p>
      </div>

      <div className="pt-4">
        <button
          onClick={resetError}
          className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Попробовать снова
        </button>
      </div>
    </div>
  </div>
);

export default ErrorBoundary;