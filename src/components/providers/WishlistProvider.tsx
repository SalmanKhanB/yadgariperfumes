"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { toggleWishlistAction, getWishlistAction } from "@/server/actions/wishlistActions";
import { toast } from "sonner";
import { trackMetaAddToWishlist } from "@/lib/analytics/metaPixel";

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync wishlist on mount and auth state change
  useEffect(() => {
    if (status === "loading") return;

    const isDbUser = status === "authenticated" && session?.user?.id !== "admin-1";

    if (isDbUser) {
      // Fetch from DB
      const fetchWishlist = async () => {
        setIsLoading(true);
        try {
          const res = await getWishlistAction();
          if (res.success && res.wishlist) {
            setWishlistIds(res.wishlist.map((p: any) => p._id));
            
            // Merge any local storage items into the DB wishlist
            const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
            if (localWishlist.length > 0) {
              const newIds = localWishlist.filter((id: string) => !res.wishlist.some((p: any) => p._id === id));
              for (const id of newIds) {
                await toggleWishlistAction(id);
              }
              if (newIds.length > 0) {
                const updated = await getWishlistAction();
                if (updated.success && updated.wishlist) {
                  setWishlistIds(updated.wishlist.map((p: any) => p._id));
                }
              }
              // Clear local storage after merging
              localStorage.removeItem("wishlist");
            }
          }
        } catch (error) {
          console.error("Failed to load wishlist", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWishlist();
    } else {
      // Load from local storage
      const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistIds(localWishlist);
      setIsLoading(false);
    }
  }, [status]);

  const toggleWishlist = async (productId: string) => {
    const isCurrentlyWishlisted = wishlistIds.includes(productId);
    
    // Optimistic UI update
    if (isCurrentlyWishlisted) {
      setWishlistIds(prev => prev.filter(id => id !== productId));
      toast.success("Removed from wishlist");
    } else {
      setWishlistIds(prev => [...prev, productId]);
      toast.success("Added to wishlist");
      trackMetaAddToWishlist({
        productId,
        currency: "AED",
      });
    }
    const isDbUser = status === "authenticated" && session?.user?.id !== "admin-1";

    if (isDbUser) {
      // Server action
      const res = await toggleWishlistAction(productId);
      if (!res.success) {
        // Revert on failure
        setWishlistIds(prev => isCurrentlyWishlisted ? [...prev, productId] : prev.filter(id => id !== productId));
        toast.error("Failed to update wishlist");
      }
    } else {
      // Local storage
      const newWishlist = isCurrentlyWishlisted 
        ? wishlistIds.filter(id => id !== productId)
        : [...wishlistIds, productId];
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
