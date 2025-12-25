import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const svgPath = path.join(projectRoot, 'public', 'favicon.svg');
const icoPath = path.join(projectRoot, 'src', 'app', 'favicon.ico');
const pngPath = path.join(projectRoot, 'public', 'favicon.png');
const appleTouchPath = path.join(projectRoot, 'public', 'apple-touch-icon.png');

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // PNG 32x32 を生成
  const png32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();

  // PNG 180x180 を生成（Apple Touch Icon用）
  const png180 = await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toBuffer();

  // PNG 192x192 を生成（PWA用）
  const png192 = await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toBuffer();

  // ICO形式で保存（32x32のPNGをICOとして保存）
  // シンプルなICOヘッダーを生成
  const icoBuffer = createIco([
    { size: 32, buffer: png32 }
  ]);

  fs.writeFileSync(icoPath, icoBuffer);
  fs.writeFileSync(pngPath, png32);
  fs.writeFileSync(appleTouchPath, png180);
  fs.writeFileSync(path.join(projectRoot, 'public', 'icon-192.png'), png192);

  console.log('Generated:');
  console.log('  - src/app/favicon.ico (32x32)');
  console.log('  - public/favicon.png (32x32)');
  console.log('  - public/apple-touch-icon.png (180x180)');
  console.log('  - public/icon-192.png (192x192)');
}

function createIco(images) {
  // ICOファイルフォーマット
  // ヘッダー: 6バイト
  // ディレクトリエントリ: 各16バイト
  // 画像データ

  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = images.length;

  let dataOffset = headerSize + (dirEntrySize * numImages);
  const entries = [];
  const buffers = [Buffer.alloc(headerSize)];

  // ICOヘッダー
  buffers[0].writeUInt16LE(0, 0);      // Reserved
  buffers[0].writeUInt16LE(1, 2);      // Type (1 = ICO)
  buffers[0].writeUInt16LE(numImages, 4);  // Number of images

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0);  // Width
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1);  // Height
    entry.writeUInt8(0, 2);           // Color palette
    entry.writeUInt8(0, 3);           // Reserved
    entry.writeUInt16LE(1, 4);        // Color planes
    entry.writeUInt16LE(32, 6);       // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8);  // Size of image data
    entry.writeUInt32LE(dataOffset, 12);        // Offset to image data
    entries.push(entry);
    dataOffset += img.buffer.length;
  }

  return Buffer.concat([
    buffers[0],
    ...entries,
    ...images.map(img => img.buffer)
  ]);
}

generateFavicons().catch(console.error);
