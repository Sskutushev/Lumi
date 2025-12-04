import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ErrorHandler } from '../lib/errors/ErrorHandler';
import { Logger } from '../lib/errors/logger';
import { AppError } from '../lib/errors/errorTypes';
import { errorMessages } from '../lib/errors/errorMessages';

interface ErrorBoundaryState {
  hasError: boolean;
  appError: AppError | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ appError: AppError | null; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, appError: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    const appError = ErrorHandler.handle(error);
    return { hasError: true, appError };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    const appError = ErrorHandler.handle(error);
    this.setState({ appError });
    Logger.error('ErrorBoundary caught an error:', { error: appError, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, appError: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent appError={this.state.appError} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  appError: AppError | null;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ appError, resetError }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  // Get user-facing error message based on error type
  const getErrorMessage = () => {
    if (!appError) return t('errors.unexpected');

    // Use specific message for the error type
    const message = errorMessages[appError.type]?.[lang];
    if (message) return message;

    // Fallback to original message if no translation is available
    return appError.message || t('errors.unexpected');
  };

  // Show technical details only in dev mode
  const shouldShowDetails = process.env.NODE_ENV !== 'production' && appError?.originalError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="text-center max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-text-primary">{t('errors.somethingWentWrong')}</h2>
          <p className="text-text-secondary">{getErrorMessage()}</p>

          {shouldShowDetails && (
            <details className="text-left text-xs text-text-tertiary mt-4 p-3 bg-bg-secondary rounded-lg">
              <summary className="cursor-pointer">{t('errors.technicalDetails')}</summary>
              <div className="mt-2">
                <p>
                  <strong>{t('errors.errorType')}:</strong> {appError?.type}
                </p>
                <p>
                  <strong>{t('errors.status')}:</strong> {appError?.status}
                </p>
                <p>
                  <strong>{t('errors.url')}:</strong> {appError?.url}
                </p>
                <p>
                  <strong>{t('errors.originalError')}:</strong> {String(appError?.originalError)}
                </p>
              </div>
            </details>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={resetError}
            className="px-4 py-2 rounded-lg bg-accent-gradient-1 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            {t('errors.tryAgain')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
