// scripts/download-photos.js
// Télécharge les photos de démonstration (Wikimedia Commons) dans public/annonces/.
// Usage : npm run photos
// Les fichiers déjà présents sont ignorés ; relancer le script est sans danger.

const fs = require('fs');
const path = require('path');
const annonces = require('../data/annonces.data');

const OUT_DIR = path.join(__dirname, '..', 'public', 'annonces');
const WIDTH = 900;
const USER_AGENT = 'MotocazDemo/1.0 (projet etudiant; contact: motocaz@example.com)';

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Nom du fichier local pour une annonce (ex: yamaha-mt-07-2021.jpg) */
const localName = (annonce) => `${slugify(annonce.titre)}.jpg`;

/** URL distante de secours (utilisée si le téléchargement échoue) */
const remoteUrl = (annonce) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(annonce.photoFile)}?width=${WIDTH}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(annonce, attempt = 1) {
  const res = await fetch(remoteUrl(annonce), { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' });
  if (res.status === 429 && attempt <= 4) {
    await sleep(2000 * attempt);
    return download(annonce, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 5000) throw new Error('fichier trop petit');
  fs.writeFileSync(path.join(OUT_DIR, localName(annonce)), buffer);
}

async function downloadAll() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let ok = 0, skipped = 0, failed = 0;

  for (const annonce of annonces) {
    const file = path.join(OUT_DIR, localName(annonce));
    if (fs.existsSync(file) && fs.statSync(file).size > 5000) {
      skipped++;
      continue;
    }
    try {
      await download(annonce);
      ok++;
      console.log(`  ✅ ${localName(annonce)}`);
      await sleep(600); // politesse envers Wikimedia
    } catch (err) {
      failed++;
      console.warn(`  ⚠️  ${localName(annonce)} : ${err.message}`);
    }
  }
  console.log(`📷 Photos : ${ok} téléchargée(s), ${skipped} déjà présente(s), ${failed} échec(s)`);
  return { ok, skipped, failed };
}

module.exports = { downloadAll, localName, remoteUrl, OUT_DIR };

if (require.main === module) {
  downloadAll().then(({ failed }) => process.exit(failed ? 1 : 0));
}
