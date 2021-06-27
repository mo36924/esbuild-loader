#!/usr/bin/env -S node --enable-source-maps
import { build } from "esbuild";
import { readFile } from "fs/promises";

const data = await readFile("package.json", "utf-8");
const { dependencies, devDependencies } = JSON.parse(data);
const external = Object.keys({ ...dependencies, ...devDependencies });

const result = await build({
  entryPoints: [process.argv[2]],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  external,
  sourcemap: "inline",
});

const base64 = Buffer.from(result.outputFiles[0].contents).toString("base64");
await import(`data:text/javascript;base64,${base64}`);
