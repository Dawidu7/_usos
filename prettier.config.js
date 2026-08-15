/** @type {import("prettier").Config & import("@trivago/prettier-plugin-sort-imports").PluginConfig} */
const config = {
  arrowParens: "avoid",
  semi: false,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "^(.*)/env$",
    "^(react|next)(/.*|$)",
    "<THIRD_PARTY_MODULES>",
    "^@usos/(.*)$",
    "^[./]",
  ],
  importOrderSortSpecifiers: true,
}

export default config
