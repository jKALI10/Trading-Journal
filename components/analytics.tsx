"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart3 } from "lucide-react"

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

interface AnalyticsProps {
  trades: Trade[]
}

export function Analytics({ trades }: AnalyticsProps) {
  if (trades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed performance analysis</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data to analyze</h3>
            <p className="text-muted-foreground">Add some trades to see your performance analytics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate metrics
  const winningTrades = trades.filter((trade) => trade.outcome === "win")
  const losingTrades = trades.filter((trade) => trade.outcome === "loss")
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0

  const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0))
  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0
  const totalPnL = totalWins - totalLosses

  // Equity curve data
  let runningTotal = 0
  const equityCurve = trades.map((trade, index) => {
    if (trade.outcome === "win") {
      runningTotal += trade.pnl
    } else {
      runningTotal -= Math.abs(trade.pnl)
    }
    return {
      trade: index + 1,
      equity: runningTotal,
      date: trade.date,
    }
  })

  // Monthly performance
  const monthlyData = trades.reduce(
    (acc, trade) => {
      const month = trade.date.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, pnl: 0, trades: 0 }
      }
      if (trade.outcome === "win") {
        acc[month].pnl += trade.pnl
      } else {
        acc[month].pnl -= Math.abs(trade.pnl)
      }
      acc[month].trades += 1
      return acc
    },
    {} as Record<string, { month: string; pnl: number; trades: number }>,
  )

  const monthlyChart = Object.values(monthlyData)

  // Symbol performance
  const symbolPerformance = trades.reduce(
    (acc, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { symbol: trade.symbol, pnl: 0, count: 0 }
      }
      if (trade.outcome === "win") {
        acc[trade.symbol].pnl += trade.pnl
      } else {
        acc[trade.symbol].pnl -= Math.abs(trade.pnl)
      }
      acc[trade.symbol].count += 1
      return acc
    },
    {} as Record<string, { symbol: string; pnl: number; count: number }>,
  )

  const symbolChart = Object.values(symbolPerformance)

  // Win/Loss pie chart
  const outcomeData = [
    { name: "Wins", value: winningTrades.length, color: "#22c55e" },
    { name: "Losses", value: losingTrades.length, color: "#ef4444" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed performance analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {winningTrades.length}W / {losingTrades.length}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitFactor.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gross profit / Gross loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Net profit/loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${Math.max(...trades.map((t) => t.pnl)).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Largest winner</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Fixed Layout */}
      <div className="space-y-8">
        {/* First Row - Two Charts */}
        <div className="flex flex-wrap gap-6">
          {" "}
          {/* Changed from grid to flex */}
          <Card className="w-full lg:w-[calc(50%-12px)]">
            {" "}
            {/* Added width classes */}
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
              <CardDescription>Account balance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  equity: {
                    label: "Equity",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trade" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="equity" stroke="var(--color-equity)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="w-full lg:w-[calc(50%-12px)]">
            {" "}
            {/* Added width classes */}
            <CardHeader>
              <CardTitle>Win/Loss Distribution</CardTitle>
              <CardDescription>Trade outcomes breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  wins: {
                    label: "Wins",
                    color: "#22c55e",
                  },
                  losses: {
                    label: "Losses",
                    color: "#ef4444",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Two Charts */}
        <div className="flex flex-wrap gap-6">
          {" "}
          {/* Changed from grid to flex */}
          <Card className="w-full lg:w-[calc(50%-12px)]">
            {" "}
            {/* Added width classes */}
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>P&L by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  pnl: {
                    label: "P&L",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="pnl" fill="var(--color-pnl)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="w-full lg:w-[calc(50%-12px)]">
            {" "}
            {/* Added width classes */}
            <CardHeader>
              <CardTitle>Symbol Performance</CardTitle>
              <CardDescription>P&L by trading symbol</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  pnl: {
                    label: "P&L",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symbolChart} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="symbol" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="pnl" fill="var(--color-pnl)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
          <CardDescription>Comprehensive performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-semibold">Trade Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Trades:</span>
                  <span>{trades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Winning Trades:</span>
                  <span className="text-green-600">{winningTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Losing Trades:</span>
                  <span className="text-red-600">{losingTrades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span>{winRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">P&L Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total P&L:</span>
                  <span className={totalPnL >= 0 ? "text-green-600" : "text-red-600"}>${totalPnL.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Win:</span>
                  <span className="text-green-600">${avgWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Loss:</span>
                  <span className="text-red-600">${avgLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit Factor:</span>
                  <span>{profitFactor.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Risk Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Trade:</span>
                  <span className="text-green-600">${Math.max(...trades.map((t) => t.pnl)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Worst Trade:</span>
                  <span className="text-red-600">
                    {losingTrades.length > 0
                      ? `-$${Math.max(...losingTrades.map((t) => Math.abs(t.pnl))).toFixed(2)}`
                      : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Wins:</span>
                  <span className="text-green-600">${totalWins.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Losses:</span>
                  <span className="text-red-600">${totalLosses.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
