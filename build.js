const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

const distDir = 'dist';

async function build() {
  try {
    // 確保 dist 資料夾是乾淨的
    await fs.emptyDir(distDir);
    console.log('Cleaned dist directory.');

    // 使用 esbuild 打包 TSX 檔案
    await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: path.join(distDir, 'index.js'),
      minify: true,
      sourcemap: true,
      jsx: 'automatic',
      target: 'es2020',
    });
    console.log('esbuild build successful.');

    // 複製靜態檔案到 dist 資料夾 (html & manifest)
    await fs.copy('index.html', path.join(distDir, 'index.html'));
    await fs.copy('manifest.json', path.join(distDir, 'manifest.json'));
    console.log('Copied static files (html, manifest).');

    // 處理 service-worker.js：讀取內容，替換版本號，再寫入 dist
    const swSrc = path.resolve(process.cwd(), 'service-worker.js');
    const swDest = path.join(distDir, 'service-worker.js');
    
    if (await fs.exists(swSrc)) {
        let swContent = await fs.readFile(swSrc, 'utf8');
        const timestamp = Date.now();
        // 使用 Regex 替換 CACHE_NAME 的值，加入時間戳
        swContent = swContent.replace(
            /const CACHE_NAME = .*/, 
            `const CACHE_NAME = 'chaos-simulator-cache-v${timestamp}';`
        );
        await fs.writeFile(swDest, swContent);
        console.log(`Generated service-worker.js with cache version: v${timestamp}`);
    } else {
        console.error('Error: service-worker.js not found');
        process.exit(1);
    }
    
    console.log('Build complete!');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();