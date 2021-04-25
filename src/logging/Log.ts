import { loggingConfig } from "src/config/loggingConfig";

const MODULE_STYLE = "color: #999";

type Module = keyof typeof loggingConfig.modules;

export class Log {
  constructor(private module: Module) {
    this.module = module;
  }

  get moduleArgs() {
    return [`%c${this.module}`, MODULE_STYLE];
  }

  trace = (...logItems: any[]) => {
    if (
      loggingConfig.enabled.trace &&
      loggingConfig.modules[this.module].trace
    ) {
      console.log(...this.moduleArgs, "TRACE", ...logItems);
    }
  };

  debug = (...logItems: any[]) => {
    if (
      loggingConfig.enabled.debug &&
      loggingConfig.modules[this.module].debug
    ) {
      console.log(...this.moduleArgs, "DEBUG", ...logItems);
    }
  };

  warn = (...logItems: any[]) => {
    if (loggingConfig.enabled.warn && loggingConfig.modules[this.module].warn) {
      console.warn(...this.moduleArgs, "WARN", ...logItems);
    }
  };

  error = (...logItems: any[]) => {
    if (loggingConfig.enabled.error) {
      console.error(...this.moduleArgs, "ERROR", ...logItems);
    }
  };
}
