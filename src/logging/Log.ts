import { loggingConfig } from "src/config/loggingConfig";

type Module = keyof typeof loggingConfig.modules;

export class Log {
  constructor(private module: Module) {
    this.module = module;
  }

  private logArgs(level: string) {
    return [`%c${this.module} %c${level}`, "color: #777", "color: #999"];
  }
  trace = (...logItems: any[]): void => {
    if (
      loggingConfig.enabled.trace &&
      loggingConfig.modules[this.module].trace
    ) {
      console.log(...this.logArgs("TRACE"), ...logItems);
    }
  };

  debug = (...logItems: any[]): void => {
    if (
      loggingConfig.enabled.debug &&
      loggingConfig.modules[this.module].debug
    ) {
      console.log(...this.logArgs("DEBUG"), ...logItems);
    }
  };

  warn = (...logItems: any[]): void => {
    if (loggingConfig.enabled.warn && loggingConfig.modules[this.module].warn) {
      console.warn(...this.logArgs("WARN"), ...logItems);
    }
  };

  error = (...logItems: any[]): void => {
    if (loggingConfig.enabled.error) {
      console.error(...this.logArgs("ERROR"), ...logItems);
    }
  };
}
