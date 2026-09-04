import sharp from 'sharp'
import { readdirSync, unlinkSync } from 'fs'
import { join, basename, extname } from 'path'

const dir = 'public/images/cars'
const TARGET_WIDTH = 800
const TARGET_HEIGHT = 500
const QUALITY = 82

const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f))

console.log(`Converting ${files.length} images to WebP (${TARGET_WIDTH}×${TARGET_HEIGHT}, q${QUALITY})…\n`)

let saved = 0
let totalOriginal = 0
let totalConverted = 0

for (const file of files) {
  const input = join(dir, file)
  const outputName = basename(file, extname(file)) + '.webp'
  const output = join(dir, outputName)

  try {
    const info = await sharp(input)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'centre',
      })
      .webp({ quality: QUALITY })
      .toFile(output)

    const { size: origSize } = (await import('fs')).statSync(input)
    const saving = Math.round((1 - info.size / origSize) * 100)
    totalOriginal += origSize
    totalConverted += info.size
    saved += origSize - info.size

    console.log(`✓ ${file.padEnd(35)} ${Math.round(origSize / 1024)}kB → ${Math.round(info.size / 1024)}kB  (${saving}% smaller)`)
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`)
  }
}

console.log(`\nTotal: ${Math.round(totalOriginal / 1024)}kB → ${Math.round(totalConverted / 1024)}kB`)
console.log(`Saved: ${Math.round(saved / 1024)}kB (${Math.round((saved / totalOriginal) * 100)}% reduction)`)
