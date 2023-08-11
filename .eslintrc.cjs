/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  settings: { react: { version: "detect" } },
  rules: {
    "prettier/prettier": "warn",
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
