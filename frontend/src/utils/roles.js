/** Comptes qui peuvent utiliser les favoris et la liste favoris (même stockage que les clients, champ idClient = id utilisateur). */
export function canUseFavorites(user) {
  return Boolean(user && ['client', 'vendeur', 'admin'].includes(user.role))
}

/** Comptes autorisés à noter / commenter un produit. */
export function canReviewProduct(user) {
  return Boolean(user && ['client', 'vendeur', 'admin'].includes(user.role))
}

export function canUseCart(user) {
  return Boolean(user && ['client', 'vendeur'].includes(user.role))
}
