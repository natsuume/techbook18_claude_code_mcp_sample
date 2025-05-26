import eslint from "@eslint/js";
import globals from "globals";
import tsEslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import stylistic from "@stylistic/eslint-plugin";

export default tsEslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
      "*.js",
      "*.mjs",
      "*.d.ts",
      "test/**/*",
    ],
  },
  { languageOptions: { parser: tsEslint.parser } },
  eslint.configs.recommended,
  tsEslint.configs.strictTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ["./eslint.config.mjs"],
      },
    },
  },
  eslintConfigPrettier,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { ecmaVersion: 2020, globals: globals.node },
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "new-cap": "off",
      "no-restricted-syntax": ["error", "Literal[raw='null']"],
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", next: "*", prev: ["const", "let", "var"] },
        {
          blankLine: "any",
          next: ["const", "let", "var"],
          prev: ["const", "let", "var"],
        },
        { blankLine: "always", next: "return", prev: "*" },
        { blankLine: "always", next: "*", prev: "directive" },
        { blankLine: "any", next: "directive", prev: "directive" },
        { blankLine: "always", next: "*", prev: "import" },
        { blankLine: "any", next: "import", prev: "import" },
        { blankLine: "always", next: "export", prev: "*" },
        { blankLine: "always", next: "*", prev: "function" },
        { blankLine: "always", next: "function", prev: "*" },
        { blankLine: "always", next: "*", prev: "if" },
        { blankLine: "always", next: "if", prev: "*" },
        { blankLine: "always", next: "*", prev: "class" },
        { blankLine: "always", next: "class", prev: "*" },
      ],
      "require-jsdoc": "off",
    },
  },
);