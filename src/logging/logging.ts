import { loggingConfig } from "src/config/loggingConfig";

export const log = (
  level: "DEBUG" | "WARN" | "ERROR",
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
) => {
  if (
    level === "WARN" ||
    (level === "DEBUG" && loggingConfig.modules[module].debug)
  )
    console.log(`${module}`, ...logItems);
  else if (level === "ERROR") console.error(`${module}`, ...logItems);
};

export const debug = (
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
) => {
  log("DEBUG", module, ...logItems);
};

export const warn = (
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
) => {
  log("WARN", module, ...logItems);
};

export const error = (
  module: keyof typeof loggingConfig.modules,
  ...logItems: any[]
) => {
  log("ERROR", module, ...logItems);
};
