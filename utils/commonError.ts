/**
 * This error is thrown if the function is cancelled before completing
 */
export class CancelledError extends Error {
  constructor() {
    super('Cancelled');
  }
}

/**
 * Throw this error if the function should retry
 */
export class RepeatableError extends Error {}
