const { Commande } = require('../models');
const paiementService = require('../services/paiementService');
const AppError = require('../middleware/AppError');
const { parseNumber, parseId, parseDate } = require('../utils/validators');

async function assertClientOwnsCommande(req, idCommande) {
  if (idCommande == null) {
    throw new AppError('idCommande est requis', 400);
  }
  const cmd = await Commande.findOne({ idCommande }).select('idClient idCommande').lean();
  if (!cmd) {
    throw new AppError('Commande non trouvée', 404);
  }
  if (req.user.role === 'admin') {
    return cmd;
  }
  if (req.user.role === 'client' && cmd.idClient === req.user.idUtilisateur) {
    return cmd;
  }
  throw new AppError('Accès refusé.', 403);
}

async function assertClientOwnsPaiement(req, idPaiement) {
  const paiement = await paiementService.getPaiementById(idPaiement);
  await assertClientOwnsCommande(req, paiement.idCommande);
  return paiement;
}

exports.creerPaiement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      throw new AppError('Accès refusé.', 403);
    }
    const idCommande = parseId(req.body.idCommande);
    if (idCommande === null) {
      throw new AppError('idCommande invalide', 400);
    }
    await assertClientOwnsCommande(req, idCommande);
    const body = { ...req.body, idCommande };
    const paiement = await paiementService.createPaiement(body);
    res.status(201).json(paiement);
  } catch (err) {
    next(err);
  }
};

exports.listerPaiements = async (req, res, next) => {
  try {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 10);

    let idCommande = req.query.idCommande;
    let idCommandesIn;

    if (req.user.role === 'client') {
      const cmds = await Commande.find({ idClient: req.user.idUtilisateur }).select('idCommande').lean();
      idCommandesIn = cmds.map((c) => c.idCommande);
      if (idCommande != null && idCommande !== '') {
        const cid = parseId(idCommande);
        if (cid === null || !idCommandesIn.includes(cid)) {
          throw new AppError('Accès refusé.', 403);
        }
        idCommande = cid;
        idCommandesIn = undefined;
      }
    } else if (req.user.role !== 'admin') {
      throw new AppError('Accès refusé.', 403);
    }

    const result = await paiementService.getPaiements({
      page,
      limit,
      search: req.query.search,
      idCommande: idCommandesIn ? undefined : idCommande,
      idCommandesIn,
      statut: req.query.statut,
      minSomme: req.query.minSomme,
      maxSomme: req.query.maxSomme
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPaiement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      throw new AppError('Accès refusé.', 403);
    }
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    const paiement = await assertClientOwnsPaiement(req, id);
    res.json(paiement);
  } catch (err) {
    next(err);
  }
};

exports.modifierPaiement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      throw new AppError('Accès refusé.', 403);
    }
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    await assertClientOwnsPaiement(req, id);

    const payload = { ...req.body };
    if (payload.date !== undefined) {
      payload.date = parseDate(payload.date);
      if (payload.date === null) {
        throw new AppError('Date invalide', 400);
      }
    }
    if (payload.idCommande !== undefined) {
      const cid = parseId(payload.idCommande);
      if (cid === null) {
        throw new AppError('idCommande invalide', 400);
      }
      await assertClientOwnsCommande(req, cid);
      payload.idCommande = cid;
    }

    const paiement = await paiementService.updatePaiement(id, payload);
    res.json(paiement);
  } catch (err) {
    next(err);
  }
};

exports.supprimerPaiement = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      throw new AppError('Accès refusé.', 403);
    }
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError('ID invalide', 400);
    }

    await assertClientOwnsPaiement(req, id);
    const result = await paiementService.deletePaiement(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
