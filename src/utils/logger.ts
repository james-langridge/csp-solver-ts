/**
 * Simple logging utility for debugging CSP solver behavior.
 * Enable logging by setting environment variables:
 * - CSP_DEBUG=true to enable logging
 * - CSP_LOG_LEVEL=trace|debug|info to set verbosity
 */

export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  trace(message: string, data?: any): void;
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

class ConsoleLogger implements Logger {
  constructor(
    private enabled: boolean = false,
    private level: 'trace' | 'debug' | 'info' = 'info'
  ) {}

  private formatData(data: any): string {
    if (!data) return '';
    const json = JSON.stringify(data, null, 2);
    // Color JSON syntax
    return json
      .replace(/"([^"]+)":/g, `${colors.cyan}"$1":${colors.reset}`) // keys
      .replace(/: "([^"]+)"/g, `: ${colors.green}"$1"${colors.reset}`) // string values
      .replace(/: (\d+)/g, `: ${colors.yellow}$1${colors.reset}`) // numbers
      .replace(/: (true|false)/g, `: ${colors.magenta}$1${colors.reset}`); // booleans
  }

  debug(message: string, data?: any): void {
    if (this.enabled && ['debug', 'trace'].includes(this.level)) {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
      console.log(
        `${colors.gray}${timestamp}${colors.reset} ${colors.yellow}[DEBUG]${colors.reset} ${message}`,
        data ? '\n' + this.formatData(data) : ''
      );
    }
  }

  info(message: string, data?: any): void {
    if (this.enabled) {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
      console.log(
        `${colors.gray}${timestamp}${colors.reset} ${colors.green}[INFO]${colors.reset} ${colors.bright}${message}${colors.reset}`,
        data ? '\n' + this.formatData(data) : ''
      );
    }
  }

  trace(message: string, data?: any): void {
    if (this.enabled && this.level === 'trace') {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
      console.log(
        `${colors.gray}${timestamp}${colors.reset} ${colors.dim}${colors.blue}[TRACE]${colors.reset} ${colors.dim}${message}${colors.reset}`,
        data ? '\n' + colors.dim + this.formatData(data) + colors.reset : ''
      );
    }
  }
}

// Create singleton logger instance
export const logger = new ConsoleLogger(
  process.env.CSP_DEBUG === 'true',
  (process.env.CSP_LOG_LEVEL as 'trace' | 'debug' | 'info') || 'info'
);