import chokidar from 'chokidar';
import esbuild from 'esbuild';
import fs from 'fs';

// Define a function to build the project
function build() {
  esbuild.buildSync({
    bundle: true,
    entryPoints: ['src/index.js'],
    outdir: 'dist',
    sourcemap: true
  });
  fs.copyFileSync('src/index.html', 'dist/index.html');
  console.log('Build complete');
}

// Call the build function initially
build();

// Watch for changes in the src file and rerun the build function
chokidar.watch('src/**/*').on('all', (event, path) => {
  console.log(`File ${path} has been ${event}`);
  build();
});
