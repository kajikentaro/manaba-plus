module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
  },
  extends: ["standard", "prettier"],
  rules: {
    quotes: ["error", "double", { avoidEscape: true }],
    camelcase: "error",
  },
  ignorePatterns: ["build", "node_modules", "public"],
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/semi": "error",
        "@typescript-eslint/member-delimiter-style": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-return": "error",
      },
    },
  ],
};
