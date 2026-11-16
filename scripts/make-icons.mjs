// Generates PWA icons (public/) and Android source assets (assets/) from one flower drawing.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const flower = (scale = 1) => `
  <g transform="translate(256 256) scale(${scale})" fill="#fff">
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-92" rx="54" ry="74" transform="rotate(${a})"/>`).join('')}
    <circle r="46" fill="#ffd166"/>
  </g>`
const gradient = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#f7a04b"/><stop offset="1" stop-color="#ec5a52"/></linearGradient></defs>`
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${body}</svg>`)

const rounded = svg(`${gradient}<rect width="512" height="512" rx="112" fill="url(#g)"/>${flower()}`)
const full = svg(`${gradient}<rect width="512" height="512" fill="url(#g)"/>${flower(0.72)}`)
const background = svg(`${gradient}<rect width="512" height="512" fill="url(#g)"/>`)
const foreground = svg(flower(0.6))
const splash = (bg) => svg(`<rect width="512" height="512" fill="${bg}"/>
  <g transform="translate(256 256) scale(0.22) translate(-256 -256)">${gradient}<rect width="512" height="512" rx="112" fill="url(#g)"/>${flower()}</g>`)

mkdirSync('public', { recursive: true })
mkdirSync('assets', { recursive: true })
const png = (src, size, out) => sharp(src, { density: 600 }).resize(size, size).png().toFile(out)

await Promise.all([
  png(rounded, 192, 'public/icon-192.png'),
  png(rounded, 512, 'public/icon-512.png'),
  png(full, 512, 'public/icon-maskable-512.png'),
  png(full, 180, 'public/apple-touch-icon.png'),
  png(full, 1024, 'assets/icon-only.png'),
  png(foreground, 1024, 'assets/icon-foreground.png'),
  png(background, 1024, 'assets/icon-background.png'),
  png(splash('#fbf7f2'), 2732, 'assets/splash.png'),
  png(splash('#17141a'), 2732, 'assets/splash-dark.png'),
])
console.log('icons written')
