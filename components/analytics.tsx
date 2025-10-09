"use client"

import { Label } from "@/components/ui/label"
import { BarChart3, Calendar, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Activity } from "lucide-react"
import { Input } from "@/components/ui/input"

import { useMemo, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { DateRange } from "react-day-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Trade {
  id: number
  date: string
  symbol: string
  direction: "long" | "short"
  positionSize: number
  notes: string
  tags: string[]
  outcome: "win" | "loss" | "be" // Add "be" here
  pnl: number
  images?: string[] // Add this line
}

interface AnalyticsProps {
  trades: Trade[]
}

export function Analytics({ trades }: AnalyticsProps) {
  const [equityChartType, setEquityChartType] = useState<"line" | "bar">("line")
  const [dailyPnLChartType, setDailyPnLChartType] = useState<"line" | "bar">("line")
  const [chartColor, setChartColor] = useState<string>("hsl(var(--chart-1))")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("charts")

  // Calendar specific state
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // Filter trades based on date range
  const filteredTrades = useMemo(() => {
    if (!dateRange?.from) {
      return trades
    }
    const fromDate = dateRange.from.toISOString().split("T")[0]
    const toDate = dateRange.to ? dateRange.to.toISOString().split("T")[0] : fromDate

    return trades.filter((trade) => {
      const tradeDate = trade.date
      return tradeDate >= fromDate && tradeDate <= toDate
    })
  }, [trades, dateRange])

  // Memoized calculations for key metrics
  const winningTrades = useMemo(() => filteredTrades.filter((trade) => trade.outcome === "win"), [filteredTrades])
  const losingTrades = useMemo(() => filteredTrades.filter((trade) => trade.outcome === "loss"), [filteredTrades])
  const breakEvenTrades = useMemo(() => filteredTrades.filter((trade) => trade.outcome === "be"), [filteredTrades]) // Add this line

  // Update winRate calculation to exclude break-even trades
  const winRate = useMemo(() => {
    const decisiveTrades = winningTrades.length + losingTrades.length
    return decisiveTrades > 0 ? (winningTrades.length / decisiveTrades) * 100 : 0
  }, [winningTrades.length, losingTrades.length]) // Update dependencies

  const totalWins = useMemo(() => winningTrades.reduce((sum, trade) => sum + trade.pnl, 0), [winningTrades])
  const totalLosses = useMemo(() => Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0)), [losingTrades])
  const avgWin = useMemo(
    () => (winningTrades.length > 0 ? totalWins / winningTrades.length : 0),
    [winningTrades.length, totalWins],
  )
  const avgLoss = useMemo(
    () => (losingTrades.length > 0 ? totalLosses / losingTrades.length : 0),
    [losingTrades.length, totalLosses],
  )
  const profitFactor = useMemo(() => (totalLosses > 0 ? totalWins / totalLosses : 0), [totalWins, totalLosses])
  const totalPnL = useMemo(() => totalWins - totalLosses, [totalWins, totalLosses])

  const avgTradePnL = useMemo(
    () => (filteredTrades.length > 0 ? totalPnL / filteredTrades.length : 0),
    [filteredTrades.length, totalPnL],
  )

  // Equity curve data
  const equityCurve = useMemo(() => {
    let runningTotal = 0
    return filteredTrades.map((trade, index) => {
      if (trade.outcome === "win") {
        runningTotal += trade.pnl
      } else if (trade.outcome === "loss") {
        // Explicitly handle loss
        runningTotal -= Math.abs(trade.pnl)
      }
      // Break-even trades do not affect runningTotal
      return {
        trade: index + 1,
        equity: runningTotal,
        date: trade.date,
      }
    })
  }, [filteredTrades])

  // Monthly performance
  const monthlyChart = useMemo(() => {
    const monthlyData = filteredTrades.reduce(
      (acc, trade) => {
        const month = trade.date.substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { month, pnl: 0, trades: 0 }
        }
        if (trade.outcome === "win") {
          acc[month].pnl += trade.pnl
        } else if (trade.outcome === "loss") {
          // Explicitly handle loss
          acc[month].pnl -= Math.abs(trade.pnl)
        }
        // Break-even trades do not affect monthly P&L
        if (trade.outcome !== "be") {
          // Only count non-break-even trades for 'trades' count
          acc[month].trades += 1
        }
        return acc
      },
      {} as Record<string, { month: string; pnl: number; trades: number }>,
    )
    return Object.values(monthlyData)
  }, [filteredTrades])

  // Daily P&L
  const dailyPnLChart = useMemo(() => {
    const dailyData = filteredTrades.reduce(
      (acc, trade) => {
        const date = trade.date // YYYY-MM-DD
        if (!acc[date]) {
          acc[date] = { date, pnl: 0 }
        }
        if (trade.outcome === "win") {
          acc[date].pnl += trade.pnl
        } else if (trade.outcome === "loss") {
          // Explicitly handle loss
          acc[date].pnl -= Math.abs(trade.pnl)
        }
        // Break-even trades do not affect daily P&L
        return acc
      },
      {} as Record<string, { date: string; pnl: number }>,
    )
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredTrades])

  // Symbol performance
  const symbolChart = useMemo(() => {
    const symbolPerformance = filteredTrades.reduce(
      (acc, trade) => {
        if (!acc[trade.symbol]) {
          acc[trade.symbol] = { symbol: trade.symbol, pnl: 0, count: 0 }
        }
        if (trade.outcome === "win") {
          acc[trade.symbol].pnl += trade.pnl
        } else if (trade.outcome === "loss") {
          // Explicitly handle loss
          acc[trade.symbol].pnl -= Math.abs(trade.pnl)
        }
        // Break-even trades do not affect symbol performance P&L
        if (trade.outcome !== "be") {
          // Only count non-break-even trades for count
          acc[trade.symbol].count += 1
        }
        return acc
      },
      {} as Record<string, { symbol: string; pnl: number; count: number }>,
    )
    return Object.values(symbolPerformance)
  }, [filteredTrades])

  // Strategy performance (using tags)
  const strategyChart = useMemo(() => {
    const strategyPerformance: Record<string, { strategy: string; pnl: number; count: number }> = {}
    filteredTrades.forEach((trade) => {
      if (trade.tags.length === 0) {
        // Assign to 'Untagged' if no tags
        if (!strategyPerformance["Untagged"]) {
          strategyPerformance["Untagged"] = { strategy: "Untagged", pnl: 0, count: 0 }
        }
        if (trade.outcome === "win") {
          strategyPerformance["Untagged"].pnl += trade.pnl
        } else if (trade.outcome === "loss") {
          // Explicitly handle loss
          strategyPerformance["Untagged"].pnl -= Math.abs(trade.pnl)
        }
        if (trade.outcome !== "be") {
          // Only count non-break-even trades for count
          strategyPerformance["Untagged"].count += 1
        }
      } else {
        trade.tags.forEach((tag) => {
          if (!strategyPerformance[tag]) {
            strategyPerformance[tag] = { strategy: tag, pnl: 0, count: 0 }
          }
          if (trade.outcome === "win") {
            strategyPerformance[tag].pnl += trade.pnl
          } else if (trade.outcome === "loss") {
            // Explicitly handle loss
            strategyPerformance[tag].pnl -= Math.abs(trade.pnl)
          }
          if (trade.outcome !== "be") {
            // Only count non-break-even trades for count
            strategyPerformance[tag].count += 1
          }
        })
      }
    })
    return Object.values(strategyPerformance).sort((a, b) => b.pnl - a.pnl)
  }, [filteredTrades])

  // Win/Loss pie chart
  const outcomeData = useMemo(
    () => [
      { name: "Wins", value: winningTrades.length, color: "#22c55e" },
      { name: "Losses", value: losingTrades.length, color: "#ef4444" },
      // Break-even trades are not shown in this pie chart
    ],
    [winningTrades.length, losingTrades.length],
  )

  // Longest winning/losing streak
  const { longestWinningStreak, longestLosingStreak } = useMemo(() => {
    let currentWinningStreak = 0
    let maxWinningStreak = 0
    let currentLosingStreak = 0
    let maxLosingStreak = 0

    filteredTrades.forEach((trade) => {
      if (trade.outcome === "win") {
        currentWinningStreak++
        currentLosingStreak = 0
      } else if (trade.outcome === "loss") {
        // Explicitly handle loss
        currentLosingStreak++
        currentWinningStreak = 0
      } else {
        // Break-even trades reset streaks
        currentWinningStreak = 0
        currentLosingStreak = 0
      }
      maxWinningStreak = Math.max(maxWinningStreak, currentWinningStreak)
      maxLosingStreak = Math.max(maxLosingStreak, currentLosingStreak)
    })
    return { longestWinningStreak: maxWinningStreak, longestLosingStreak: maxLosingStreak }
  }, [filteredTrades])

  // Calendar specific calculations
  const calendarMonth = calendarDate.getMonth()
  const calendarYear = calendarDate.getFullYear()

  // Navigate calendar months
  const navigateCalendarMonth = (direction: "prev" | "next") => {
    const newDate = new Date(calendarDate)
    if (direction === "prev") {
      newDate.setMonth(calendarMonth - 1)
    } else {
      newDate.setMonth(calendarMonth + 1)
    }
    setCalendarDate(newDate)
  }

  // Calendar daily P&L
  const calendarDailyPnL = useMemo(() => {
    const dailyData: Record<string, { pnl: number; trades: number }> = {}

    trades.forEach((trade) => {
      const tradeDate = trade.date
      if (!dailyData[tradeDate]) {
        dailyData[tradeDate] = { pnl: 0, trades: 0 }
      }

      if (trade.outcome === "win") {
        dailyData[tradeDate].pnl += trade.pnl
        dailyData[tradeDate].trades += 1
      } else if (trade.outcome === "loss") {
        // Explicitly handle loss
        dailyData[tradeDate].pnl -= Math.abs(trade.pnl)
        dailyData[tradeDate].trades += 1
      }
      // Break-even trades do not contribute to P&L but are counted as trades
      else if (trade.outcome === "be") {
        dailyData[tradeDate].trades += 1
      }
    })

    return dailyData
  }, [trades])

  // Calendar monthly P&L
  const calendarMonthlyPnL = useMemo(() => {
    const monthKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`
    let totalPnL = 0
    let totalDaysWithTrades = 0

    Object.entries(calendarDailyPnL).forEach(([date, data]) => {
      if (date.startsWith(monthKey)) {
        totalPnL += data.pnl
        if (data.trades > 0) {
          totalDaysWithTrades += 1
        }
      }
    })

    return { totalPnL, totalDays: totalDaysWithTrades }
  }, [calendarDailyPnL, calendarMonth, calendarYear])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay()
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [calendarDate, calendarMonth, calendarYear])

  // Get selected date trades
  const selectedDateTrades = useMemo(() => {
    if (!selectedCalendarDate) return []
    return trades.filter((trade) => trade.date === selectedCalendarDate)
  }, [trades, selectedCalendarDate])

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get day cell styling
  const getDayCellStyling = (day: number) => {
    const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayData = calendarDailyPnL[dateKey]
    const isSelected = selectedCalendarDate === dateKey
    const isToday = new Date().toDateString() === new Date(calendarYear, calendarMonth, day).toDateString()

    let className =
      "h-16 w-full border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-sm rounded-md"

    if (isSelected) {
      className += " ring-2 ring-primary"
    }

    if (isToday) {
      className += " bg-primary/10"
    }

    return { className, dayData }
  }

  if (filteredTrades.length === 0) {
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
            <p className="text-muted-foreground">Add some trades or adjust your filters to see performance analytics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed performance analysis and calendar view</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts">Charts & Metrics</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-8">
          {/* Filters and Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Filters & Customization</CardTitle>
              <CardDescription>Adjust the data range and chart display options</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="From date"
                    onChange={(e) => {
                      const fromDate = e.target.value ? new Date(e.target.value) : undefined
                      setDateRange(fromDate ? { from: fromDate, to: dateRange?.to } : undefined)
                    }}
                  />
                  <Input
                    type="date"
                    placeholder="To date"
                    onChange={(e) => {
                      const toDate = e.target.value ? new Date(e.target.value) : undefined
                      setDateRange(dateRange?.from ? { from: dateRange.from, to: toDate } : undefined)
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equity-chart-type">Equity Chart Type</Label>
                <Select value={equityChartType} onValueChange={(value: "line" | "bar") => setEquityChartType(value)}>
                  <SelectTrigger id="equity-chart-type">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-pnl-chart-type">Daily P&L Chart Type</Label>
                <Select
                  value={dailyPnLChartType}
                  onValueChange={(value: "line" | "bar") => setDailyPnLChartType(value)}
                >
                  <SelectTrigger id="daily-pnl-chart-type">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chart-color">Chart Color</Label>
                <Select value={chartColor} onValueChange={setChartColor}>
                  <SelectTrigger id="chart-color">
                    <SelectValue placeholder="Select chart color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hsl(var(--chart-1))">Default (Orange)</SelectItem>
                    <SelectItem value="hsl(var(--chart-2))">Green</SelectItem>
                    <SelectItem value="hsl(var(--chart-3))">Blue</SelectItem>
                    <SelectItem value="hsl(var(--chart-4))">Yellow</SelectItem>
                    <SelectItem value="hsl(var(--chart-5))">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {winningTrades.length}W / {losingTrades.length}L / {breakEvenTrades.length}BE
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
                <div className="text-2xl font-bold text-green-600">
                  ${Math.max(...filteredTrades.map((t) => t.pnl)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Largest winner</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Trade P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${avgTradePnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {avgTradePnL >= 0 ? "+" : ""}${avgTradePnL.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Average profit/loss per trade</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Longest Win Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{longestWinningStreak}</div>
                <p className="text-xs text-muted-foreground">Consecutive winning trades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Longest Loss Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{longestLosingStreak}</div>
                <p className="text-xs text-muted-foreground">Consecutive losing trades</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="space-y-8">
            {/* First Row - Two Charts */}
            <div className="flex flex-wrap gap-6">
              <Card className="w-full lg:w-[calc(50%-12px)]">
                <CardHeader>
                  <CardTitle>Equity Curve</CardTitle>
                  <CardDescription>Account balance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      equity: {
                        label: "Equity",
                        color: chartColor,
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {equityChartType === "line" ? (
                        <LineChart data={equityCurve}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="trade" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="equity"
                            stroke="var(--color-equity)"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={equityCurve}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="trade" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="equity" fill="var(--color-equity)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="w-full lg:w-[calc(50%-12px)]">
                <CardHeader>
                  <CardTitle>Win/Loss/BE Distribution</CardTitle>
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
                      be: {
                        label: "Break-Even",
                        color: "#a1a1aa", // Grey for break-even
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Wins", value: winningTrades.length, color: "#22c55e" },
                            { name: "Losses", value: losingTrades.length, color: "#ef4444" },
                            { name: "Break-Even", value: breakEvenTrades.length, color: "#a1a1aa" },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: "Wins", value: winningTrades.length, color: "#22c55e" },
                            { name: "Losses", value: losingTrades.length, color: "#ef4444" },
                            { name: "Break-Even", value: breakEvenTrades.length, color: "#a1a1aa" },
                          ].map((entry, index) => (
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
              <Card className="w-full lg:w-[calc(50%-12px)]">
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>P&L by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pnl: {
                        label: "P&L",
                        color: chartColor,
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
                <CardHeader>
                  <CardTitle>Daily Performance</CardTitle>
                  <CardDescription>P&L by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pnl: {
                        label: "P&L",
                        color: chartColor,
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {dailyPnLChartType === "line" ? (
                        <LineChart data={dailyPnLChart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="pnl" stroke="var(--color-pnl)" strokeWidth={2} dot={false} />
                        </LineChart>
                      ) : (
                        <BarChart data={dailyPnLChart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="pnl" fill="var(--color-pnl)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Third Row - Two Charts */}
            <div className="flex flex-wrap gap-6">
              <Card className="w-full lg:w-[calc(50%-12px)]">
                <CardHeader>
                  <CardTitle>Symbol Performance</CardTitle>
                  <CardDescription>P&L by trading symbol</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pnl: {
                        label: "P&L",
                        color: chartColor,
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
              <Card className="w-full lg:w-[calc(50%-12px)]">
                <CardHeader>
                  <CardTitle>Strategy Performance</CardTitle>
                  <CardDescription>P&L by trading strategy (tags)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pnl: {
                        label: "P&L",
                        color: chartColor,
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={strategyChart} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="strategy" type="category" width={100} />
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
                      <span>{filteredTrades.length}</span>
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
                      <span className="text-muted-foreground">Break-Even Trades:</span>
                      <span className="text-gray-400">{breakEvenTrades.length}</span>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Trade P&L:</span>
                      <span className={avgTradePnL >= 0 ? "text-green-600" : "text-red-600"}>
                        {avgTradePnL >= 0 ? "+" : ""}${avgTradePnL.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Risk Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Trade:</span>
                      <span className="text-green-600">
                        ${Math.max(...filteredTrades.map((t) => t.pnl)).toFixed(2)}
                      </span>
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
                      <span className="text-muted-foreground">Longest Win Streak:</span>
                      <span className="text-green-600">{longestWinningStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longest Loss Streak:</span>
                      <span className="text-red-600">{longestLosingStreak}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigateCalendarMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <h2 className="text-xl font-semibold min-w-[140px]">
                {monthNames[calendarMonth]} {calendarYear}
              </h2>

              <Button variant="ghost" size="sm" onClick={() => navigateCalendarMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={() => setCalendarDate(new Date())}>
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>
                Monthly P&L:{" "}
                <span
                  className={`font-semibold ${calendarMonthlyPnL.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${calendarMonthlyPnL.totalPnL.toFixed(2)}
                </span>
              </span>
              <span>
                Trading Days: <span className="font-semibold">{calendarMonthlyPnL.totalDays}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div key={index}>
                    {day ? (
                      <div
                        className={getDayCellStyling(day).className}
                        onClick={() => {
                          const dateKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                          setSelectedCalendarDate(selectedCalendarDate === dateKey ? null : dateKey)
                        }}
                      >
                        <span className="font-medium">{day}</span>
                        {getDayCellStyling(day).dayData && (
                          <div className="flex flex-col items-center mt-1">
                            <span
                              className={`text-xs font-semibold ${
                                getDayCellStyling(day).dayData!.pnl >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {getDayCellStyling(day).dayData!.pnl >= 0 ? "+" : ""}$
                              {getDayCellStyling(day).dayData!.pnl.toFixed(0)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getDayCellStyling(day).dayData!.trades} trades
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-16"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Date Details */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedCalendarDate ? "Day Details" : "Select a Day"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCalendarDate ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{selectedCalendarDate}</h4>
                        {selectedDateTrades.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Total P&L: </span>
                              <span
                                className={`font-semibold ${
                                  selectedDateTrades.reduce(
                                    (sum, trade) => sum + (trade.outcome === "win" ? trade.pnl : -Math.abs(trade.pnl)),
                                    0,
                                  ) >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                $
                                {selectedDateTrades
                                  .reduce(
                                    (sum, trade) => sum + (trade.outcome === "win" ? trade.pnl : -Math.abs(trade.pnl)),
                                    0,
                                  )
                                  .toFixed(2)}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Trades: </span>
                              <span className="font-semibold">{selectedDateTrades.length}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Win Rate: </span>
                              <span className="font-semibold">
                                {(
                                  (selectedDateTrades.filter((t) => t.outcome === "win").length /
                                    selectedDateTrades.length) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">No trades on this day</p>
                        )}
                      </div>

                      {selectedDateTrades.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Trades:</h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedDateTrades.map((trade) => (
                              <div key={trade.id} className="p-2 border rounded text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{trade.symbol}</span>
                                  <span
                                    className={`font-semibold ${trade.outcome === "win" ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {trade.outcome === "win" ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>{trade.direction}</span>
                                  <span>{trade.positionSize}</span>
                                </div>
                                {trade.tags.length > 0 && (
                                  <div className="mt-1">
                                    {trade.tags.slice(0, 2).map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-block bg-muted px-1 py-0.5 rounded text-xs mr-1"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {trade.images && trade.images.length > 0 && (
                                  <div className="mt-1">
                                    {trade.images.slice(0, 2).map((image, index) => (
                                      <img
                                        key={index}
                                        src={image || "/placeholder.svg"}
                                        alt={`Trade ${trade.id} Image`}
                                        className="h-8 w-8 rounded object-cover"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click on a calendar day to see trade details</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Number of days</p>
                    <p className="text-2xl font-bold text-white">{calendarMonthlyPnL.totalDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Total Trades Taken</p>
                    <p className="text-2xl font-bold text-white">
                      {Object.entries(calendarDailyPnL)
                        .filter(([date]) =>
                          date.startsWith(`${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`),
                        )
                        .reduce((sum, [, data]) => sum + data.trades, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Total Lots Used</p>
                    <p className="text-2xl font-bold text-white">
                      {trades
                        .filter((trade) =>
                          trade.date.startsWith(`${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`),
                        )
                        .reduce((sum, trade) => sum + trade.positionSize, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-400">Biggest Win</p>
                    <p className="text-2xl font-bold text-green-400">
                      $
                      {trades
                        .filter(
                          (trade) =>
                            trade.date.startsWith(`${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`) &&
                            trade.outcome === "win",
                        )
                        .reduce((max, trade) => Math.max(max, trade.pnl), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm text-slate-400">Biggest Loss</p>
                    <p className="text-2xl font-bold text-red-400">
                      $
                      {trades
                        .filter(
                          (trade) =>
                            trade.date.startsWith(`${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`) &&
                            trade.outcome === "loss",
                        )
                        .reduce((max, trade) => Math.max(max, Math.abs(trade.pnl)), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
