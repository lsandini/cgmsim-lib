/**
 * Pluggable logger interface for simulation calculations.
 * Allows core simulation modules to remain 100% free of external logging libraries
 * like Pino or Logtail, while permitting consumers (Node, React Native, UI)
 * to attach custom logging handlers when needed.
 */

export interface SimulationLogger {
	debug?(message: string, ...args: unknown[]): void;
	info?(message: string, ...args: unknown[]): void;
	warn?(message: string, ...args: unknown[]): void;
	error?(message: string, ...args: unknown[]): void;
}

export const noopLogger: Required<SimulationLogger> = {
	debug: () => {},
	info: () => {},
	warn: () => {},
	error: () => {},
};

let activeLogger: SimulationLogger = noopLogger;

/**
 * Sets the active global logger for core simulation routines.
 * @param logger Custom logger instance or null/undefined to reset to no-op.
 */
export function setCoreLogger(logger?: SimulationLogger | null): void {
	activeLogger = logger ?? noopLogger;
}

/**
 * Returns the currently active simulation logger.
 */
export function getCoreLogger(): SimulationLogger {
	return activeLogger;
}

/**
 * Safe proxy logger forwarding calls to the active logger if method exists.
 */
export const coreLogger: Required<SimulationLogger> = {
	debug(message: string, ...args: unknown[]): void {
		if (activeLogger.debug) {
			activeLogger.debug(message, ...args);
		}
	},
	info(message: string, ...args: unknown[]): void {
		if (activeLogger.info) {
			activeLogger.info(message, ...args);
		}
	},
	warn(message: string, ...args: unknown[]): void {
		if (activeLogger.warn) {
			activeLogger.warn(message, ...args);
		}
	},
	error(message: string, ...args: unknown[]): void {
		if (activeLogger.error) {
			activeLogger.error(message, ...args);
		}
	},
};

export default coreLogger;
