import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const legacyDir = path.join(publicDir, 'v1')

await rm(legacyDir, { recursive: true, force: true })
await mkdir(legacyDir, { recursive: true })

const legacyIndex = await readFile(path.join(publicDir, 'index.html'), 'utf8')
const legacyHtml = legacyIndex
  .replaceAll('src="js/', 'src="../js/')
  .replaceAll('src="./images/', 'src="../images/')

await writeFile(path.join(legacyDir, 'index.html'), legacyHtml)

const carCatalog = await readFile(path.join(publicDir, 'cars.json'), 'utf8')
const legacyCatalog = carCatalog.replaceAll('"/images/', '"../images/')
await writeFile(path.join(legacyDir, 'cars.json'), legacyCatalog)
await cp(path.join(publicDir, 'specs'), path.join(legacyDir, 'specs'), { recursive: true })