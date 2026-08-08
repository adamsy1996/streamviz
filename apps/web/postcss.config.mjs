export default {
  plugins: {
    '@stylexswc/postcss-plugin': {
      include: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}', 'lib/**/*.{js,jsx,ts,tsx}'],
      exclude: ['node_modules/**', '.next/**'],
      rsOptions: {
        dev: process.env.NODE_ENV !== 'production',
      },
    },
    autoprefixer: {},
  },
}
