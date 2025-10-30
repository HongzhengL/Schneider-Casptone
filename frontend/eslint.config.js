import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';

const jsRecommended = js.configs.recommended;
const tsRecommended = tseslint.configs.recommended;
const reactHooksRecommended = reactHooks.configs['recommended-latest'];
const reactRefreshRecommended = reactRefresh.configs.vite;

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            parser: tsParser,
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...jsRecommended.rules,
            ...tsRecommended.rules,
            ...reactHooksRecommended.rules,
            ...reactRefreshRecommended.rules,
            'react-refresh/only-export-components': [
                'error',
                {
                    allowExportNames: ['useAuth'],
                },
            ],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' },
            ],
        },
    },
]);
