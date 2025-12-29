//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-classnames', 'prettier-plugin-merge'],
  tailwindStylesheet: './src/styles.css',
};

export default config;
