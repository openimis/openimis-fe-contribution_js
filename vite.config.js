import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';

const noExternal = [
  '@mui/material',
  '@mui/system',
  '@mui/icons-material',
  '@mui/styled-engine',
  '@emotion/react',
  '@emotion/styled',
  '@emotion/cache'
];

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    svgr()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: 'ContributionModule',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
    },
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      external: [
        /^react.*/,
        /^redux.*/,
        'redux-api-middleware',
        'react-intl',
        'react-helmet',
        'react-multi-date-picker',
        'prop-types',
        /^react-date-object.*/,
        'nepali-date-converter',
        'moment',
        /^lodash.*/,
        'lodash-uuid',
        'classnames',
        'clsx',
        'react-autosuggest',
        'history',
        /^@emotion\/react/,
        /^@emotion\/styled/,
        /^@emotion\/cache/,
        /^@mui\/material.*/,
        /^@mui\/icons-material.*/,
        /^@mui\/system.*/,
        /^@mui\/styles.*/,
        '@date-io/core',
        '@date-io/moment',
        'zxcvbn',
        'flat',
        /^@babel-.*/,
        /^@date-io\/.*/,
        /^@openimis.*/
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'react/jsx-dev-runtime': 'jsxDevRuntime',
          '@emotion/react': 'EmotionReact',
          '@emotion/styled': 'EmotionStyled',
          '@mui/material': 'MuiMaterial',
        },
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@emotion/react': resolve(
        __dirname,
        'node_modules/@emotion/react'
      ),
      '@emotion/styled': resolve(
        __dirname,
        'node_modules/@emotion/styled'
      ),
      '@emotion/cache': resolve(
        __dirname,
        'node_modules/@emotion/cache'
      ),
    },
  },
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@mui/material',
      '@mui/icons-material',
      '@mui/system',
    ],
    force: true,
  },
  ssr: {
    noExternal,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.js'],
    include: ['tests/**/*.test.{js,jsx}', 'src/**/*.test.{js,jsx}'],
    alias: {
      '@openimis/fe-core': resolve(__dirname, 'tests/mocks/feCore.jsx'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/index.jsx'],
    },
  },
});
