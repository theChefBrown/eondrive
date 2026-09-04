import { existsSync } from 'fs'
import { mkdir, readFile, rm, stat, writeFile } from 'fs/promises'
import { basename, dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const root = join(scriptDir, '..')
const sourceCatalogPath = join(root, 'data', 'cars.json')
const publicCatalogPath = join(root, 'public', 'cars.json')
const imageDirectory = join(root, 'public', 'images', 'cars')
const manifestPath = join(imageDirectory, 'wikimedia-attribution.json')
const reportPath = join(root, 'reports', 'car-image-import-report.json')
const headers = { 'User-Agent': 'EondriveImageImporter/1.0 (https://github.com/theChefBrown/eondrive)', Accept: 'application/json' }
const limitIndex = process.argv.indexOf('--limit')
const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : Infinity

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
const fileName = car => `${basename(car.specFile, '.json').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`
const publicPath = name => `/images/cars/${name}`

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch { return fallback }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`Request failed (${response.status})`)
  return response.json()
}

function isLikelyExterior(image) {
  return !/\b(logo|badge|interior|dashboard|steering|engine|infotainment|wheel)\b/i.test(`${image.title} ${image.description}`)
}

async function commonsInfo(names) {
  if (!names.length) return []
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.search = new URLSearchParams({ action: 'query', titles: names.map(name => `File:${name}`).join('|'), prop: 'imageinfo', iiprop: 'url|mime|extmetadata', iiurlwidth: '1200', format: 'json', origin: '*' })
  const data = await fetchJson(url)
  return Object.values(data.query?.pages ?? []).flatMap(page => {
    const info = page.imageinfo?.[0]
    if (!info || !/^image\/(jpeg|png|webp)$/i.test(info.mime ?? '')) return []
    const meta = info.extmetadata ?? {}
    return [{
      title: String(page.title ?? '').replace(/^File:/, ''), url: info.thumburl ?? info.url,
      sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
      description: meta.ImageDescription?.value ?? '', author: meta.Artist?.value ?? meta.Credit?.value ?? 'Unknown',
      license: meta.LicenseShortName?.value ?? 'Unknown', licenseUrl: meta.LicenseUrl?.value ?? '', usageTerms: meta.UsageTerms?.value ?? '',
    }]
  })
}

async function imagesFromWikidata(query) {
  const search = new URL('https://www.wikidata.org/w/api.php')
  search.search = new URLSearchParams({ action: 'wbsearchentities', search: query, language: 'en', format: 'json', limit: '4' })
  const results = await fetchJson(search)
  const ids = (results.search ?? []).map(item => item.id).filter(Boolean)
  if (!ids.length) return []
  const entities = new URL('https://www.wikidata.org/w/api.php')
  entities.search = new URLSearchParams({ action: 'wbgetentities', ids: ids.join('|'), props: 'claims', format: 'json' })
  const data = await fetchJson(entities)
  const names = ids.flatMap(id => data.entities?.[id]?.claims?.P18 ?? []).map(claim => claim.mainsnak?.datavalue?.value).filter(Boolean)
  return commonsInfo(names)
}

async function imagesFromCommons(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.search = new URLSearchParams({ action: 'query', list: 'search', srnamespace: '6', srsearch: query, srlimit: '8', format: 'json', origin: '*' })
  const data = await fetchJson(url)
  return commonsInfo((data.query?.search ?? []).map(item => String(item.title).replace(/^File:/, '')))
}

async function findImage(car) {
  const queries = [`${car.brand} ${car.model}`, `${car.brand} ${car.model} electric car`]
  for (const query of queries) {
    for (const source of [imagesFromWikidata, imagesFromCommons]) {
      try {
        const image = (await source(query)).find(isLikelyExterior)
        if (image) return image
      } catch { /* Try the next open-source endpoint. */ }
      await sleep(180)
    }
  }
  return null
}

