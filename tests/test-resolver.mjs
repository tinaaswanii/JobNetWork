import { pathToFileURL } from "node:url";
import { resolve as pathResolve } from "node:path";
import { existsSync } from "node:fs";

const projectRoot = pathToFileURL(pathResolve(import.meta.dirname, "..")).href + "/";

export function resolve(specifier, context, nextResolve) {
  let target = specifier;
  if (specifier.startsWith("@/")) {
    target = new URL(specifier.slice(2), projectRoot).href;
  }

  // If file: URL without extension, try appending .ts or .tsx
  if (target.startsWith("file://") && !target.endsWith(".ts") && !target.endsWith(".tsx") && !target.endsWith(".js") && !target.endsWith(".mjs")) {
    const filePath = new URL(target).pathname.replace(/^\/([a-zA-Z]:)/, "$1");
    if (existsSync(filePath + ".ts")) {
      target = target + ".ts";
    } else if (existsSync(filePath + ".tsx")) {
      target = target + ".tsx";
    } else if (existsSync(filePath + "/index.ts")) {
      target = target + "/index.ts";
    }
  }

  return nextResolve(target, context);
}
