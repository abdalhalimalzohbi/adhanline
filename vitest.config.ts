import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    // Deterministic: no ANSI in render output, host timezone fixed.
    env: { NO_COLOR: "1", TZ: "UTC" },
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts"],
    },
  },
});
