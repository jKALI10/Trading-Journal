"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, Search, Edit, Trash2, Activity } from "lucide-react"
import { TradeForm } from "@/components/trade-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Trade {
  id: number
  date: string
  symbol: string
  direction: "long" | "short"
  positionSize: number
  notes: string
  tags: string[]
  outcome: "win" | "loss"
  pnl: number
}

interface TradeHistoryProps {
  trades: Trade[]
  onUpdateTrade: (trade: Trade) => void
  onDeleteTrade: (tradeId: number) => void
}

export function TradeHistory({ trades, onUpdateTrade, onDeleteTrade }: TradeHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Trade>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterDirection, setFilterDirection] = useState<string>("all")
  const [filterOutcome, setFilterOutcome] = useState<string>("all")
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch =
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDirection = filterDirection === "all" || trade.direction === filterDirection
    const matchesOutcome = filterOutcome === "all" || trade.outcome === filterOutcome

    return matchesSearch && matchesDirection && matchesOutcome
  })

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTrade = (updatedTradeData: Omit<Trade, "id">) => {
    if (editingTrade) {
      const updatedTrade = { ...updatedTradeData, id: editingTrade.id }
      onUpdateTrade(updatedTrade)
      setIsEditDialogOpen(false)
      setEditingTrade(null)
    }
  }

  if (trades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trade History</h1>
          <p className="text-muted-foreground">View and analyze all your trades</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trades recorded</h3>
            <p className="text-muted-foreground">Start by adding your first trade to see your history here</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trade History</h1>
        <p className="text-muted-foreground">View and analyze all your trades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trades</CardTitle>
          <CardDescription>Manage your trading history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterOutcome} onValueChange={setFilterOutcome}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="win">Winners</SelectItem>
                <SelectItem value="loss">Losers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("date")} className="h-auto p-0 font-semibold">
                      Date <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("symbol")} className="h-auto p-0 font-semibold">
                      Symbol <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("pnl")} className="h-auto p-0 font-semibold">
                      P&L <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{trade.date}</TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.direction === "long" ? "default" : "secondary"}>{trade.direction}</Badge>
                    </TableCell>
                    <TableCell>{trade.positionSize}</TableCell>
                    <TableCell>
                      <Badge variant={trade.outcome === "win" ? "default" : "destructive"}>{trade.outcome}</Badge>
                    </TableCell>
                    <TableCell className={trade.outcome === "win" ? "text-green-600" : "text-red-600"}>
                      {trade.outcome === "win" ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {trade.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {trade.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{trade.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditTrade(trade)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this trade? This action cannot be undone and will also
                                adjust your account balance.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteTrade(trade.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedTrades.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No trades found matching your criteria.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
            <DialogDescription>Update your trade details</DialogDescription>
          </DialogHeader>
          {editingTrade && <TradeForm onSubmit={handleUpdateTrade} initialData={editingTrade} isEditing={true} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
