/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  parserOptions: {
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  settings: { react: { version: "detect" } },
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
  },
  overrides: [
    {
      files: ["**/*.test.ts?(x)"],
      rules: {
        "@typescript-eslint/unbound-method": "off",
      },
    },
  ],
};
