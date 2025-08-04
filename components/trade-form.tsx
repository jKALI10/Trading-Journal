"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Trade {
  date: string
  symbol: string
  direction: "long" | "short"
  positionSize: number
  notes: string
  tags: string[]
  outcome: "win" | "loss"
  pnl: number
}

interface TradeFormProps {
  onSubmit: (trade: Trade) => void
  initialData?: Trade & { id: number }
  isEditing?: boolean
}

const SYMBOLS = [
  { value: "EUR/USD", label: "EUR/USD" },
  { value: "USD/JPY", label: "USD/JPY" },
  { value: "GOLD", label: "GOLD" },
  { value: "OTHER", label: "Other (Manual Entry)" },
]

export function TradeForm({ onSubmit, initialData, isEditing = false }: TradeFormProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    symbol: initialData?.symbol || "",
    direction: initialData?.direction || "",
    positionSize: initialData?.positionSize?.toString() || "",
    notes: initialData?.notes || "",
    tags: initialData?.tags || [],
    outcome: initialData?.outcome || "",
    pnl: initialData?.pnl?.toString() || "",
  })

  const [newTag, setNewTag] = useState("")
  const [customSymbol, setCustomSymbol] = useState(
    initialData?.symbol && !SYMBOLS.some((s) => s.value === initialData.symbol) ? initialData.symbol : "",
  )
  const [showCustomInput, setShowCustomInput] = useState(
    initialData?.symbol ? !SYMBOLS.some((s) => s.value === initialData.symbol) : false,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      direction: formData.direction as "long" | "short",
      positionSize: Number.parseInt(formData.positionSize),
      outcome: formData.outcome as "win" | "loss",
      pnl: Number.parseFloat(formData.pnl),
    })

    if (!isEditing) {
      // Reset form only if not editing
      setFormData({
        date: new Date().toISOString().split("T")[0],
        symbol: "",
        direction: "",
        positionSize: "",
        notes: "",
        tags: [],
        outcome: "",
        pnl: "",
      })
      setCustomSymbol("")
      setShowCustomInput(false)
    }
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Trade" : "Add New Trade"}</CardTitle>
          <CardDescription>Record your trade details for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Select
                  value={formData.symbol === "OTHER" ? "OTHER" : formData.symbol}
                  onValueChange={(value) => {
                    if (value === "OTHER") {
                      setShowCustomInput(true)
                      setFormData({ ...formData, symbol: "OTHER" })
                    } else {
                      setShowCustomInput(false)
                      setCustomSymbol("")
                      setFormData({ ...formData, symbol: value })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYMBOLS.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value}>
                        {symbol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {showCustomInput && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter symbol (e.g., GBP/USD, BTC/USD, AAPL)"
                      value={customSymbol}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase()
                        setCustomSymbol(value)
                        setFormData({ ...formData, symbol: value })
                      }}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value) => setFormData({ ...formData, direction: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="positionSize">Position Size</Label>
                <Input
                  id="positionSize"
                  type="number"
                  placeholder="100"
                  value={formData.positionSize}
                  onChange={(e) => setFormData({ ...formData, positionSize: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select
                  value={formData.outcome}
                  onValueChange={(value) => setFormData({ ...formData, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pnl">P&L Amount</Label>
                <Input
                  id="pnl"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.pnl}
                  onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Strategy used, market conditions, reasoning..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              {isEditing ? "Update Trade" : "Add Trade"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
