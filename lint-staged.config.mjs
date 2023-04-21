export default {
  "*.{ts,html}": ["eslint -c .eslintrc.json --ext .ts,.html --fix", "prettier --write"],
  "*.css": ["stylelint --fix --allow-empty-input", "prettier --write"],
  "*.{js,json,md}": ["prettier --write"]
};
