const {
  Notification,
  Commande,
  CommandeProduit,
  Produit,
  Utilisateur,
  nextId
} = require('../models');
const AppError = require('../middleware/AppError');

async function createNotification({ idUtilisateur, titre, message, type = 'commande', idCommande }) {
  const idNotification = await nextId('notification');
  return Notification.create({
    idNotification,
    idUtilisateur,
    titre: String(titre).trim(),
    message: String(message).trim(),
    type: String(type).trim(),
    idCommande: idCommande != null ? Number(idCommande) : undefined,
    lu: false
  });
}

async function notifyOrderPaid(idCommande) {
  const cmd = await Commande.findOne({ idCommande }).lean();
  if (!cmd) return;

  const lines = await CommandeProduit.find({ idCommande }).lean();
  const vendeurIds = new Set();
  for (const line of lines) {
    const p = await Produit.findOne({ idProd: line.idProd }).select('idVendeur').lean();
    if (p?.idVendeur != null) vendeurIds.add(p.idVendeur);
  }

  const admins = await Utilisateur.find({ role: 'admin' }).select('idUtilisateur').lean();

  const tasks = [];

  tasks.push(
    createNotification({
      idUtilisateur: cmd.idClient,
      titre: 'Commande confirmée',
      message: `Votre commande n°${idCommande} a été enregistrée et le paiement est validé.`,
      idCommande
    })
  );

  for (const idV of vendeurIds) {
    tasks.push(
      createNotification({
        idUtilisateur: idV,
        titre: 'Nouvelle commande',
        message: `La commande n°${idCommande} contient au moins un de vos produits.`,
        idCommande
      })
    );
  }

  for (const a of admins) {
    tasks.push(
      createNotification({
        idUtilisateur: a.idUtilisateur,
        titre: 'Nouvelle commande',
        message: `Commande n°${idCommande} — client #${cmd.idClient}.`,
        idCommande
      })
    );
  }

  await Promise.all(tasks);
}

function serialize(n) {
  const raw = n.toObject ? n.toObject() : { ...n };
  delete raw.__v;
  delete raw._id;
  return raw;
}

const NotificationService = {
  createNotification,
  notifyOrderPaid,

  async listForUser(idUtilisateur, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const pageNumber = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
    const limitNumber = Number.isInteger(Number(limit)) && Number(limit) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNumber - 1) * limitNumber;
    const filter = { idUtilisateur };
    if (unreadOnly) filter.lu = false;

    const total = await Notification.countDocuments(filter);
    const rows = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limitNumber)
      .lean();

    return {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      data: rows.map((r) => serialize(r))
    };
  },

  async unreadCount(idUtilisateur) {
    const n = await Notification.countDocuments({ idUtilisateur, lu: false });
    return { count: n };
  },

  async markRead(idUtilisateur, idNotification) {
    const n = await Notification.findOne({ idNotification, idUtilisateur });
    if (!n) {
      throw new AppError('Notification introuvable', 404);
    }
    n.lu = true;
    await n.save();
    return serialize(n);
  },

  async markAllRead(idUtilisateur) {
    await Notification.updateMany({ idUtilisateur, lu: false }, { $set: { lu: true } });
    return { message: 'Toutes les notifications sont marquées comme lues.' };
  }
};

module.exports = NotificationService;
