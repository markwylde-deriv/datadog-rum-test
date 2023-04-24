import esbuild from 'esbuild';
import { promises as fs } from 'fs';
import chokidar from 'chokidar';
import debounce from 'debounce';

async function build() {
  esbuild.buildSync({
    bundle: true,
    entryPoints: ['./src/index.tsx'],
    outdir: 'dist',
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    define: {
      'process.env.NODE_ENV': '"' + process.env.NODE_ENV + '"'
    },
    sourcemap: true
  });

  await fs.cp('src/index.html', 'dist/index.html');
  await fs.cp('src/style.css', 'dist/style.css');
}

if (process.argv[2] === '--watch' || process.argv[2] === '-w') {
  chokidar.watch('src/**/*', { ignoreInitial: false }).on('all', debounce(build, 100));
  console.log('watching for changes');
} else {
  build();
}
