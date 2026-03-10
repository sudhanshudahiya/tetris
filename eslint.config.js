const js = require("@eslint/js");
const html = require("eslint-plugin-html");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-case-declarations": "warn",
    },
  },
  {
    files: ["**/*.html"],
    plugins: { html },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-case-declarations": "warn",
    },
  },
];
