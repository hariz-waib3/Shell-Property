import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier/flat'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  prettier,
]
