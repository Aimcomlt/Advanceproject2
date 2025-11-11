module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  env: {
    node: true,
    es2021: true,
  },
  ignorePatterns: ["dist/", "node_modules/", "artifacts/", "cache/"],
  overrides: [
    {
      files: ["scripts/**/*.ts", "test/**/*.ts"],
      env: {
        node: true,
        mocha: true,
      },
      rules: {
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      },
    },
  ],
  rules: {
    "prettier/prettier": "error"
  },
};
