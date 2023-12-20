// Based on https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/.eslintrc.cjs
// with changes from https://github.com/vitejs/vite/blob/main/packages/create-vite/template-react-ts/README.md
// and additional plugins.
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: [".local", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
  settings: { react: { version: "detect" } },
  plugins: ["react-refresh"],
  rules: {
    "prettier/prettier": "warn",

    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ["**/*.test.ts?(x)"],
      extends: ["plugin:testing-library/react", "plugin:jest-dom/recommended"],
      rules: {
        "@typescript-eslint/unbound-method": "off",
      },
    },
  ],
};
