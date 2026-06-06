import { useState } from "react";
import { MerchandiseItem, User } from "../types";
import { ShoppingBag, ShoppingCart, Trash2, X, Plus, AlertTriangle, Box, Package, Terminal } from "lucide-react";

interface MerchandiseStoreProps {
  merch: MerchandiseItem[];
  user: User | null;
  onRefreshFinance: () => void;
  onTriggerCheckout: (type: "ticket" | "merchandise", itemId: string, amount: number, itemName: string) => void;
  onOpenCreateModal?: () => void;
}

export default function MerchandiseStore({
  merch,
  user,
  onRefreshFinance,
  onTriggerCheckout,
  onOpenCreateModal,
}: MerchandiseStoreProps) {
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutWarning, setCheckoutWarning] = useState<string | null>(null);

  const handleCheckoutItem = (item: MerchandiseItem) => {
    if (!user) {
      setCheckoutWarning("Please authenticate to purchase official summit merchandise.");
      setTimeout(() => setCheckoutWarning(null), 5000);
      return;
    }

    if (item.stock < 1) {
      setCheckoutWarning(`Apologies, the item "${item.name}" is completely sold out! Live inventory gates prevent overselling.`);
      setTimeout(() => setCheckoutWarning(null), 5000);
      return;
    }

  
    onTriggerCheckout("merchandise", item.id, item.price, item.name);
  };

  return (
    <div className="flex flex-col gap-6" id="merchandise-shop-portal">
     
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyber-border/40 pb-5 gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider font-display text-slate-400 flex items-center gap-1.5 font-mono">
            <Terminal className="w-4 h-4 text-cyan-400" /> APEX INVENTORY POOL
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-1 leading-relaxed">
            E-Cell souvenir store. Real-time depletion guards defend stocks under transactional traffic intervals.
          </p>
        </div>

        {user && (user.role === "superadmin") && onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyber-purple/90 hover:from-cyan-400 hover:to-cyber-purple text-cyber-black text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-cyan-950/20"
            id="btn-add-merchandise"
          >
            <Plus className="w-4 h-4 text-cyber-black stroke-[3px]" />
            CREATE SOUVENIR STOCK
          </button>
        )}
      </div>

      {checkoutWarning && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/15 text-rose-400 font-mono text-[11px] flex gap-3 items-center shadow-xl animate-shake" id="merch-warning-toast">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 animate-bounce" />
          <div className="font-sans">
            <strong className="font-display font-medium block">TRANSACTION DEVIATED</strong>
            <span>{checkoutWarning}</span>
          </div>
        </div>
      )}

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="merchandise-items-grid">
        {merch.length === 0 ? (
          <div className="col-span-full text-center py-16 rounded-2xl border border-dashed border-cyber-border/60 bg-cyber-card/10 text-slate-500 text-xs font-mono">
            Souvenir catalogs are presently empty. Superadmin action requested to stock items.
          </div>
        ) : (
          merch.map((item) => {
            const isSoldOut = item.stock <= 0;
            const stockProgress = Math.max(0, (item.stock / item.initialStock) * 100);

            return (
              <div
                key={item.id}
                className="relative flex flex-col justify-between border border-cyber-border bg-cyber-card/30 rounded-2xl overflow-hidden group transition-all duration-300 hover:border-cyan-500/40 hover:bg-cyber-card/55 shadow-md hover:cyber-glow-teal"
                id={`merch-item-${item.id}`}
              >
                
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden border-b border-cyber-border">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-cyber-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 p-4 z-10 selection:bg-rose-500">
                      <Package className="w-7 h-7 text-rose-400 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-widest font-mono text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded uppercase">
                        SOLD OUT OVER ALLOCATIONS
                      </span>
                    </div>
                  )}

                 
                  {!isSoldOut && (
                    <span className={`absolute top-3 left-3 text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${
                      item.stock <= 5
                        ? "bg-rose-950/40 text-rose-400 border-rose-500/30 animate-pulse"
                        : "bg-cyan-950/40 text-cyan-400 border-cyan-500/30"
                    }`}>
                      {item.stock <= 5 ? `ONLY ${item.stock} LEFT` : `${item.stock} IN STOCK`}
                    </span>
                  )}
                </div>

                
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100 font-display line-clamp-2">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono leading-relaxed line-clamp-3">{item.description}</p>
                  </div>

                 
                  {!isSoldOut && (
                    <div className="mt-1 flex flex-col gap-1.5">
                      <div className="flex justify-between text-[8px] font-mono text-slate-500">
                        <span>LIVE STOCK RESERVES</span>
                        <span>{item.stock} / {item.initialStock} Units</span>
                      </div>
                      <div className="w-full bg-cyber-border h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.stock <= 5 ? "bg-rose-500" : "bg-gradient-to-r from-teal-500 to-cyan-400"
                          }`}
                          style={{ width: `${stockProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-cyber-border/40">
                    <span className="text-sm font-bold text-slate-100 font-mono">${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleCheckoutItem(item)}
                      disabled={isSoldOut}
                      className={`px-3 py-2 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all font-display duration-300 flex items-center gap-1.5 cursor-pointer ${
                        isSoldOut
                          ? "bg-cyber-border text-slate-500 border border-cyber-border cursor-not-allowed"
                          : "bg-cyan-500 text-cyber-black hover:bg-cyan-400 shadow-md"
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isSoldOut ? "RESERVES OUT" : "PURCHASE"}
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
