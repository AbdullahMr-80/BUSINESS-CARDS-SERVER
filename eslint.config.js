/* eslint-disable */
import js from "@eslint/js";
import pluginN from "eslint-plugin-n";
import pluginPromise from "eslint-plugin-promise";
import globals from "globals"; // 👈 add this line

export default [
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node, // 👈 adds console, process, Buffer, etc.
      },
    },
    plugins: { n: pluginN, promise: pluginPromise },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginN.configs["flat/recommended"].rules,
      ...pluginPromise.configs.recommended.rules,
      "no-new-native-nonconstructor": "error",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-process-exit": "off",
    },
  },
];
