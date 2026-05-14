import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  ...nextCoreWebVitals,
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "coverage/**",
    ],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // React 19 の新ルール。既存 shadcn コードと既存ロジック (timer 完了検知) と互換性がないため緩める。
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
]

export default config
