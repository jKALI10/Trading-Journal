"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface TradeImageViewerProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  tradeName?: string;
}

export function TradeImageViewer({
  images,
  isOpen,
  onClose,
  tradeName,
}: TradeImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(100);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(100);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex-1">
              {tradeName || "Trade Screenshots"} ({currentIndex + 1} /{" "}
              {images.length})
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription>
            View and zoom through your trade screenshots
          </DialogDescription>
        </DialogHeader>
        <div className="relative flex items-center justify-center bg-muted/30 min-h-[60vh] overflow-auto p-4">
          <img
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`Screenshot ${currentIndex + 1}`}
            className="max-w-full h-auto rounded shadow-lg transition-transform"
            style={{ transform: `scale(${zoom / 100})`, maxHeight: "70vh" }}
          />
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto py-2 flex-1">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(100);
                  }}
                  className={`flex-shrink-0 rounded transition-all ${
                    index === currentIndex
                      ? "ring-2 ring-primary scale-105"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
