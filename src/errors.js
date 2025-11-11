export class SerializedError {
  constructor(error) {
    this.message = error?.message || 'Unknown error';
    this.name = error?.name || 'Error';
    this.stack = error?.stack || '';
    this.code = error?.code || null;
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack,
      code: this.code
    };
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}

export function serializeError(error) {
  if (error instanceof SerializedError) return error;
  return new SerializedError(error);
}

export function normalizeError(error) {
  if (!error) return null;
  if (error instanceof Error) return serializeError(error);
  if (typeof error === 'object') return new SerializedError(error);
  return new SerializedError(new Error(String(error)));
}

export default { SerializedError, serializeError, normalizeError };
