import { build, Glob } from 'bun';

// Cari semua file .ts di dalam folder src
const glob = new Glob('**/*.ts');
const entrypoints = Array.from(glob.scanSync({ cwd: './src' })).map(
  (file) => `./src/${file}`,
);

console.log(`Menemukan ${entrypoints.length} file untuk dibuild...`);

// Jalankan proses build
const result = await build({
  entrypoints,
  outdir: './dist',
  target: 'bun',
  minify: true, // Ubah jadi false kalau kode tidak mau dikompres
});

if (result.success) {
  console.log('✅ Build berhasil! Cek folder ./dist');
} else {
  console.error('❌ Build gagal:', result.logs);
}
