"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Tag,
  FileText,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { TradeImageViewer } from "./trade-image-viewer";

interface Trade {
  id: number;
  date: string;
  symbol: string;
  direction: "long" | "short";
  positionSize: number;
  notes: string;
  tags: string[];
  outcome: "win" | "loss";
  pnl: number;
  images?: string[];
}

interface TradeDetailsModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TradeDetailsModal({
  trade,
  isOpen,
  onClose,
}: TradeDetailsModalProps) {
  const [showImageViewer, setShowImageViewer] = useState(false);

  if (!trade) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <span>{trade.symbol}</span>
              <Badge
                variant={trade.outcome === "win" ? "default" : "destructive"}
                className="text-sm"
              >
                {trade.outcome.toUpperCase()}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* P&L Section */}
            <div
              className={`p-6 rounded-lg ${
                trade.outcome === "win"
                  ? "bg-green-50 dark:bg-green-950/30"
                  : "bg-red-50 dark:bg-red-950/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`h-6 w-6 ${
                      trade.outcome === "win"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    Profit & Loss
                  </span>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    trade.outcome === "win" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trade.outcome === "win" ? "+" : "-"}$
                  {Math.abs(trade.pnl).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Trade Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
                <p className="text-lg font-medium">{trade.date}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {trade.direction === "long" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>Direction</span>
                </div>
                <Badge
                  variant={trade.direction === "long" ? "default" : "secondary"}
                  className="text-base"
                >
                  {trade.direction.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>Position Size</span>
                </div>
                <p className="text-lg font-medium">{trade.positionSize}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {trade.tags.length > 0 ? (
                    trade.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No tags
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes Section */}
            {trade.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{trade.notes}</p>
                </div>
              </div>
            )}

            {/* Images Section */}
            {trade.images && trade.images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>Trade Screenshots ({trade.images.length})</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageViewer(true)}
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {trade.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setShowImageViewer(true)}
                      className="relative group overflow-hidden rounded-lg border hover:border-primary transition-all"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Trade screenshot ${index + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {trade.images && (
        <TradeImageViewer
          images={trade.images}
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          tradeName={`${trade.symbol} - ${trade.date}`}
        />
      )}
    </>
  );
}
