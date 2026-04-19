const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  { _id: String, seq: { type: Number, default: 0 } },
  { collection: 'counters' }
);
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

async function nextId(name) {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

const utilisateurSchema = new mongoose.Schema(
  {
    idUtilisateur: { type: Number, unique: true, index: true },
    nom: String,
    prenom: String,
    dateNaiss: Date,
    email: { type: String, unique: true, index: true },
    motDePasse: String,
    adresse: String,
    photoProfil: String,
    role: { type: String, enum: ['client', 'vendeur', 'admin'] },
    dateCreation: { type: Date, default: Date.now }
  },
  { collection: 'utilisateur' }
);
utilisateurSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.motDePasse;
    delete ret.__v;
    delete ret._id;
    return ret;
  }
});
const Utilisateur = mongoose.models.Utilisateur || mongoose.model('Utilisateur', utilisateurSchema);

const categorieSchema = new mongoose.Schema(
  {
    idCategorie: { type: Number, unique: true, index: true },
    nomCat: { type: String, required: true }
  },
  { collection: 'categorie' }
);
const Categorie = mongoose.models.Categorie || mongoose.model('Categorie', categorieSchema);

const produitSchema = new mongoose.Schema(
  {
    idProd: { type: Number, unique: true, index: true },
    nomProd: { type: String, required: true },
    prix: { type: Number, default: 0 },
    description: String,
    idCategorie: { type: Number, index: true },
    idVendeur: { type: Number, index: true },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: 'produit' }
);
const Produit = mongoose.models.Produit || mongoose.model('Produit', produitSchema);

const panierSchema = new mongoose.Schema(
  {
    idPanier: { type: Number, unique: true, index: true },
    idClient: { type: Number, index: true },
    statut: { type: String, enum: ['actif', 'converti', 'abandonne'], default: 'actif' },
    dateCreation: { type: Date, default: Date.now },
    dateExpiration: Date
  },
  { collection: 'panier' }
);
const Panier = mongoose.models.Panier || mongoose.model('Panier', panierSchema);

const contientSchema = new mongoose.Schema(
  {
    idPanier: { type: Number, index: true },
    idProd: { type: Number, index: true },
    qte: { type: Number, default: 1 },
    unite: String
  },
  { collection: 'contient' }
);
contientSchema.index({ idPanier: 1, idProd: 1 }, { unique: true });
const Contient = mongoose.models.Contient || mongoose.model('Contient', contientSchema);

const commandeSchema = new mongoose.Schema(
  {
    idCommande: { type: Number, unique: true, index: true },
    idClient: { type: Number, index: true },
    date: { type: Date, default: Date.now },
    statut: {
      type: String,
      enum: ['en_attente', 'payee', 'expediee', 'livree', 'annulee'],
      default: 'en_attente'
    },
    total: Number,
    livraisonNom: String,
    livraisonPrenom: String,
    livraisonTel: String,
    livraisonAdresse: String,
    livraisonVille: String,
    livraisonCodePostal: String,
    livraisonNotes: String
  },
  { collection: 'commande' }
);
const Commande = mongoose.models.Commande || mongoose.model('Commande', commandeSchema);

const commandeProduitSchema = new mongoose.Schema(
  {
    idCommande: { type: Number, index: true },
    idProd: { type: Number, index: true },
    qte: { type: Number, default: 1 },
    prix: Number
  },
  { collection: 'commande_produit' }
);
commandeProduitSchema.index({ idCommande: 1, idProd: 1 }, { unique: true });
const CommandeProduit =
  mongoose.models.CommandeProduit || mongoose.model('CommandeProduit', commandeProduitSchema);

const produitFavoriSchema = new mongoose.Schema(
  {
    idClient: { type: Number, index: true },
    idProd: { type: Number, index: true },
    date: { type: Date, default: Date.now }
  },
  { collection: 'produit_favori' }
);
produitFavoriSchema.index({ idClient: 1, idProd: 1 }, { unique: true });
const ProduitFavori =
  mongoose.models.ProduitFavori || mongoose.model('ProduitFavori', produitFavoriSchema);

