module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  plugins: ["@typescript-eslint"],
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
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
  settings: { react: { version: "detect" } },
  rules: {
    "prettier/prettier": "warn",
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
