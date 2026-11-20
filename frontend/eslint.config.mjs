import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...tseslint.configs.recommended,
  // Fields taken out of an object with a rest (`{ secret, ...rest }`) are on purpose not used
  { rules: { "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }] } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
