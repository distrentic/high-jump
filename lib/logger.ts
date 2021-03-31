interface LeveledLogMethod {
  (...params: any[]): any;
}

interface Logger {
  error: LeveledLogMethod;
  info: LeveledLogMethod;
  debug: LeveledLogMethod;
}

export { Logger };
