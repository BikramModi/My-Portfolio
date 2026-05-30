import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules", "coverage"],
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      sourceType: "module",

      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    rules: {
      "no-console": "off",

      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },

  },

  prettier,
];
