require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDb } = require('../db');
const { Utilisateur, Categorie, Produit, nextId } = require('../models');

async function run() {
  await connectDb();
  console.log('Connexion OK');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@techstore.local';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  let admin = await Utilisateur.findOne({ email: adminEmail });
  if (!admin) {
    const idUtilisateur = await nextId('utilisateur');
    const motDePasse = await bcrypt.hash(adminPass, 10);
    admin = await Utilisateur.create({
      idUtilisateur,
      email: adminEmail,
      motDePasse,
      nom: 'Admin',
      role: 'admin'
    });
    console.log(`Admin créé: ${adminEmail} / ${adminPass}`);
  } else {
    console.log('Admin déjà présent:', adminEmail);
  }

  const countCat = await Categorie.countDocuments();
  if (countCat === 0) {
    const noms = ['PC portables', 'Composants', 'Périphériques', 'Gaming', 'Réseau'];
    for (const nomCat of noms) {
      const idCategorie = await nextId('categorie');
      await Categorie.create({ idCategorie, nomCat });
    }
    console.log('Catégories de démonstration créées.');
  }

  const vendeurEmail = process.env.SEED_VENDEUR_EMAIL || 'vendeur@techstore.local';
  const vendeurPass = process.env.SEED_VENDEUR_PASSWORD || 'vendeur123';
  let vendeur = await Utilisateur.findOne({ email: vendeurEmail });
  if (!vendeur) {
    const idV = await nextId('utilisateur');
    const hash = await bcrypt.hash(vendeurPass, 10);
    vendeur = await Utilisateur.create({
      idUtilisateur: idV,
      email: vendeurEmail,
      motDePasse: hash,
      nom: 'Vendeur',
      role: 'vendeur'
    });
    console.log(`Vendeur créé: ${vendeurEmail} / ${vendeurPass}`);
  }

  const countProd = await Produit.countDocuments();
  if (countProd === 0 && vendeur) {
    const cat = await Categorie.findOne().lean();
    if (cat) {
      const idProd = await nextId('produit');
      await Produit.create({
        idProd,
        nomProd: 'PC Portable Pro 15"',
        prix: 89990,
        description: 'Produit exemple (seed)',
        idCategorie: cat.idCategorie,
        idVendeur: vendeur.idUtilisateur
      });
      console.log('Un produit exemple a été créé.');
    }
  }

  console.log('Seed terminé.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
