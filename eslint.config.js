import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/material',
              message:
                'Import MUI components from their subpath (e.g. "@mui/material/Button") to preserve tree-shaking.',
            },
            {
              name: '@mui/icons-material',
              message:
                'Import MUI icons from their subpath (e.g. "@mui/icons-material/Add") to preserve tree-shaking.',
            },
          ],
        },
      ],
    },
  },
  // No hardcoded colors: every color must come from a theme token (see theme.ts).
  // The token-definition files below are exempt — they are where raw values live.
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/styles/theme.ts', 'src/styles/colors.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          // Hex colors in string literals. 6/8-digit hex matches anywhere
          // (unambiguous); 3/4-digit only when it's the entire string value
          // (so prose like "PR #214" is not mistaken for a color).
          selector:
            'Literal[value=/(?:#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b|^#[0-9a-fA-F]{3,4}$)/]',
          message:
            'No hardcoded hex colors. Use a theme token instead (e.g. sx={{ color: "primary.main" }} or theme.palette.ink.muted). Raw values belong only in theme.ts / colors.ts.',
        },
        {
          // rgb()/rgba()/hsl()/hsla() in string literals.
          selector: 'Literal[value=/(?:rgba?|hsla?)\\(/]',
          message:
            'No hardcoded rgb/rgba/hsl colors. Use a theme token (e.g. theme.palette.glass.panel or theme.palette.brand.alpha(0.08)). Raw values belong only in theme.ts / colors.ts.',
        },
        {
          // Same patterns inside template literals (e.g. `0 8px 32px rgba(...)`).
          selector:
            'TemplateElement[value.raw=/(?:#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b|(?:rgba?|hsla?)\\()/]',
          message:
            'No hardcoded colors in template strings. Build the value from a theme token (e.g. `0 8px 32px ${theme.palette.brand.alpha(0.08)}`).',
        },
      ],
    },
  },
)
