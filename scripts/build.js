const fs = require('node:fs/promises');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'webroot');
const output = path.join(root, 'dist');
const publicOutput = path.join(output, 'webroot');

async function build() {
  // Only replace the generated directory directly inside this project.
  if (output !== path.resolve(root, 'dist') || path.dirname(output) !== root) {
    throw new Error('Build output must stay inside the project');
  }
  await fs.rm(output, {recursive: true, force: true});
  const stats = {files: 0, minified: 0, originalBytes: 0, minifiedBytes: 0};
  async function copyDirectory(from, to) {
    await fs.mkdir(to, {recursive: true});
    for (const entry of await fs.readdir(from, {withFileTypes: true})) {
      // Private files and development source maps never enter the public build.
      if (entry.name.startsWith('.') || entry.name.endsWith('.map')) continue;
      const input = path.join(from, entry.name);
      const destination = path.join(to, entry.name);
      if (entry.isDirectory()) {
        await copyDirectory(input, destination);
      } else if (entry.isFile()) {
        const extension = path.extname(entry.name);
        if (extension === '.js' || extension === '.css') {
          const text = await fs.readFile(input, 'utf8');
          const result = await esbuild.transform(text, {
            loader: extension === '.js' ? 'js' : 'css',
            // Classic script mode preserves top-level globals while shortening local names.
            minifyWhitespace: true,
            minifySyntax: true,
            minifyIdentifiers: true,
            legalComments: 'eof',
            sourcefile: path.relative(source, input),
            sourcemap: false
          });
          await fs.writeFile(destination, result.code);
          stats.minified++;
          stats.originalBytes += Buffer.byteLength(text);
          stats.minifiedBytes += Buffer.byteLength(result.code);
          for (const warning of result.warnings) {
            console.warn(`[Build] ${path.relative(source, input)}: ${warning.text}`);
          }
        } else {
          await fs.copyFile(input, destination);
        }
        stats.files++;
      }
    }
  }
  console.info('[Build] Preparing production assets');
  await copyDirectory(source, publicOutput);
  // Written last: Express refuses to serve an incomplete build.
  await fs.writeFile(path.join(output, 'build-info.json'), JSON.stringify(stats, null, 2) + '\n');
  const saved = ((1 - stats.minifiedBytes / stats.originalBytes) * 100).toFixed(1);
  console.info(`[Build] ${stats.files} files ready in dist/webroot`);
  console.info(`[Build] Minified ${stats.minified} JavaScript/CSS files: ${stats.originalBytes} → ${stats.minifiedBytes} bytes (${saved}% smaller)`);
}

build().catch(() => {
  console.error('[Build] Failed to prepare production assets; inspect source files and output permissions');
  process.exitCode = 1;
});
