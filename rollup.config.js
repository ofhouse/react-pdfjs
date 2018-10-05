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

  external: [
    'pdfjs-dist',
    'pdfjs-dist/lib/web/ui_utils',
    'pdfjs-dist/lib/web/pdf_viewer',
    'react',
    'react-dom',
  ],

  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),

    postcss({
      extract: true,
    }),
  ],
};
