"use client";

import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { ChevronRight, Minus, Plus, Trash2, ArrowRight, Heart, Check, CheckSquare, Square } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, toggleItemSelection, selectAllItems } = useAppStore();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, wishlistIds } = useWishlist();

  const selectedItems = cart.filter((item) => item.selected !== false);
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;
  const subtotal = selectedItems.reduce((total, item) => total + (Number(item.price) || 0) * (Math.min(99, Math.max(1, parseInt(String(item.quantity), 10) || 1))), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-32 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-serif tracking-tight mb-6 text-foreground">Your Cart</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-12">There is nothing here yet.</p>
        <Link
          href="/all"
          className="inline-flex items-center gap-4 px-10 py-5 font-mono text-[11px] uppercase tracking-[0.2em] text-background bg-foreground hover:bg-accent transition-colors rounded-xl shadow-sm"
        >
          Explore Collection
          <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  const handleMoveToWishlist = (item: any) => {
    if (!wishlistIds.includes(item.productId)) {
      toggleWishlist(item.productId);
    }
    removeFromCart(item.productId, item.selectedVariant?.name);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-32 border-t border-border">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6">

        <div className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider text-muted-foreground mb-8 font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-bold">Cart</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif tracking-tight text-foreground">Shopping Cart</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2">
              Select items you wish to purchase now ({selectedItems.length} of {cart.length} selected)
            </p>
          </div>

          {/* Select All Action Button */}
          <button
            type="button"
            onClick={() => selectAllItems(!allSelected)}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold uppercase tracking-wider text-foreground transition-colors cursor-pointer self-start sm:self-auto"
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${allSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background'}`}>
              {allSelected && <Check size={12} strokeWidth={3} />}
            </div>
            <span>{allSelected ? "Deselect All" : "Select All Items"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {cart.map((item) => {
              const isSelected = item.selected !== false;
              return (
                <div 
                  key={`${item.productId}-${item.selectedVariant?.name || 'base'}`} 
                  className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-border group transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60 bg-muted/20 rounded-2xl px-3 my-2'}`}
                >
                  <div className="md:col-span-6 flex gap-4 sm:gap-6 items-center">
                    {/* Item Selection Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleItemSelection(item.productId, item.selectedVariant?.name)}
                      className="cursor-pointer shrink-0 p-1 group/chk"
                      aria-label={isSelected ? "Unselect item" : "Select item for checkout"}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isSelected ? 'bg-primary border-primary text-primary-foreground shadow-2xs' : 'border-border bg-background hover:border-primary/60'}`}>
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </button>

                    <div className="w-20 h-28 sm:w-24 sm:h-32 bg-muted relative shrink-0 border border-border rounded-xl overflow-hidden shadow-2xs">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          decoding="async"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase">No Image</div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.slug}`} className="text-lg sm:text-xl font-serif hover:text-accent transition-colors font-bold text-foreground block truncate">
                        {item.name}
                      </Link>
                      {item.selectedVariant && (
                        <div className="mt-1">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border/40 inline-block">
                            {item.selectedVariant.name}
                          </span>
                        </div>
                      )}
                      <p className="text-foreground mt-2 font-price text-sm font-bold uppercase tracking-wider">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex justify-start md:justify-center items-center">
                    <div className="flex items-center border border-border bg-background rounded-lg overflow-hidden shrink-0 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, (parseInt(String(item.quantity), 10) || 1) - 1), item.selectedVariant?.name)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            updateQuantity(item.productId, Math.min(99, Math.max(1, val)), item.selectedVariant?.name);
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val < 1) {
                            updateQuantity(item.productId, 1, item.selectedVariant?.name);
                          } else if (val > 99) {
                            updateQuantity(item.productId, 99, item.selectedVariant?.name);
                          }
                        }}
                        className="w-12 text-center font-mono text-xs font-bold text-foreground bg-transparent border-x border-border py-1.5 focus:outline-none focus:bg-muted/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Quantity"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, Math.min(99, (parseInt(String(item.quantity), 10) || 1) + 1), item.selectedVariant?.name)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex justify-between md:justify-end items-center gap-4">
                    <span className="md:hidden font-mono uppercase tracking-widest text-[10px] text-muted-foreground">Total</span>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-base sm:text-lg font-price font-bold text-foreground">
                        {formatPrice((item.price || 0) * (Math.min(99, Math.max(1, parseInt(String(item.quantity), 10) || 1))))}
                      </span>
                      
                      {/* Move to Wishlist */}
                      <button
                        type="button"
                        onClick={() => handleMoveToWishlist(item)}
                        className="text-muted-foreground hover:text-accent transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-muted/60"
                        title="Save to Wishlist & Remove from Cart"
                        aria-label="Save to Wishlist"
                      >
                        <Heart size={16} strokeWidth={1.5} className={wishlistIds.includes(item.productId) ? "fill-accent text-accent" : ""} />
                      </button>

                      {/* Remove item */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.selectedVariant?.name)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-muted/60"
                        title="Remove from Cart"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4">
            <div className="p-6 sm:p-8 border border-border bg-card sticky top-32 rounded-3xl shadow-md">
              <h2 className="text-base font-bold uppercase tracking-wider mb-6 border-b border-border pb-4 text-foreground">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs md:text-sm font-medium">
                  <span className="uppercase tracking-wider text-muted-foreground">
                    Selected Items ({selectedItems.length})
                  </span>
                  <span className="font-price font-bold text-sm uppercase tracking-wider text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm font-medium">
                  <span className="uppercase tracking-wider text-muted-foreground">Shipping</span>
                  <span className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground font-semibold">Calculated at Checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-border pt-6 mb-8">
                <div>
                  <span className="uppercase tracking-wider text-xs md:text-sm font-bold text-foreground block">Estimated Total</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Tax included</span>
                </div>
                <span className="text-3xl font-price font-bold text-foreground">{formatPrice(subtotal)}</span>
              </div>

              {selectedItems.length > 0 ? (
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-4 px-8 py-5 font-mono text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-background bg-foreground hover:bg-accent transition-colors rounded-2xl shadow-lg hover:shadow-xl"
                >
                  Checkout Selected ({selectedItems.length})
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>
              ) : (
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-5 font-mono text-xs font-bold uppercase tracking-[0.2em] bg-muted text-muted-foreground rounded-2xl cursor-not-allowed opacity-70"
                  >
                    Select items to checkout
                  </button>
                  <p className="text-center text-[11px] text-amber-500 font-mono">Please select at least 1 item to proceed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

