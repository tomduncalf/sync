import { loggingConfig } from "src/config/loggingConfig";

const MODULE_STYLE = "color: #999";

export const log = (
  level: "DEBUG" | "WARN" | "ERROR",
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
): void => {
  if (
    level === "DEBUG" &&
    loggingConfig.enabled.debug &&
    loggingConfig.modules[module].debug
  ) {
    console.log(`%c${module}`, MODULE_STYLE, ...logItems);
  } else if (
    level === "WARN" &&
    loggingConfig.enabled.warn &&
    loggingConfig.modules[module].warn
  ) {
    console.warn(`%c${module}`, MODULE_STYLE, ...logItems);
  } else if (level === "ERROR" && loggingConfig.enabled.error) {
    console.error(`%c${module}`, MODULE_STYLE, ...logItems);
  }
};

export const debug = (
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
): void => {
  log("DEBUG", module, ...logItems);
};

export const warn = (
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
): void => {
  log("WARN", module, ...logItems);
};

export const error = (
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
): void => {
  log("ERROR", module, ...logItems);
};
