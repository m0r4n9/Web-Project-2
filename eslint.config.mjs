import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    {
        files: ["**/*.js"],
        languageOptions: { sourceType: "commonjs" },
        rules: {
            "no-console": "warn",
            "require-await": "error",
            "max-len": ["error", { "code": 120 }],
        },
    },
    {
        ignores: ["src/public"]
    },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,

];