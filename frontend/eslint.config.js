import js from '@eslint/js';
import globals from 'globals';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'dist/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // 启用 vue-eslint-parser + vue essential 规则集（不含纯格式规则，避免与项目既有代码风格冲突）
  ...vue.configs['flat/essential'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    settings: {
      vue: {
        version: '3.13',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      'vue/no-v-html': 'off',
      'vue/multi-word-component-names': 'off',
      // 既有代码模式：filter/pagination/modelValue 等 prop 直接修改，统一改为 warn 避免影响功能
      'vue/no-mutating-props': 'warn',
    },
  },
  {
    // 单独为 .vue 文件配置：vue-eslint-parser 内部用 @typescript-eslint/parser 解析 <script lang="ts">
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
);
