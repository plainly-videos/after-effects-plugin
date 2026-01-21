export class CollectFootageError extends Error {
  errorPaths: string[];
  constructor(errorPaths: string[]) {
    super(
      `Could not collect footage for the following paths: ${errorPaths.join(', ')}`,
    );
    this.errorPaths = errorPaths;
  }
}

export class CollectFontsError extends Error {
  errorPaths: string[];
  constructor(errorPaths: string[]) {
    super(
      `Could not collect fonts for the following paths: ${errorPaths.join(', ')}`,
    );
    this.errorPaths = errorPaths;
  }
}

export class PlainlyApiError extends Error {
  status?: number;
  data?: unknown;

  constructor({
    message,
    status,
    data,
  }: {
    message: string;
    status?: number;
    data?: unknown;
  }) {
    super(message);
    this.name = 'PlainlyApiError';
    this.status = status;
    this.data = data;
  }
}
