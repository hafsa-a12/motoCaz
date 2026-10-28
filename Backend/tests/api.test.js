// tests/api.test.js — tests d'intégration de l'API (node:test, aucune dépendance en plus)
//
//   MONGO_URL=mongodb://localhost:27017/motocaz_test npm test
//
// ⚠️ Utilise une base DÉDIÉE aux tests : elle est vidée au début.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-de-test-0123456789';
const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/motocaz_test';

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = require('../app');
const User = require('../models/User');
const Annonce = require('../models/Annonce');

let server;
let base;
const uploadedFiles = [];

const api = async (method, url, { token, json, form } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  if (form) body = form;
  const res = await fetch(base + url, { method, headers, body });
  let data = null;
  try { data = await res.json(); } catch { /* pas de JSON */ }
  return { status: res.status, data };
};

// 1x1 PNG valide
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHcOW9QAAAABJRU5ErkJggg==', 'base64');

const registerForm = (email, overrides = {}) => {
  const f = new FormData();
  const fields = { nom: 'Alaoui', prenom: 'Karim', email, telephone: '0661000000', ville: 'Rabat', dateNaissance: '1995-05-05', motDePasse: 'MotDePasse1', ...overrides };
  Object.entries(fields).forEach(([k, v]) => f.append(k, v));
  f.append('pieceIdentite', new Blob([PNG], { type: 'image/png' }), 'cin.png');
  return f;
};

const login = async (email, motDePasse) => (await api('POST', '/api/auth/login', { json: { email, motDePasse } }));

before(async () => {
  await mongoose.connect(MONGO);
  await Promise.all([User.deleteMany({}), Annonce.deleteMany({})]);
  await User.syncIndexes();
  await User.create({ nom: 'Admin', prenom: 'Test', email: 'admin@test.ma', motDePasse: 'Admin1234!', role: 'admin' });
  await User.create({ nom: 'Super', prenom: 'Test', email: 'super@test.ma', motDePasse: 'Super1234!', role: 'superadmin' });
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  await Promise.all([User.deleteMany({}), Annonce.deleteMany({})]);
  await mongoose.disconnect();
  uploadedFiles.forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));
  // nettoie les pièces d'identité / photos créées par les tests
  for (const dir of ['uploads/piecesIdentite', 'public/annonces']) {
    const d = path.join(__dirname, '..', dir);
    fs.readdirSync(d).filter((n) => /^\d+-\d+\./.test(n) && Date.now() - fs.statSync(path.join(d, n)).mtimeMs < 120000)
      .forEach((n) => fs.unlinkSync(path.join(d, n)));
  }
});

describe('Santé & sécurité de base', () => {
  test('GET /api/health', async () => {
    const r = await api('GET', '/api/health');
    assert.equal(r.status, 200);
    assert.equal(r.data.status, 'ok');
  });
  test('route inconnue -> 404 JSON', async () => {
    const r = await api('GET', '/api/nimporte');
    assert.equal(r.status, 404);
  });
  test('en-têtes de sécurité (helmet) + photos servies cross-origin', async () => {
    const res = await fetch(base + '/api/health');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('cross-origin-resource-policy'), 'cross-origin');
  });
});

