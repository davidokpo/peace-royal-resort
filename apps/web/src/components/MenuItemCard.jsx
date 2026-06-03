import React, { useState, useEffect } from 'react';
import { Plus, Minus, Moon, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Clickable menu card. The card face shows the photo, name and description
 * (no price). Clicking it opens a dialog with the larger photo, price, full
 * description, a quantity selector and an "Order Now" button that adds the
 * item to the order. Shared by the Cafe and Restaurant pages.
 */
const MenuItemCard = ({
  item,
  quantity = 0,
  onConfirm,
  currency = 'N',
  imageHeightClass = 'h-44',
  accentClassName = 'bg-primary hover:bg-primary/90 text-primary-foreground',
  badgeText,
}) => {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) {
      setQty(quantity > 0 ? quantity : 1);
    }
  }, [open, quantity]);

  const handleOrder = () => {
    onConfirm?.(item, qty);
    setOpen(false);
    toast.success(`Added ${qty} × ${item.name} to your order`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/85 text-left shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className={`relative w-full overflow-hidden ${imageHeightClass}`}>
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {item.night ? (
            <div className="absolute right-3 top-3 rounded-full bg-background/85 p-2 shadow-sm">
              <Moon className="h-4 w-4 text-primary" />
            </div>
          ) : null}
          {badgeText ? (
            <div className="absolute right-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground shadow">
              {badgeText}
            </div>
          ) : null}
          {quantity > 0 ? (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow">
              {quantity} in order
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-4">
          {item.category ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {item.category}
            </p>
          ) : null}
          <h3 className="mt-0.5 font-semibold text-foreground">{item.name}</h3>
          {item.desc ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.desc}</p>
          ) : null}
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <ShoppingBag className="h-4 w-4" /> View &amp; order
          </span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          <div className="h-56 w-full overflow-hidden">
            <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
          </div>
          <div className="p-6">
            <DialogHeader className="space-y-1 text-left">
              {item.category ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {item.category}
                </p>
              ) : null}
              <DialogTitle className="text-2xl leading-tight">{item.name}</DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-2xl font-bold text-primary">
              {currency}
              {Number(item.price).toLocaleString()}
            </p>
            {item.desc ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            ) : null}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-border bg-muted px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="rounded-full p-1 hover:bg-background"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold text-foreground">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="rounded-full p-1 hover:bg-background"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </button>
              </div>
              <Button
                type="button"
                onClick={handleOrder}
                className={`h-auto flex-1 rounded-xl py-4 text-base ${accentClassName}`}
              >
                Order Now
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Adds to your order — complete checkout further down the page.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuItemCard;
