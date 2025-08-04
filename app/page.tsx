"use client"

import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarChart3, BookOpen, DollarSign, Home, PlusCircle, TrendingUp, Activity, Wallet, Settings } from "lucide-react"
import { TradeForm } from "@/components/trade-form"
import { TradeHistory } from "@/components/trade-history"
import { Analytics } from "@/components/analytics"
import { Journal } from "@/components/journal"
import { BalanceManager } from "@/components/balance-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { DataManager } from "@/components/data-manager"

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

const navigationItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Balance", icon: Wallet, id: "balance" },
  { title: "Add Trade", icon: PlusCircle, id: "add-trade" },
  { title: "Trade History", icon: Activity, id: "history" },
  { title: "Analytics", icon: BarChart3, id: "analytics" },
  { title: "Journal", icon: BookOpen, id: "journal" },
  { title: "Settings", icon: Settings, id: "settings" },
]

export default function TradingJournal() {
  const [activeView, setActiveView] = useState("dashboard")
  const [trades, setTrades] = useState<Trade[]>([])
  const [balance, setBalance] = useState(0)
  const [deposits, setDeposits] = useState<{ id: number; amount: number; date: string }[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTrades = localStorage.getItem("trading-journal-trades")
    const savedBalance = localStorage.getItem("trading-journal-balance")
    const savedDeposits = localStorage.getItem("trading-journal-deposits")

    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades))
      } catch (error) {
        console.error("Error loading trades from localStorage:", error)
      }
    }

    if (savedBalance) {
      try {
        setBalance(Number.parseFloat(savedBalance))
      } catch (error) {
        console.error("Error loading balance from localStorage:", error)
      }
    }

    if (savedDeposits) {
      try {
        setDeposits(JSON.parse(savedDeposits))
      } catch (error) {
        console.error("Error loading deposits from localStorage:", error)
      }
    }

    setIsLoaded(true)
  }, [])

  // Save trades to localStorage whenever trades change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("trading-journal-trades", JSON.stringify(trades))
    }
  }, [trades, isLoaded])

  // Save balance to localStorage whenever balance changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("trading-journal-balance", balance.toString())
    }
  }, [balance, isLoaded])

  // Save deposits to localStorage whenever deposits change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("trading-journal-deposits", JSON.stringify(deposits))
    }
  }, [deposits, isLoaded])

  // Show loading state while data is being loaded
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your trading data...</p>
        </div>
      </div>
    )
  }

  const addTrade = (newTrade: Omit<Trade, "id">) => {
    const trade: Trade = {
      ...newTrade,
      id: Date.now(), // Simple ID generation
    }
    setTrades([...trades, trade])

    // Update balance based on trade outcome
    if (trade.outcome === "win") {
      setBalance((prev) => prev + trade.pnl)
    } else {
      setBalance((prev) => prev - Math.abs(trade.pnl))
    }
  }

  const updateTrade = (updatedTrade: Trade) => {
    const oldTrade = trades.find((t) => t.id === updatedTrade.id)
    if (oldTrade) {
      // Reverse the old trade's effect on balance
      if (oldTrade.outcome === "win") {
        setBalance((prev) => prev - oldTrade.pnl)
      } else {
        setBalance((prev) => prev + Math.abs(oldTrade.pnl))
      }

      // Apply the new trade's effect on balance
      if (updatedTrade.outcome === "win") {
        setBalance((prev) => prev + updatedTrade.pnl)
      } else {
        setBalance((prev) => prev - Math.abs(updatedTrade.pnl))
      }
    }

    setTrades(trades.map((trade) => (trade.id === updatedTrade.id ? updatedTrade : trade)))
  }

  const deleteTrade = (tradeId: number) => {
    const trade = trades.find((t) => t.id === tradeId)
    if (trade) {
      // Reverse the trade's effect on balance
      if (trade.outcome === "win") {
        setBalance((prev) => prev - trade.pnl)
      } else {
        setBalance((prev) => prev + Math.abs(trade.pnl))
      }
    }
    setTrades(trades.filter((trade) => trade.id !== tradeId))
  }

  const addDeposit = (amount: number) => {
    const deposit = {
      id: Date.now(),
      amount,
      date: new Date().toISOString().split("T")[0],
    }
    setDeposits([...deposits, deposit])
    setBalance((prev) => prev + amount)
  }

  const handleImportData = (data: { trades: Trade[]; deposits: any[]; balance: number }) => {
    setTrades(data.trades)
    setDeposits(data.deposits)
    setBalance(data.balance)
  }

  const handleClearData = () => {
    // Clear all state
    setTrades([])
    setDeposits([])
    setBalance(0)

    // Clear all localStorage items
    localStorage.removeItem("trading-journal-trades")
    localStorage.removeItem("trading-journal-balance")
    localStorage.removeItem("trading-journal-deposits")
    localStorage.removeItem("trading-journal-cloud-connected")
    localStorage.removeItem("trading-journal-sync-code")
    localStorage.removeItem("trading-journal-last-sync")
    localStorage.removeItem("trading-journal-cloud-data")
    localStorage.removeItem("trading-journal-device-id")
    localStorage.removeItem("trading-journal-device-name")
    localStorage.removeItem("trading-journal-auto-sync")

    // Force a page reload to ensure clean state
    window.location.reload()
  }

  const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
  const tradingPnL = balance - totalDeposits
  const winningTrades = trades.filter((trade) => trade.outcome === "win")
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0

  const renderContent = () => {
    switch (activeView) {
      case "balance":
        return <BalanceManager balance={balance} deposits={deposits} onAddDeposit={addDeposit} />
      case "add-trade":
        return <TradeForm onSubmit={addTrade} />
      case "history":
        return <TradeHistory trades={trades} onUpdateTrade={updateTrade} onDeleteTrade={deleteTrade} />
      case "analytics":
        return <Analytics trades={trades} />
      case "journal":
        return <Journal />
      case "settings":
        return (
          <DataManager
            trades={trades}
            deposits={deposits}
            balance={balance}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        )
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Trading Dashboard</h1>
              <p className="text-muted-foreground">Track your trading performance and progress</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${balance.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Trading P&L: ${tradingPnL.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {winningTrades.length} of {trades.length} trades
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trades.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalDeposits.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{deposits.length} deposits</p>
                </CardContent>
              </Card>
            </div>

            {trades.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first trade to track your performance
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setActiveView("balance")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Add Deposit
                    </button>
                    <button
                      onClick={() => setActiveView("add-trade")}
                      className="px-4 py-2 border border-input rounded-md hover:bg-accent"
                    >
                      Add Trade
                    </button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Trades</CardTitle>
                    <CardDescription>Your latest trading activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trades
                        .slice(-5)
                        .reverse()
                        .map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full ${trade.outcome === "win" ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <div>
                                <p className="font-medium">{trade.symbol}</p>
                                <p className="text-sm text-muted-foreground">{trade.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-medium ${trade.outcome === "win" ? "text-green-600" : "text-red-600"}`}
                              >
                                {trade.outcome === "win" ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
                              </p>
                              <Badge variant={trade.direction === "long" ? "default" : "secondary"}>
                                {trade.direction}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                    <CardDescription>Key metrics overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Winning Trades</span>
                        <span className="font-medium text-green-600">{winningTrades.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Losing Trades</span>
                        <span className="font-medium text-red-600">{trades.length - winningTrades.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Trade</span>
                        <span className="font-medium text-green-600">
                          ${trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)).toFixed(2) : "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Worst Trade</span>
                        <span className="font-medium text-red-600">
                          -$
                          {trades.length > 0
                            ? Math.abs(
                                Math.min(...trades.map((t) => (t.outcome === "loss" ? -Math.abs(t.pnl) : t.pnl))),
                              ).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="text-lg font-semibold">Trading Journal</h2>
              <ThemeToggle />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => setActiveView(item.id)} isActive={activeView === item.id}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>

          <main className="flex-1 p-6">{renderContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
