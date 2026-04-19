const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const vendeurRoutes = require('./routes/vendeurRoutes');
const categorieRoutes = require('./routes/categorieRoutes');
const produitRoutes = require('./routes/produitRoutes');
const produitImageRoutes = require('./routes/produitImageRoutes');
const produitVueRoutes = require('./routes/produitVueRoutes');
const produitFavoriRoutes = require('./routes/produitFavoriRoutes');
const panierRoutes = require('./routes/panierRoutes');
const contientRoutes = require('./routes/contientRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const commandeProduitRoutes = require('./routes/commandeProduitRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const commentaireRoutes = require('./routes/commentaireRoutes');
const demandeVendeurRoutes = require('./routes/demandeVendeurRoutes');
const stockRoutes = require('./routes/stockRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const vendeurAnalyticsRoutes = require('./routes/vendeurAnalyticsRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vendeurs', vendeurRoutes);
app.use('/api/categories', categorieRoutes);
// Monter /produits/images avant /produits, sinon "images" est capturé par GET /:id
app.use('/api/produits/images', produitImageRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/produits-vues', produitVueRoutes);
app.use('/api/produits-favoris', produitFavoriRoutes);
app.use('/api/paniers', panierRoutes);
app.use('/api/contients', contientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/commandes-produits', commandeProduitRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/commentaires', commentaireRoutes);
app.use('/api/demandes-vendeurs', demandeVendeurRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vendeur/analytics', vendeurAnalyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.originalUrl} introuvable` });
});

app.use(errorHandler);

module.exports = app;