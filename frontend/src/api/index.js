import { del, get, patch, post, put } from './http'

export async function login(body) {
  return post('/auth/login', body)
}

export async function register(body) {
  return post('/auth/register', body)
}

export async function fetchProduits(params) {
  return get('/produits', params)
}

export async function fetchProduit(id) {
  return get(`/produits/${id}`)
}

export async function createProduit(body) {
  return post('/produits', body)
}

export async function updateProduit(id, body) {
  return put(`/produits/${id}`, body)
}

export async function deleteProduit(id) {
  return del(`/produits/${id}`)
}

export async function fetchCategories() {
  return get('/categories', { limit: 100, page: 1 })
}

export async function fetchCategorie(id) {
  return get(`/categories/${id}`)
}

export async function fetchProduitImages(idProd) {
  return get('/produits/images', { idProd, limit: 20, page: 1 })
}

export async function listPaniers(params) {
  return get('/paniers', params)
}

export async function createPanier(body) {
  return post('/paniers', body)
}

export async function getPanier(id) {
  return get(`/paniers/${id}`)
}

export async function updatePanier(id, body) {
  return put(`/paniers/${id}`, body)
}

export async function addContient(body) {
  return post('/contients', body)
}

export async function updateContient(idPanier, idProd, body) {
  return put(`/contients/${idPanier}/${idProd}`, body)
}

export async function removeContient(idPanier, idProd) {
  return del(`/contients/${idPanier}/${idProd}`)
}

export async function listFavoris(params) {
  return get('/produits-favoris', params)
}

export async function addFavori(body) {
  return post('/produits-favoris', body)
}

export async function removeFavori(idClient, idProd) {
  return del(`/produits-favoris/${idClient}/${idProd}`)
}

export async function listCommandes(params) {
  return get('/commandes', params)
}

export async function createCommande(body) {
  return post('/commandes', body)
}

export async function updateCommande(id, body) {
  return put(`/commandes/${id}`, body)
}

export async function addCommandeProduit(body) {
  return post('/commandes-produits', body)
}

export async function createPaiement(body) {
  return post('/paiements', body)
}

export async function createDemandeVendeur(body) {
  return post('/demandes-vendeurs', body)
}

export async function listDemandesVendeur(params) {
  return get('/demandes-vendeurs', params)
}

export async function acceptDemande(id, commentaireAdmin) {
  return put(`/demandes-vendeurs/${id}/accept`, { commentaireAdmin })
}

export async function rejectDemande(id, commentaireAdmin) {
  return put(`/demandes-vendeurs/${id}/reject`, { commentaireAdmin })
}

export async function listUtilisateurs(params) {
  return get('/utilisateurs', params)
}

export async function getUtilisateur(id) {
  return get(`/utilisateurs/${id}`)
}

export async function updateUtilisateur(id, body) {
  return put(`/utilisateurs/${id}`, body)
}

export async function listStocks(params) {
  return get('/stocks', params)
}

export async function createStock(body) {
  return post('/stocks', body)
}

export async function listCommentaires(idProduit) {
  return get('/commentaires', {
    idProduit,
    limit: 20,
    page: 1,
  })
}

export async function createCommentaire(body) {
  return post('/commentaires', body)
}

export async function createProduitImage(body) {
  return post('/produits/images', body)
}

export async function listNotifications(params) {
  return get('/notifications', params)
}

export async function getUnreadNotificationCount() {
  return get('/notifications/unread-count')
}

export async function markNotificationRead(id) {
  return patch(`/notifications/${id}`, { lu: true })
}

export async function markAllNotificationsRead() {
  return patch('/notifications/read-all', {})
}

export async function fetchVendeurPredictionsVentes(params) {
  return get('/vendeur/analytics/predictions-ventes', params)
}
