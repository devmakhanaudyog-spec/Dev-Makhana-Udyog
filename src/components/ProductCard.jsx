import React from 'react';
import { Package } from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function ProductCard({ product, onOpenDetails, viewMode = 'grid' }) {
  const displayImage = product.image || product.mainImage || (product.images && product.images[0]);

  // List View
  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-xl shadow-md border border-green-50 p-4 flex gap-4 transition hover:shadow-lg cursor-pointer"
        onClick={() => onOpenDetails(product)}
      >
        {/* Image */}
        {displayImage && (
          <div className="flex-shrink-0">
            <div className="w-28 h-28 rounded-lg bg-green-50 overflow-hidden">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-grow flex flex-col justify-between py-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand font-semibold text-xs">
              <Package size={14} /> {product.grade}
            </div>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{product.name}</h3>
            <p className="text-xs text-slate-600 line-clamp-1">{product.description}</p>
          </div>

          {/* Pricing & Stock */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-green-100">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base font-bold text-brand">
                {typeof product.price === 'number' ? formatINR(product.price, { maximumFractionDigits: 0 }) : '-'}
              </span>
              {typeof product.originalPrice === 'number' && (
                <span className="text-xs text-gray-400 line-through">
                  {formatINR(product.originalPrice, { maximumFractionDigits: 0 })}
                </span>
              )}
              {product.discount && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">{product.discount}% OFF</span>}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-xs shadow hover:from-green-700 hover:to-emerald-700 transition-all"
              onClick={(e) => { e.stopPropagation(); onOpenDetails(product); }}
            >
              View → 
            </button>
          </div>

          <div className="flex gap-3 text-xs text-slate-600 mt-1">
            <span>MOQ: <span className="font-semibold">{product.moq || '-'}</span></span>
            <span className={`font-semibold ${typeof product.stock === 'number' ? (product.stock === 0 ? 'text-red-600' : 'text-green-600') : 'text-slate-500'}`}>
              Stock: {typeof product.stock === 'number' ? product.stock : '-'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div
      className="text-left bg-white rounded-2xl shadow-brand border border-green-50 p-6 flex flex-col gap-3 transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      onClick={() => onOpenDetails(product)}
    >
      {displayImage && (
        <div className="w-full h-56 rounded-xl bg-green-50 overflow-hidden">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm"><Package size={18} /> {product.grade}</div>
        <h3 className="text-2xl font-bold text-slate-900">{product.name}</h3>
        <p className="text-slate-700 text-sm leading-relaxed">{product.description}</p>
        <div className="flex items-baseline gap-2 text-slate-900">
          <span className="text-xl font-bold text-brand">
            {typeof product.price === 'number' ? formatINR(product.price, { maximumFractionDigits: 0 }) : '-'}
          </span>
          {typeof product.originalPrice === 'number' ? (
            <span className="text-sm text-gray-400 line-through">
              {formatINR(product.originalPrice, { maximumFractionDigits: 0 })}
            </span>
          ) : null}
          {product.discount ? <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">{product.discount}% OFF</span> : null}
        </div>
        <div className="flex items-center justify-between text-sm text-slate-700">
          <span className="flex items-center gap-2">
            <span>MOQ: <span className="font-semibold">{product.moq || '-'}</span></span>
            <span
              className={`text-xs font-semibold ${
                typeof product.stock === 'number'
                  ? (product.stock === 0 ? 'text-red-600' : 'text-green-600')
                  : 'text-slate-500'
              }`}
            >
              | Stock: {typeof product.stock === 'number' ? product.stock : '-'}
            </span>
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow hover:from-green-700 hover:to-emerald-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-300"
            onClick={(e) => { e.stopPropagation(); onOpenDetails(product); }}
          >
            View Details <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
