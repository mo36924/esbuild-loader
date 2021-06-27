import { build } from "esbuild";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

type GetFormat = (
  url: string,
  context: { format: string },
  defaultGetSource: GetFormat,
) => { format: string } | Promise<{ format: string }>;

type GetSource = (
  url: string,
  context: { format: string },
  defaultGetSource: GetSource,
) => { source: string | Uint8Array } | Promise<{ source: string | Uint8Array }>;

const external = new Promise<string[]>(async (resolve) => {
  const data = await readFile("package.json", "utf-8");
  const { dependencies, devDependencies } = JSON.parse(data);
  resolve(Object.keys({ ...dependencies, ...devDependencies }));
});

export const getFormat: GetFormat = (url, context, defaultGetFormat) => {
  if (url.endsWith(".ts")) {
    return { format: "module" };
  }
  return defaultGetFormat(url, context, defaultGetFormat);
};

export const getSource: GetSource = async (url, context, defaultGetSource) => {
  if (url.endsWith(".ts")) {
    const path = fileURLToPath(url);
    const result = await build({
      outfile: `${path}.js`,
      entryPoints: [path],
      bundle: true,
      write: false,
      platform: "node",
      format: "esm",
      external: await external,
      sourcemap: "inline",
    });
    return {
      source: result.outputFiles[0].contents,
    };
  }
  return defaultGetSource(url, context, defaultGetSource);
};
