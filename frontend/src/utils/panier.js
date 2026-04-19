import { createPanier, listPaniers } from '../api'

export async function getOrCreateActivePanier(idClient) {
  const res = await listPaniers({ idClient, statut: 'actif', page: 1, limit: 1 })
  const first = res.data[0]
  if (first?.idPanier) return first.idPanier
  const created = await createPanier({ idClient, statut: 'actif' })
  return created.idPanier
}
