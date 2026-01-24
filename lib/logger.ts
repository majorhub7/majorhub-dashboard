/**
 * Structured logging system for production
 * Replaces console.log/error with safe, structured logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;

    private log(level: LogLevel, message: string, context?: LogContext) {
        if (!this.isDevelopment && level === 'debug') {
            return; // Skip debug logs in production
        }

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...(context && { context }),
        };

        // In production, you could send to external service (Sentry, LogRocket, etc.)
        if (this.isDevelopment) {
            const logFn = level === 'error' ? console.error : console.log;
            logFn(`[${level.toUpperCase()}]`, message, context || '');
        }
        // TODO: Add production logging service integration here
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context);
    }

    error(message: string, context?: LogContext) {
        this.log('error', message, context);
    }

    debug(message: string, context?: LogContext) {
        this.log('debug', message, context);
    }
}

export const logger = new Logger();