describe('Inscription / connexion', () => {
  test('inscription puis connexion avec le même mot de passe (bug du double hachage)', async () => {
    const reg = await api('POST', '/api/auth/register', { form: registerForm('Karim@Test.ma') });
    assert.equal(reg.status, 201, JSON.stringify(reg.data));

    const ok = await login('karim@test.ma', 'MotDePasse1');
    assert.equal(ok.status, 200, JSON.stringify(ok.data));
    assert.equal(ok.data.role, 'client');
    assert.ok(ok.data.token);
  });

  test("l'email n'est pas sensible à la casse", async () => {
    const r = await login('KARIM@TEST.MA', 'MotDePasse1');
    assert.equal(r.status, 200);
  });

  test('mauvais mot de passe -> 401, même message que pour un email inconnu', async () => {
    const a = await login('karim@test.ma', 'mauvais');
    const b = await login('inconnu@test.ma', 'MotDePasse1');
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.equal(a.data.message, b.data.message);
  });

  test('email déjà utilisé -> 409', async () => {
    const r = await api('POST', '/api/auth/register', { form: registerForm('karim@test.ma') });
    assert.equal(r.status, 409);
  });

  test('mot de passe trop court -> 400', async () => {
    const r = await api('POST', '/api/auth/register', { form: registerForm('court@test.ma', { motDePasse: '123' }) });
    assert.equal(r.status, 400);
  });

  test('pièce d\'identité obligatoire', async () => {
    const f = new FormData();
    Object.entries({ nom: 'A', prenom: 'B', email: 'sans@test.ma', telephone: '06', ville: 'Fès', dateNaissance: '1990-01-01', motDePasse: 'MotDePasse1' }).forEach(([k, v]) => f.append(k, v));
    const r = await api('POST', '/api/auth/register', { form: f });
    assert.equal(r.status, 400);
  });

  test('le profil ne renvoie ni mot de passe ni pièce d\'identité', async () => {
    const { data } = await login('karim@test.ma', 'MotDePasse1');
    const me = await api('GET', '/api/auth/me', { token: data.token });
    assert.equal(me.status, 200);
    assert.equal(me.data.motDePasse, undefined);
    assert.equal(me.data.pieceIdentite, undefined);
  });

  test('compte bloqué -> 403', async () => {
    await User.updateOne({ email: 'karim@test.ma' }, { blocked: true });
    const r = await login('karim@test.ma', 'MotDePasse1');
    assert.equal(r.status, 403);
    await User.updateOne({ email: 'karim@test.ma' }, { blocked: false });
  });
});

