/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
	root: true,
	"parser": "@typescript-eslint/parser",
	"plugins": ["@typescript-eslint"],
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:jsx-a11y/recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended"
	],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json", "./tsconfig.node.json"],
	},
	settings: {react: {"version": "detect"}},
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off"
	}
};
