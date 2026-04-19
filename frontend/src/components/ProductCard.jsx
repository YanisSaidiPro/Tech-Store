import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatMoneyDA } from '../utils/format'

export function ProductCard({
  produit,
  badge,
  imageUrl,
  onToggleFavorite,
  favoriteActive,
  onAddToCart,
}) {
  const cat = produit.Categorie?.nomCat ?? 'TECH'
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#111827] shadow-lg shadow-black/30 transition hover:border-[#00d154]/30">
      <div className="relative aspect-[4/3] bg-[#1a2332]">
        {badge ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#3b82f6] px-2.5 py-0.5 text-xs font-semibold text-white">
            {badge}
          </span>
        ) : null}
        {onToggleFavorite ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite()
            }}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Favoris"
          >
            <Heart
              className={`h-5 w-5 ${favoriteActive ? 'fill-red-500 text-red-500' : ''}`}
              strokeWidth={1.8}
            />
          </button>
        ) : null}
        <Link to={`/produit/${produit.idProd}`} className="block h-full w-full">
          <img
            src={
              imageUrl ||
              `https://placehold.co/480x360/1e293b/94a3b8?text=${encodeURIComponent(produit.nomProd.slice(0, 16))}`
            }
            alt=""
            className="h-full w-full object-contain p-4 transition group-hover:scale-[1.02]"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{cat}</p>
        <Link to={`/produit/${produit.idProd}`} className="font-semibold text-slate-100 hover:text-[#00d154]">
          {produit.nomProd}
        </Link>
        <div className="flex items-center gap-1 text-sm text-slate-400">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>4.8</span>
          <span className="text-slate-500">(—)</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-lg font-bold text-white">{formatMoneyDA(produit.prix)}</p>
          </div>
          {onAddToCart ? (
            <button
              type="button"
              onClick={onAddToCart}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0c4a6e] text-white transition hover:bg-[#0369a1]"
              aria-label="Ajouter au panier"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