const produitImageSchema = new mongoose.Schema(
  {
    idImage: { type: Number, unique: true, index: true },
    idProd: { type: Number, index: true },
    url: { type: String, required: true },
    isMain: { type: Boolean, default: false },
    ordre: { type: Number, default: 0 }
  },
  { collection: 'produit_image' }
);
const ProduitImage =
  mongoose.models.ProduitImage || mongoose.model('ProduitImage', produitImageSchema);

const commentaireSchema = new mongoose.Schema(
  {
    idCommentaire: { type: Number, unique: true, index: true },
    note: { type: Number, min: 0, max: 5 },
    titre: String,
    contenu: String,
    date: { type: Date, default: Date.now },
    idClient: { type: Number, index: true },
    idProd: { type: Number, index: true },
    images: { type: [String], default: [] }
  },
  { collection: 'commentaire' }
);
const Commentaire = mongoose.models.Commentaire || mongoose.model('Commentaire', commentaireSchema);

const demandeVendeurSchema = new mongoose.Schema(
  {
    idDemande: { type: Number, unique: true, index: true },
    idClient: { type: Number, index: true },
    contactTel: String,
    contenu: String,
    date: { type: Date, default: Date.now },
    statut: { type: String, default: 'en_attente' },
    commentaireAdmin: String
  },
  { collection: 'demande_vendeur' }
);
const DemandeVendeur =
  mongoose.models.DemandeVendeur || mongoose.model('DemandeVendeur', demandeVendeurSchema);

const stockSchema = new mongoose.Schema(
  {
    idStock: { type: Number, unique: true, index: true },
    adresse: { type: String, required: true }
  },
  { collection: 'stock' }
);
const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);

const stockerSchema = new mongoose.Schema(
  {
    idStock: { type: Number, index: true },
    idProd: { type: Number, index: true },
    qte: Number,
    unite: String
  },
  { collection: 'stocker' }
);
stockerSchema.index({ idStock: 1, idProd: 1 }, { unique: true });
const Stocker = mongoose.models.Stocker || mongoose.model('Stocker', stockerSchema);

const produitVueSchema = new mongoose.Schema(
  {
    idVue: { type: Number, unique: true, index: true },
    idProd: { type: Number, index: true },
    date: { type: Date, default: Date.now }
  },
  { collection: 'produit_vue' }
);
const ProduitVue = mongoose.models.ProduitVue || mongoose.model('ProduitVue', produitVueSchema);

const paiementSchema = new mongoose.Schema(
  {
    idPaiement: { type: Number, unique: true, index: true },
    idCommande: { type: Number, unique: true, sparse: true, index: true },
    statut: { type: String, enum: ['en_attente', 'valide', 'refuse'], default: 'en_attente' },
    date: Date,
    somme: Number,
    methode: String
  },
  { collection: 'paiement' }
);
const Paiement = mongoose.models.Paiement || mongoose.model('Paiement', paiementSchema);

const notificationSchema = new mongoose.Schema(
  {
    idNotification: { type: Number, unique: true, index: true },
    idUtilisateur: { type: Number, index: true, required: true },
    type: { type: String, default: 'commande' },
    titre: { type: String, required: true },
    message: { type: String, required: true },
    lu: { type: Boolean, default: false },
    idCommande: { type: Number, index: true },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: 'notification' }
);
notificationSchema.index({ idUtilisateur: 1, createdAt: -1 });
const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = {
  mongoose,
  Counter,
  nextId,
  Utilisateur,
  Categorie,
  Produit,
  Panier,
  Contient,
  Commande,
  CommandeProduit,
  ProduitFavori,
  ProduitImage,
  Commentaire,
  DemandeVendeur,
  Stock,
  Stocker,
  ProduitVue,
  Paiement,
  Notification
};