describe('Annonces : publication, modération, droits', () => {
  let client, other, admin, superadmin, annonceId;

  before(async () => {
    await api('POST', '/api/auth/register', { form: registerForm('autre@test.ma') });
    client = (await login('karim@test.ma', 'MotDePasse1')).data;
    other = (await login('autre@test.ma', 'MotDePasse1')).data;
    admin = (await login('admin@test.ma', 'Admin1234!')).data;
    superadmin = (await login('super@test.ma', 'Super1234!')).data;
  });

  const annonceForm = (over = {}) => {
    const f = new FormData();
    const fields = { titre: 'Yamaha MT-07 test', description: 'Très bon état', prix: '65000', type: 'Moto', energie: 'Essence', marque: 'Yamaha', modele: 'MT-07', etat: 'occasion', ...over };
    Object.entries(fields).forEach(([k, v]) => f.append(k, v));
    f.append('photos', new Blob([PNG], { type: 'image/png' }), 'moto.png');
    return f;
  };

  test('publier sans être connecté -> 401', async () => {
    const r = await api('POST', '/api/annonces', { form: annonceForm() });
    assert.equal(r.status, 401);
  });

  test('publier : annonce « en attente », ville = ville du vendeur, photo enregistrée', async () => {
    const r = await api('POST', '/api/annonces', { token: client.token, form: annonceForm() });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    annonceId = r.data.annonce._id;
    assert.equal(r.data.annonce.statut, 'en attente');
    assert.equal(r.data.annonce.ville, 'Rabat');
    assert.match(r.data.annonce.photos[0], /^\/annonces\/\d+-\d+\.png$/);
  });

  test('prix invalide / type invalide -> 400', async () => {
    assert.equal((await api('POST', '/api/annonces', { token: client.token, form: annonceForm({ prix: '-5' }) })).status, 400);
    assert.equal((await api('POST', '/api/annonces', { token: client.token, form: annonceForm({ type: 'Camion' }) })).status, 400);
  });

  test('fichier non-image refusé', async () => {
    const f = annonceForm();
    f.set('photos', new Blob(['pas une image'], { type: 'text/plain' }), 'virus.txt');
    const r = await api('POST', '/api/annonces', { token: client.token, form: f });
    assert.equal(r.status, 400);
  });

  test('une annonce en attente est invisible dans la liste publique et pour les inconnus', async () => {
    const list = await api('GET', '/api/annonces');
    assert.ok(!list.data.items.some((a) => a._id === annonceId));
    assert.equal((await api('GET', `/api/annonces/${annonceId}`)).status, 404);
    assert.equal((await api('GET', `/api/annonces/${annonceId}`, { token: other.token })).status, 404);
  });

  test("l'auteur et l'admin voient l'annonce en attente", async () => {
    assert.equal((await api('GET', `/api/annonces/${annonceId}`, { token: client.token })).status, 200);
    assert.equal((await api('GET', `/api/annonces/${annonceId}`, { token: admin.token })).status, 200);
    const mine = await api('GET', '/api/annonces/miennes', { token: client.token });
    assert.equal(mine.data.length, 1);
  });

  test('un client ne peut PAS valider (403) ; sans token -> 401', async () => {
    assert.equal((await api('PUT', `/api/annonces/${annonceId}/valider`, { token: client.token })).status, 403);
    assert.equal((await api('PUT', `/api/annonces/${annonceId}/valider`)).status, 401);
    assert.equal((await api('PUT', `/api/admin/annonces/${annonceId}/valider`, { token: client.token })).status, 403);
  });

  test("l'admin voit les annonces en attente dans le back-office", async () => {
    const r = await api('GET', '/api/admin/annonces?statut=en%20attente', { token: admin.token });
    assert.equal(r.status, 200);
    assert.ok(r.data.items.some((a) => a._id === annonceId));
    assert.equal((await api('GET', '/api/admin/annonces', { token: client.token })).status, 403);
  });

  test("l'admin valide -> l'annonce devient publique ; détail : contact masqué sans connexion", async () => {
    const v = await api('PUT', `/api/admin/annonces/${annonceId}/valider`, { token: admin.token });
    assert.equal(v.status, 200);

    const list = await api('GET', '/api/annonces?marque=yamaha&type=Moto');
    assert.ok(list.data.items.some((a) => a._id === annonceId));

    const anon = await api('GET', `/api/annonces/${annonceId}`);
    assert.equal(anon.status, 200);
    assert.equal(anon.data.userId.email, undefined);
    assert.equal(anon.data.userId.telephone, undefined);

    const logged = await api('GET', `/api/annonces/${annonceId}`, { token: other.token });
    assert.equal(logged.data.userId.email, 'karim@test.ma');
  });

  test('filtres : prix, tri, injection NoSQL ignorée', async () => {
    const cher = await api('GET', '/api/annonces?prixMin=100000');
    assert.ok(!cher.data.items.some((a) => a._id === annonceId));
    // Un opérateur Mongo glissé dans l'URL ne doit PAS être interprété ($ne:Moto exclurait les motos)
    const all = await api('GET', '/api/annonces');
    const inj = await api('GET', '/api/annonces?type[$ne]=Moto');
    assert.equal(inj.status, 200);
    assert.equal(inj.data.total, all.data.total);
  });

  test("seul l'auteur modifie son annonce", async () => {
    assert.equal((await api('PUT', `/api/annonces/${annonceId}`, { token: other.token, json: { prix: 1 } })).status, 403);
    const ok = await api('PUT', `/api/annonces/${annonceId}`, { token: client.token, json: { prix: 62000, statut: 'validee', userId: 'x' } });
    assert.equal(ok.status, 200);
    assert.equal(ok.data.prix, 62000);
  });

  test('un autre client ne peut PAS supprimer mon annonce (bug corrigé)', async () => {
    assert.equal((await api('DELETE', `/api/annonces/${annonceId}`, { token: other.token })).status, 403);
    assert.equal((await api('DELETE', `/api/annonces/byAdmin/${annonceId}`, { token: other.token })).status, 403);
  });

  test('id invalide -> 404 (pas de 500)', async () => {
    assert.equal((await api('GET', '/api/annonces/pas-un-id')).status, 404);
  });

  test('rejeter puis supprimer par un admin', async () => {
    assert.equal((await api('PUT', `/api/admin/annonces/${annonceId}/rejeter`, { token: admin.token })).status, 200);
    assert.equal((await api('DELETE', `/api/annonces/byAdmin/${annonceId}`, { token: admin.token })).status, 200);
    assert.equal(await Annonce.countDocuments({ _id: annonceId }), 0);
  });

  test("l'auteur supprime sa propre annonce", async () => {
    const r = await api('POST', '/api/annonces', { token: other.token, form: annonceForm({ titre: 'À supprimer' }) });
    const del = await api('DELETE', `/api/annonces/${r.data.annonce._id}`, { token: other.token });
    assert.equal(del.status, 200);
  });

  describe('Back-office : comptes et clients', () => {
    test('/api/admin/users : fermé aux clients, aux admins simples et aux anonymes', async () => {
      assert.equal((await api('GET', '/api/admin/users')).status, 401);
      assert.equal((await api('GET', '/api/admin/users', { token: client.token })).status, 403);
      assert.equal((await api('GET', '/api/admin/users', { token: admin.token })).status, 403);
      assert.equal((await api('POST', '/api/admin/users', { json: { nom: 'x', prenom: 'y', email: 'h@h.ma', motDePasse: 'Hacker123!', role: 'superadmin' } })).status, 401);
    });

    test('le superadmin crée, modifie, supprime un admin', async () => {
      const created = await api('POST', '/api/admin/users', { token: superadmin.token, json: { nom: 'Nouveau', prenom: 'Admin', email: 'nouveau@test.ma', motDePasse: 'Nouveau1234', role: 'admin' } });
      assert.equal(created.status, 201, JSON.stringify(created.data));
      assert.equal(created.data.user.motDePasse, undefined);
      const id = created.data.user._id;

      // le nouvel admin peut se connecter (mot de passe haché une seule fois)
      assert.equal((await login('nouveau@test.ma', 'Nouveau1234')).status, 200);

      const upd = await api('PUT', `/api/admin/users/${id}`, { token: superadmin.token, json: { prenom: 'Modifié', role: 'admin', blocked: true } });
      assert.equal(upd.status, 200);
      assert.equal(upd.data.prenom, 'Modifié');
      assert.equal(upd.data.blocked, false); // champ non autorisé ignoré

      assert.equal((await api('DELETE', `/api/admin/users/${id}`, { token: superadmin.token })).status, 200);
    });

    test('le superadmin ne peut pas se supprimer ni créer un rôle invalide', async () => {
      assert.equal((await api('DELETE', `/api/admin/users/${superadmin.userId}`, { token: superadmin.token })).status, 400);
      const bad = await api('POST', '/api/admin/users', { token: superadmin.token, json: { nom: 'a', prenom: 'b', email: 'x@x.ma', motDePasse: 'Motdepasse1', role: 'client' } });
      assert.equal(bad.status, 400);
    });

    test('/api/admin/clients : admin OK (sans mots de passe), client refusé', async () => {
      const r = await api('GET', '/api/admin/clients', { token: admin.token });
      assert.equal(r.status, 200);
      assert.ok(r.data.length >= 2);
      assert.ok(r.data.every((c) => c.motDePasse === undefined && c.role === 'client'));
      assert.equal((await api('GET', '/api/admin/clients', { token: client.token })).status, 403);
    });

    test('un admin ne peut pas changer le rôle d\'un client (champs filtrés) mais peut le bloquer', async () => {
      const upd = await api('PUT', `/api/admin/clients/${other.userId}`, { token: admin.token, json: { role: 'superadmin', blocked: true, ville: 'Fès' } });
      assert.equal(upd.status, 200);
      const u = await User.findById(other.userId);
      assert.equal(u.role, 'client');
      assert.equal(u.blocked, true);
      assert.equal(u.ville, 'Fès');
      // un compte bloqué ne peut plus publier même avec un ancien token
      const pub = await api('POST', '/api/annonces', { token: other.token, form: annonceForm() });
      assert.equal(pub.status, 403);
    });

    test('supprimer un client supprime ses annonces', async () => {
      const del = await api('DELETE', `/api/admin/clients/${other.userId}`, { token: admin.token });
      assert.equal(del.status, 200);
      assert.equal(await Annonce.countDocuments({ userId: other.userId }), 0);
      assert.equal((await api('GET', `/api/admin/clients/${other.userId}`, { token: admin.token })).status, 404);
    });
  });
});