async function optimize(image, destination) {
  const response = await fetch(image.url, { headers, redirect: 'follow' })
  if (!response.ok) throw new Error(`Image download failed (${response.status})`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (!buffer.length) throw new Error('Image download was empty')
  await sharp(buffer).rotate().resize(600, 600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(destination)
}

function updateCatalog(catalog, paths) {
  return { ...catalog, cars: catalog.cars.map(car => paths.get(car.id) ? { ...car, image: paths.get(car.id) } : car) }
}

async function main() {
  if (limit !== Infinity && (!Number.isFinite(limit) || limit <= 0)) throw new Error('--limit must be a positive number')
  await mkdir(imageDirectory, { recursive: true })
  await mkdir(dirname(reportPath), { recursive: true })
  const sourceCatalog = await readJson(sourceCatalogPath)
  const publicCatalog = await readJson(publicCatalogPath)
  if (!Array.isArray(sourceCatalog?.cars) || !Array.isArray(publicCatalog?.cars)) throw new Error('Both car catalogs must contain a cars array')

  const manifest = await readJson(manifestPath, { generatedAt: null, images: {} })
  const paths = new Map(), imported = [], skipped = [], missing = [], oldPaths = new Set()
  const cars = sourceCatalog.cars.slice(0, limit)
  for (const car of cars) {
    const name = fileName(car), localPath = join(imageDirectory, name), imagePath = publicPath(name), prior = manifest.images?.[car.id]
    if (prior?.path === imagePath && existsSync(localPath)) {
      paths.set(car.id, imagePath); skipped.push({ id: car.id, vehicle: `${car.brand} ${car.model}`, path: imagePath }); console.log(`skip     ${car.brand} ${car.model}`); continue
    }
    process.stdout.write(`finding  ${car.brand} ${car.model} ... `)
    const image = await findImage(car)
    if (!image) { missing.push({ id: car.id, vehicle: `${car.brand} ${car.model}`, reason: 'No suitable Wikimedia Commons exterior image found' }); console.log('missing'); continue }
    try {
      await optimize(image, localPath)
      paths.set(car.id, imagePath); oldPaths.add(car.image)
      manifest.images[car.id] = { vehicle: `${car.brand} ${car.model}`, path: imagePath, commonsFile: image.title, sourceUrl: image.sourceUrl, author: image.author, license: image.license, licenseUrl: image.licenseUrl, usageTerms: image.usageTerms, importedAt: new Date().toISOString() }
      imported.push({ id: car.id, vehicle: `${car.brand} ${car.model}`, path: imagePath, sourceUrl: image.sourceUrl, license: image.license }); console.log(`saved (${image.license})`)
    } catch (error) { missing.push({ id: car.id, vehicle: `${car.brand} ${car.model}`, reason: error instanceof Error ? error.message : 'Image processing failed' }); console.log('failed') }
    await sleep(180)
  }

  const updatedSource = updateCatalog(sourceCatalog, paths), updatedPublic = updateCatalog(publicCatalog, paths)
  const activePaths = new Set(updatedSource.cars.map(car => car.image)); let removedLegacyImages = 0
  for (const oldPath of oldPaths) {
    if (!oldPath.startsWith('/images/cars/') || activePaths.has(oldPath)) continue
    const oldFile = join(root, 'public', oldPath.slice(1))
    if (existsSync(oldFile)) { await rm(oldFile); removedLegacyImages++ }
  }
  manifest.generatedAt = new Date().toISOString()
  await Promise.all([writeFile(sourceCatalogPath, `${JSON.stringify(updatedSource, null, 2)}\n`), writeFile(publicCatalogPath, `${JSON.stringify(updatedPublic, null, 2)}\n`), writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)])
  const sizes = await Promise.all(Object.values(manifest.images).map(async item => { const file = join(root, 'public', item.path.slice(1)); return existsSync(file) ? (await stat(file)).size : 0 }))
  const totalBytes = sizes.reduce((total, size) => total + size, 0)
  const report = { generatedAt: new Date().toISOString(), catalogVehicles: sourceCatalog.cars.length, scannedVehicles: cars.length, importedThisRun: imported, skippedExisting: skipped, missing, removedLegacyImages, totalImportedImages: Object.keys(manifest.images).length, totalImageBytes: totalBytes, totalImageMegabytes: Number((totalBytes / 1024 / 1024).toFixed(2)) }
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`\nImported this run: ${imported.length}\nAlready imported: ${skipped.length}\nStill missing: ${missing.length}\nCollection size: ${report.totalImageMegabytes} MB\nAttribution: ${relative(root, manifestPath)}\nReport: ${relative(root, reportPath)}`)
}

main().catch(error => { console.error(error); process.exitCode = 1 })