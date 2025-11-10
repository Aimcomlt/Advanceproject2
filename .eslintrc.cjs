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
  rules: {
    "prettier/prettier": "error"
  },
};
