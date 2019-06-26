import { Config } from "@stencil/core";

import webworkify from "rollup-plugin-webworkify";

export const config: Config = {
  namespace: "wc-typeme",
  plugins: [
    webworkify({
      // specifically patten files
      pattern: "**/*.worker.js" // Default: undefined (follow micromath globs)
    })
  ],
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader"
    },
    {
      type: "docs-readme"
    },
    {
      type: "www",
      serviceWorker: null // disable service workers
    }
  ]
};
