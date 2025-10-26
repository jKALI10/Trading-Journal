"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  CheckCircle2,
  Activity,
} from "lucide-react";

interface Trade {
  id: number;
  date: string;
  symbol: string;
  direction: "long" | "short";
  positionSize: number;
  notes: string;
  tags: string[];
  outcome: "win" | "loss" | "be";
  pnl: number;
  images?: string[];
}

interface MonthlyReview {
  month: string;
  goals: string;
  successes: string;
  challenges: string;
  lessons: string;
  nextMonth: string;
  sentiment: "positive" | "neutral" | "negative";
}

interface PortfolioManagementProps {
  trades: Trade[];
  balance: number;
  deposits: { id: number; amount: number; date: string }[];
}

export function PortfolioManagement({
  trades,
  balance,
  deposits,
}: PortfolioManagementProps) {
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [reviewForm, setReviewForm] = useState({
    goals: "",
    successes: "",
    challenges: "",
    lessons: "",
    nextMonth: "",
    sentiment: "neutral" as "positive" | "neutral" | "negative",
  });

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    const data: Record<
      string,
      {
        month: string;
        trades: number;
        wins: number;
        losses: number;
        be: number;
        pnl: number;
        deposits: number;
      }
    > = {};

    // Group trades by month
    trades.forEach((trade) => {
      const month = trade.date.substring(0, 7); // YYYY-MM
      if (!data[month]) {
        data[month] = {
          month,
          trades: 0,
          wins: 0,
          losses: 0,
          be: 0,
          pnl: 0,
          deposits: 0,
        };
      }

      data[month].trades += 1;
      if (trade.outcome === "win") {
        data[month].wins += 1;
        data[month].pnl += trade.pnl;
      } else if (trade.outcome === "loss") {
        data[month].losses += 1;
        data[month].pnl -= Math.abs(trade.pnl);
      } else {
        data[month].be += 1;
      }
    });

    // Group deposits by month
    deposits.forEach((deposit) => {
      const month = deposit.date.substring(0, 7); // YYYY-MM
      if (!data[month]) {
        data[month] = {
          month,
          trades: 0,
          wins: 0,
          losses: 0,
          be: 0,
          pnl: 0,
          deposits: 0,
        };
      }
      data[month].deposits += deposit.amount;
    });

    return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));
  }, [trades, deposits]);

  // Calculate current month stats
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthStats = monthlyData.find(
    (m) => m.month === currentMonth
  ) || {
    month: currentMonth,
    trades: 0,
    wins: 0,
    losses: 0,
    be: 0,
    pnl: 0,
    deposits: 0,
  };

  // Calculate account metrics
  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const accountStartBalance = totalDeposits === 0 ? balance : totalDeposits;
  const totalTradingPnL = trades.reduce((sum, trade) => {
    if (trade.outcome === "win") {
      return sum + trade.pnl;
    } else if (trade.outcome === "loss") {
      return sum - Math.abs(trade.pnl);
    }
    return sum;
  }, 0);

  const accountROI =
    accountStartBalance > 0 ? (totalTradingPnL / accountStartBalance) * 100 : 0;
  const monthlyROI =
    accountStartBalance > 0
      ? (currentMonthStats.pnl / accountStartBalance) * 100
      : 0;

  // Calculate growth data for chart
  const growthData = useMemo(() => {
    if (monthlyData.length === 0) {
      return [{ month: "No data", balance: 0, pnl: 0, roi: 0, monthlyPnL: 0 }];
    }

    let cumulativePnL = 0;
    let cumulativeDeposits = 0;

    return monthlyData.map((month) => {
      cumulativePnL += month.pnl;
      cumulativeDeposits += month.deposits;
      const balance = accountStartBalance + cumulativePnL;
      const roi =
        accountStartBalance > 0
          ? ((balance - accountStartBalance) / accountStartBalance) * 100
          : 0;

      return {
        month: month.month,
        balance: Number.parseFloat(balance.toFixed(2)),
        pnl: Number.parseFloat(cumulativePnL.toFixed(2)),
        roi: Number.parseFloat(roi.toFixed(2)),
        monthlyPnL: month.pnl,
      };
    });
  }, [monthlyData, accountStartBalance]);

  // Performance distribution
  const performanceData = useMemo(() => {
    const wins = trades.filter((t) => t.outcome === "win").length;
    const losses = trades.filter((t) => t.outcome === "loss").length;
    const be = trades.filter((t) => t.outcome === "be").length;

    const data = [
      { name: "Wins", value: wins, color: "#22c55e" },
      { name: "Losses", value: losses, color: "#ef4444" },
      { name: "Break Even", value: be, color: "#a1a1aa" },
    ].filter((item) => item.value > 0);

    return data.length > 0
      ? data
      : [{ name: "No trades", value: 1, color: "#a1a1aa" }];
  }, [trades]);

  // Win rate trends
  const winRateTrends = useMemo(() => {
    if (monthlyData.length === 0) {
      return [{ month: "No data", winRate: 0, trades: 0 }];
    }

    return monthlyData.map((month) => {
      const decisiveTrades = month.wins + month.losses;
      const winRate =
        decisiveTrades > 0 ? (month.wins / decisiveTrades) * 100 : 0;
      return {
        month: month.month,
        winRate: Number.parseFloat(winRate.toFixed(1)),
        trades: month.trades,
      };
    });
  }, [monthlyData]);

  const handleSaveReview = () => {
    if (!selectedMonth) return;

    const newReview: MonthlyReview = {
      month: selectedMonth,
      ...reviewForm,
    };

    const existingIndex = monthlyReviews.findIndex(
      (r) => r.month === selectedMonth
    );
    if (existingIndex >= 0) {
      const updated = [...monthlyReviews];
      updated[existingIndex] = newReview;
      setMonthlyReviews(updated);
    } else {
      setMonthlyReviews([...monthlyReviews, newReview]);
    }

    setShowReviewForm(false);
    setReviewForm({
      goals: "",
      successes: "",
      challenges: "",
      lessons: "",
      nextMonth: "",
      sentiment: "neutral",
    });
    setSelectedMonth("");
  };

  const existingReview = monthlyReviews.find((r) => r.month === selectedMonth);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Management</h1>
        <p className="text-muted-foreground">
          Track your account growth and performance quantitatively
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= accountStartBalance
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ${balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= accountStartBalance ? "+" : ""}$
              {(balance - accountStartBalance).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                accountROI >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {accountROI.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Return on Investment (All-Time)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                monthlyROI >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {monthlyROI.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">{currentMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                currentMonthStats.pnl >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentMonthStats.pnl >= 0 ? "+" : ""}$
              {currentMonthStats.pnl.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentMonthStats.trades} trades this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="growth">Account Growth</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="winrate">Win Rate Trend</TabsTrigger>
        </TabsList>

        {/* Account Growth Chart */}
        <TabsContent value="growth" className="space-y-4">
          {growthData.length > 0 && growthData[0].month !== "No data" ? (
            <>
              {/* Account Balance Progression Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Balance Progression</CardTitle>
                  <CardDescription>
                    Monthly account balance and ROI tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="balance"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          name="Balance ($)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="roi"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          name="ROI %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly P&L Distribution</CardTitle>
                  <CardDescription>Profit and loss by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="monthlyPnL"
                          fill="hsl(var(--chart-3))"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No trading data available. Add some trades to see growth
                  charts.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Chart */}
        <TabsContent value="performance" className="space-y-4">
          {performanceData.length > 0 &&
          performanceData[0].name !== "No trades" ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Trade Outcomes Distribution</CardTitle>
                  <CardDescription>All-time trade results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trading Activity</CardTitle>
                  <CardDescription>Trades executed per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="trades"
                          fill="hsl(var(--chart-4))"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No performance data available yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Win Rate Trend */}
        <TabsContent value="winrate" className="space-y-4">
          {winRateTrends.length > 0 && winRateTrends[0].month !== "No data" ? (
            <Card>
              <CardHeader>
                <CardTitle>Win Rate Trend</CardTitle>
                <CardDescription>Monthly win rate percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={winRateTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="winRate"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        name="Win Rate %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No win rate data available. Add some trades to see trends.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Monthly Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Summary</CardTitle>
          <CardDescription>Detailed monthly statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Month</th>
                  <th className="text-left py-2 px-2">Trades</th>
                  <th className="text-left py-2 px-2">Wins</th>
                  <th className="text-left py-2 px-2">Losses</th>
                  <th className="text-left py-2 px-2">BE</th>
                  <th className="text-left py-2 px-2">Win %</th>
                  <th className="text-right py-2 px-2">P&L</th>
                  <th className="text-right py-2 px-2">ROI %</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => {
                  const decidedTrades = month.wins + month.losses;
                  const winRate =
                    decidedTrades > 0
                      ? ((month.wins / decidedTrades) * 100).toFixed(1)
                      : "0.0";
                  const roi =
                    accountStartBalance > 0
                      ? ((month.pnl / accountStartBalance) * 100).toFixed(2)
                      : "0.00";

                  return (
                    <tr
                      key={month.month}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-2 font-medium">{month.month}</td>
                      <td className="py-3 px-2">{month.trades}</td>
                      <td className="py-3 px-2 text-green-600">{month.wins}</td>
                      <td className="py-3 px-2 text-red-600">{month.losses}</td>
                      <td className="py-3 px-2 text-gray-400">{month.be}</td>
                      <td className="py-3 px-2">{winRate}%</td>
                      <td
                        className={`py-3 px-2 text-right font-medium ${
                          month.pnl >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {month.pnl >= 0 ? "+" : ""}${month.pnl.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-2 text-right font-medium ${
                          Number.parseFloat(roi) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Number.parseFloat(roi) >= 0 ? "+" : ""}
                        {roi}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Returns Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Returns Calendar</CardTitle>
          <CardDescription>Return on investment by month</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p>No monthly data available. Add some trades to see returns.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group months by year */}
              {Array.from(
                new Set(monthlyData.map((m) => m.month.substring(0, 4)))
              ).map((year) => {
                const yearMonths = monthlyData.filter((m) =>
                  m.month.startsWith(year)
                );
                const monthNames = [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ];

                return (
                  <div key={year} className="space-y-3">
                    <h3 className="text-lg font-semibold">{year}</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {monthNames.map((monthName, monthIndex) => {
                        const monthKey = `${year}-${String(
                          monthIndex + 1
                        ).padStart(2, "0")}`;
                        const monthData = yearMonths.find(
                          (m) => m.month === monthKey
                        );

                        if (!monthData) {
                          return (
                            <div
                              key={monthKey}
                              className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/20 text-center opacity-50"
                            >
                              <p className="text-xs font-medium text-muted-foreground">
                                {monthName}
                              </p>
                              <p className="text-sm text-muted-foreground">-</p>
                            </div>
                          );
                        }

                        const roi =
                          accountStartBalance > 0
                            ? (
                                (monthData.pnl / accountStartBalance) *
                                100
                              ).toFixed(1)
                            : "0";
                        const roiValue = Number.parseFloat(roi);

                        return (
                          <div
                            key={monthKey}
                            className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer hover:shadow-md ${
                              roiValue > 0
                                ? "bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-700"
                                : roiValue < 0
                                ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700"
                                : "bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {monthName}
                            </p>
                            <div
                              className={`text-lg font-bold ${
                                roiValue > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : roiValue < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {roiValue > 0 ? "+" : ""}
                              {roi}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${monthData.pnl.toFixed(0)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-semibold">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">
                      Positive Months
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {
                        monthlyData.filter((m) =>
                          accountStartBalance > 0
                            ? (m.pnl / accountStartBalance) * 100 > 0
                            : false
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">
                      Negative Months
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      {
                        monthlyData.filter((m) =>
                          accountStartBalance > 0
                            ? (m.pnl / accountStartBalance) * 100 < 0
                            : false
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">
                      Break-Even Months
                    </p>
                    <p className="text-lg font-semibold text-slate-600">
                      {
                        monthlyData.filter((m) =>
                          accountStartBalance > 0
                            ? Math.abs((m.pnl / accountStartBalance) * 100) <
                              0.01
                            : false
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-muted-foreground text-xs">
                      Total Months
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      {monthlyData.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Reviews & Checkpoints
          </CardTitle>
          <CardDescription>
            Structured reflection on your trading performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showReviewForm ? (
            <Button onClick={() => setShowReviewForm(true)} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Monthly Review
            </Button>
          ) : (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="month-select">Select Month</Label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    const existing = monthlyReviews.find(
                      (r) => r.month === e.target.value
                    );
                    if (existing) {
                      setReviewForm({
                        goals: existing.goals,
                        successes: existing.successes,
                        challenges: existing.challenges,
                        lessons: existing.lessons,
                        nextMonth: existing.nextMonth,
                        sentiment: existing.sentiment,
                      });
                    } else {
                      setReviewForm({
                        goals: "",
                        successes: "",
                        challenges: "",
                        lessons: "",
                        nextMonth: "",
                        sentiment: "neutral",
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Select a month...</option>
                  {monthlyData.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.month}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMonth && (
                <>
                  <div className="bg-card p-3 rounded-md text-sm space-y-2">
                    {monthlyData
                      .filter((m) => m.month === selectedMonth)
                      .map((m) => {
                        const roi =
                          accountStartBalance > 0
                            ? ((m.pnl / accountStartBalance) * 100).toFixed(2)
                            : "0";
                        return (
                          <div key={m.month}>
                            <p>
                              <span className="font-semibold">{m.trades}</span>{" "}
                              trades |{" "}
                              <span className="text-green-600">{m.wins}W</span>{" "}
                              /{" "}
                              <span className="text-red-600">{m.losses}L</span>{" "}
                              |{" "}
                              <span
                                className={
                                  Number.parseFloat(roi) >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {roi}% ROI
                              </span>
                            </p>
                          </div>
                        );
                      })}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goals">Monthly Goals</Label>
                    <Textarea
                      id="goals"
                      placeholder="What were your goals for this month?"
                      value={reviewForm.goals}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, goals: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="successes">Successes & Wins</Label>
                    <Textarea
                      id="successes"
                      placeholder="What went well this month?"
                      value={reviewForm.successes}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          successes: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="challenges">Challenges & Struggles</Label>
                    <Textarea
                      id="challenges"
                      placeholder="What challenges did you face?"
                      value={reviewForm.challenges}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          challenges: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lessons">Key Lessons Learned</Label>
                    <Textarea
                      id="lessons"
                      placeholder="What did you learn this month?"
                      value={reviewForm.lessons}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          lessons: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next">Focus for Next Month</Label>
                    <Textarea
                      id="next"
                      placeholder="What will you focus on next month?"
                      value={reviewForm.nextMonth}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          nextMonth: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sentiment">Overall Sentiment</Label>
                    <div className="flex gap-2">
                      {(["positive", "neutral", "negative"] as const).map(
                        (s) => (
                          <Button
                            key={s}
                            variant={
                              reviewForm.sentiment === s ? "default" : "outline"
                            }
                            onClick={() =>
                              setReviewForm({ ...reviewForm, sentiment: s })
                            }
                            className="flex-1"
                          >
                            {s === "positive"
                              ? "😊 Positive"
                              : s === "neutral"
                              ? "😐 Neutral"
                              : "😞 Negative"}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveReview} className="flex-1">
                      Save Review
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewForm({
                          goals: "",
                          successes: "",
                          challenges: "",
                          lessons: "",
                          nextMonth: "",
                          sentiment: "neutral",
                        });
                        setSelectedMonth("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {monthlyReviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Completed Reviews</h3>
              {monthlyReviews.map((review) => (
                <Card key={review.month} className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {review.month}
                      </CardTitle>
                      <Badge
                        variant={
                          review.sentiment === "positive"
                            ? "default"
                            : review.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {review.sentiment === "positive"
                          ? "😊"
                          : review.sentiment === "negative"
                          ? "😞"
                          : "😐"}{" "}
                        {review.sentiment}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {review.goals && (
                      <div>
                        <p className="font-semibold text-muted-foreground">
                          Goals:
                        </p>
                        <p>{review.goals}</p>
                      </div>
                    )}
                    {review.successes && (
                      <div>
                        <p className="font-semibold text-green-600">
                          Successes:
                        </p>
                        <p>{review.successes}</p>
                      </div>
                    )}
                    {review.challenges && (
                      <div>
                        <p className="font-semibold text-amber-600">
                          Challenges:
                        </p>
                        <p>{review.challenges}</p>
                      </div>
                    )}
                    {review.lessons && (
                      <div>
                        <p className="font-semibold text-blue-600">Lessons:</p>
                        <p>{review.lessons}</p>
                      </div>
                    )}
                    {review.nextMonth && (
                      <div>
                        <p className="font-semibold text-purple-600">
                          Next Month Focus:
                        </p>
                        <p>{review.nextMonth}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Goals & Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Benchmarks
          </CardTitle>
          <CardDescription>Standard metrics and targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* All-time stats */}
            <div className="space-y-3 border rounded-lg p-4">
              <h3 className="font-semibold">All-Time Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Trades:</span>
                  <span className="font-medium">{trades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="font-medium">
                    {trades.length > 0
                      ? (
                          ((trades.filter((t) => t.outcome === "win").length +
                            trades.filter((t) => t.outcome === "loss").length) /
                            trades.length) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Factor:</span>
                  <span className="font-medium">
                    {trades.length > 0
                      ? (
                          trades
                            .filter((t) => t.outcome === "win")
                            .reduce((sum, t) => sum + t.pnl, 0) /
                          Math.max(
                            1,
                            Math.abs(
                              trades
                                .filter((t) => t.outcome === "loss")
                                .reduce((sum, t) => sum + t.pnl, 0)
                            )
                          )
                        ).toFixed(2)
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total ROI:</span>
                  <span
                    className={`font-medium ${
                      accountROI >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {accountROI.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Current month stats */}
            <div className="space-y-3 border rounded-lg p-4">
              <h3 className="font-semibold">Current Month ({currentMonth})</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Trades:</span>
                  <span className="font-medium">
                    {currentMonthStats.trades}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="font-medium">
                    {currentMonthStats.wins + currentMonthStats.losses > 0
                      ? (
                          (currentMonthStats.wins /
                            (currentMonthStats.wins +
                              currentMonthStats.losses)) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>P&L:</span>
                  <span
                    className={`font-medium ${
                      currentMonthStats.pnl >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {currentMonthStats.pnl >= 0 ? "+" : ""}$
                    {currentMonthStats.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly ROI:</span>
                  <span
                    className={`font-medium ${
                      monthlyROI >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {monthlyROI.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {totalTradingPnL >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            Account Growth Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm">
              Your account started at{" "}
              <span className="font-semibold">
                ${accountStartBalance.toFixed(2)}
              </span>{" "}
              and is now worth{" "}
              <span className="font-semibold">${balance.toFixed(2)}</span>.
            </p>
            <p className="text-sm">
              You've made <span className="font-semibold">{trades.length}</span>{" "}
              trades with a total trading P&L of{" "}
              <span
                className={`font-semibold ${
                  totalTradingPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {totalTradingPnL >= 0 ? "+" : ""}${totalTradingPnL.toFixed(2)}
              </span>
              , representing a{" "}
              <span
                className={`font-semibold ${
                  accountROI >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {accountROI.toFixed(2)}%
              </span>{" "}
              return on your initial investment.
            </p>
            {monthlyData.length > 0 && (
              <p className="text-sm">
                This month ({currentMonth}), you've completed{" "}
                <span className="font-semibold">
                  {currentMonthStats.trades}
                </span>{" "}
                trades with a{" "}
                <span
                  className={`font-semibold ${
                    monthlyROI >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {monthlyROI.toFixed(2)}%
                </span>{" "}
                return.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
