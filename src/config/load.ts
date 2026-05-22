// Tolerant config load/save. Loading never throws — a missing or corrupt
// file falls back to defaults; a legacy dotfile is migrated once.
import { existsSync, unlinkSync } from "node:fs";
import type { Config } from "../types.js";
import { atomicWriteJson, readJsonOrNull } from "../util/fs.js";
import { configFile, legacyDotfile } from "./paths.js";
import { normalizeConfig } from "./schema.js";

export function loadConfig(): Config {
  const raw = readJsonOrNull(configFile()) ?? readJsonOrNull(legacyDotfile());
  return normalizeConfig(raw ?? {});
}

export function saveConfig(config: Config): void {
  atomicWriteJson(configFile(), normalizeConfig(config));
  const legacy = legacyDotfile();
  if (existsSync(legacy)) {
    try {
      unlinkSync(legacy);
    } catch {
      // best-effort cleanup
    }
  }
}
