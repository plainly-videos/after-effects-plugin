export class CollectFootageError extends Error {
  errorPaths: string[];
  constructor(errorPaths: string[]) {
    super();
    this.errorPaths = errorPaths;
  }
}

export class CollectFontsError extends Error {
  errorPaths: string[];
  constructor(errorPaths: string[]) {
    super();
    this.errorPaths = errorPaths;
  }
}
