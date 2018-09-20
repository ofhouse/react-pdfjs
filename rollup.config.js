import postcss from 'rollup-plugin-postcss';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'react-pdfjs',
    exports: 'named',
    globals: {
      react: 'React',
    },

    file: 'dist/index.js',
    format: 'cjs',
  },

  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),

    postcss({
      extract: true,
    }),
  ],
};
