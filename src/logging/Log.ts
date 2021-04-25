import { loggingConfig } from "src/config/loggingConfig";

const MODULE_STYLE = "color: #999";

type Module = keyof typeof loggingConfig.modules;

export class Log {
  module: Module;

  constructor(module: Module) {
    this.module = module;
  }

  get moduleArgs() {
    return [`%c${this.module}`, MODULE_STYLE];
  }

  debug = (...logItems: any[]) => {
    if (
      loggingConfig.enabled.debug &&
      loggingConfig.modules[this.module].debug
    ) {
      console.log(...this.moduleArgs, ...logItems);
    }
  };

  warn = (...logItems: any[]) => {
    if (loggingConfig.enabled.warn && loggingConfig.modules[this.module].warn) {
      console.warn(...this.moduleArgs, ...logItems);
    }
  };

  error = (...logItems: any[]) => {
    if (loggingConfig.enabled.error) {
      console.error(...this.moduleArgs, ...logItems);
    }
  };
}
