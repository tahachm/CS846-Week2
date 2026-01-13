import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    test: {
        environment: "node",
        // Use jsdom for component tests under tests/components
        environmentMatchGlobs: [["tests/components/**", "jsdom"]],
        // Make it easier to see what flows ran when you capture logs
        logHeapUsage: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
