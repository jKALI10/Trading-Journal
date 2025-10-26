"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  DollarSign,
  Home,
  PlusCircle,
  TrendingUp,
  Activity,
  Wallet,
  Settings,
  AreaChart,
} from "lucide-react";
import { TradeForm } from "@/components/trade-form";
import { TradeHistory } from "@/components/trade-history";
import { Analytics } from "@/components/analytics";
import { Journal } from "@/components/journal";
import { BalanceManager } from "@/components/balance-manager";
import { ThemeToggle } from "@/components/theme-toggle";
import { DataManager } from "@/components/data-manager";
import { PortfolioManagement } from "@/components/portfolio-management";
import { LoginPage } from "@/components/login-page";
import { useAuth } from "@/hooks/use-auth";

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

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  attachments?: string[];
}

const navigationItems = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Portfolio", icon: AreaChart, id: "portfolio" },
  { title: "Balance", icon: Wallet, id: "balance" },
  { title: "Add Trade", icon: PlusCircle, id: "add-trade" },
  { title: "Trade History", icon: Activity, id: "history" },
  { title: "Analytics", icon: BarChart3, id: "analytics" },
  { title: "Journal", icon: BookOpen, id: "journal" },
  { title: "Settings", icon: Settings, id: "settings" },
];

export default function TradingJournal() {
  const { isAuthenticated, logout, isLoaded } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<
    { id: number; amount: number; date: string }[]
  >([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const savedTrades = localStorage.getItem("trading-journal-trades");
    const savedBalance = localStorage.getItem("trading-journal-balance");
    const savedDeposits = localStorage.getItem("trading-journal-deposits");
    const savedJournalEntries = localStorage.getItem(
      "trading-journal-journal-entries"
    );

    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (error) {
        console.error("Error loading trades from localStorage:", error);
      }
    }

    if (savedBalance) {
      try {
        setBalance(Number.parseFloat(savedBalance));
      } catch (error) {
        console.error("Error loading balance from localStorage:", error);
      }
    }

    if (savedDeposits) {
      try {
        setDeposits(JSON.parse(savedDeposits));
      } catch (error) {
        console.error("Error loading deposits from localStorage:", error);
      }
    }

    if (savedJournalEntries) {
      try {
        setJournalEntries(JSON.parse(savedJournalEntries));
      } catch (error) {
        console.error(
          "Error loading journal entries from localStorage:",
          error
        );
      }
    }

    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem("trading-journal-trades", JSON.stringify(trades));
    }
  }, [trades, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem("trading-journal-balance", balance.toString());
    }
  }, [balance, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem(
        "trading-journal-deposits",
        JSON.stringify(deposits)
      );
    }
  }, [deposits, dataLoaded]);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem(
        "trading-journal-journal-entries",
        JSON.stringify(journalEntries)
      );
    }
  }, [journalEntries, dataLoaded]);

  const addTrade = (newTrade: Omit<Trade, "id">) => {
    const trade: Trade = {
      ...newTrade,
      id: Date.now(),
    };
    setTrades([...trades, trade]);

    if (trade.outcome === "win") {
      setBalance((prev) => prev + trade.pnl);
    } else if (trade.outcome === "loss") {
      setBalance((prev) => prev - Math.abs(trade.pnl));
    }
  };

  const updateTrade = (updatedTrade: Trade) => {
    const oldTrade = trades.find((t) => t.id === updatedTrade.id);
    if (oldTrade) {
      if (oldTrade.outcome === "win") {
        setBalance((prev) => prev - oldTrade.pnl);
      } else if (oldTrade.outcome === "loss") {
        setBalance((prev) => prev + Math.abs(oldTrade.pnl));
      }

      if (updatedTrade.outcome === "win") {
        setBalance((prev) => prev + updatedTrade.pnl);
      } else if (updatedTrade.outcome === "loss") {
        setBalance((prev) => prev - Math.abs(updatedTrade.pnl));
      }
    }

    setTrades(
      trades.map((trade) =>
        trade.id === updatedTrade.id ? updatedTrade : trade
      )
    );
  };

  const deleteTrade = (tradeId: number) => {
    const trade = trades.find((t) => t.id === tradeId);
    if (trade) {
      if (trade.outcome === "win") {
        setBalance((prev) => prev - trade.pnl);
      } else if (trade.outcome === "loss") {
        setBalance((prev) => prev + Math.abs(trade.pnl));
      }
    }
    setTrades(trades.filter((trade) => trade.id !== tradeId));
  };

  const addDeposit = (amount: number) => {
    const deposit = {
      id: Date.now(),
      amount,
      date: new Date().toISOString().split("T")[0],
    };
    setDeposits([...deposits, deposit]);
    setBalance((prev) => prev + amount);
  };

  const saveJournalEntry = (
    newEntryData: Omit<JournalEntry, "id" | "date">,
    editingId?: number
  ) => {
    if (editingId) {
      setJournalEntries(
        journalEntries.map((entry) =>
          entry.id === editingId
            ? { ...newEntryData, id: editingId, date: entry.date }
            : entry
        )
      );
    } else {
      const entry: JournalEntry = {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        ...newEntryData,
      };
      setJournalEntries([entry, ...journalEntries]);
    }
  };

  const deleteJournalEntry = (id: number) => {
    setJournalEntries(journalEntries.filter((entry) => entry.id !== id));
  };

  const handleImportData = (data: {
    trades: Trade[];
    deposits: any[];
    balance: number;
    journalEntries?: JournalEntry[];
  }) => {
    setTrades(data.trades);
    setDeposits(data.deposits);
    setBalance(data.balance);
    if (data.journalEntries) {
      setJournalEntries(data.journalEntries);
    }
  };

  const handleClearData = () => {
    setTrades([]);
    setDeposits([]);
    setBalance(0);
    setJournalEntries([]);

    localStorage.removeItem("trading-journal-trades");
    localStorage.removeItem("trading-journal-balance");
    localStorage.removeItem("trading-journal-deposits");
    localStorage.removeItem("trading-journal-journal-entries");
    localStorage.removeItem("trading-journal-cloud-connected");
    localStorage.removeItem("trading-journal-sync-code");
    localStorage.removeItem("trading-journal-last-sync");
    localStorage.removeItem("trading-journal-cloud-data");
    localStorage.removeItem("trading-journal-device-id");
    localStorage.removeItem("trading-journal-device-name");
    localStorage.removeItem("trading-journal-auto-sync");

    window.location.reload();
  };

  const totalDeposits = deposits.reduce(
    (sum, deposit) => sum + deposit.amount,
    0
  );
  const tradingPnL = balance - totalDeposits;
  const winningTrades = trades.filter((trade) => trade.outcome === "win");
  const losingTrades = trades.filter((trade) => trade.outcome === "loss");
  const breakEvenTrades = trades.filter((trade) => trade.outcome === "be");
  const winRate =
    trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const renderContent = () => {
    switch (activeView) {
      case "portfolio":
        return (
          <PortfolioManagement
            trades={trades}
            balance={balance}
            deposits={deposits}
          />
        );
      case "balance":
        return (
          <BalanceManager
            balance={balance}
            deposits={deposits}
            onAddDeposit={addDeposit}
          />
        );
      case "add-trade":
        return <TradeForm onSubmit={addTrade} />;
      case "history":
        return (
          <TradeHistory
            trades={trades}
            onUpdateTrade={updateTrade}
            onDeleteTrade={deleteTrade}
          />
        );
      case "analytics":
        return <Analytics trades={trades} />;
      case "journal":
        return (
          <Journal
            entries={journalEntries}
            onSaveEntry={saveJournalEntry}
            onDeleteEntry={deleteJournalEntry}
          />
        );
      case "settings":
        return (
          <DataManager
            trades={trades}
            deposits={deposits}
            balance={balance}
            journalEntries={journalEntries}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Trading Dashboard</h1>
              <p className="text-muted-foreground">
                Track your trading performance and progress
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Balance
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${balance.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trading P&L: ${tradingPnL.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Win Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {winRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {winningTrades.length} of {trades.length} trades
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Trades
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trades.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Deposits
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalDeposits.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {deposits.length} deposits
                  </p>
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
                    <CardDescription>
                      Your latest trading activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trades
                        .slice(-5)
                        .reverse()
                        .map((trade) => (
                          <div
                            key={trade.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  trade.outcome === "win"
                                    ? "bg-green-500"
                                    : trade.outcome === "loss"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                }`}
                              />
                              <div>
                                <p className="font-medium">{trade.symbol}</p>
                                <p className="text-sm text-muted-foreground">
                                  {trade.date}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-medium ${
                                  trade.outcome === "win"
                                    ? "text-green-600"
                                    : trade.outcome === "loss"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {trade.outcome === "win"
                                  ? "+"
                                  : trade.outcome === "loss"
                                  ? "-"
                                  : ""}
                                ${Math.abs(trade.pnl).toFixed(2)}
                              </p>
                              <Badge
                                variant={
                                  trade.direction === "long"
                                    ? "default"
                                    : "secondary"
                                }
                              >
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
                        <span className="text-muted-foreground">
                          Winning Trades
                        </span>
                        <span className="font-medium text-green-600">
                          {winningTrades.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Losing Trades
                        </span>
                        <span className="font-medium text-red-600">
                          {losingTrades.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Break-Even Trades
                        </span>
                        <span className="font-medium text-yellow-600">
                          {breakEvenTrades.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Best Trade
                        </span>
                        <span className="font-medium text-green-600">
                          $
                          {trades.length > 0
                            ? Math.max(...trades.map((t) => t.pnl)).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Worst Trade
                        </span>
                        <span className="font-medium text-red-600">
                          -$
                          {trades.length > 0
                            ? Math.abs(
                                Math.min(
                                  ...trades.map((t) =>
                                    t.outcome === "loss"
                                      ? -Math.abs(t.pnl)
                                      : t.pnl
                                  )
                                )
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
        );
    }
  };

  if (!isLoaded) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full items-center justify-center">
          <p>Loading...</p>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {isAuthenticated ? (
          <>
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center justify-between px-4 py-2">
                  <h2 className="text-lg font-semibold">Trading Journal</h2>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      title="Logout"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id)}
                        isActive={activeView === item.id}
                      >
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

              <main className="flex-1 p-6">
                {dataLoaded ? renderContent() : null}
              </main>
            </SidebarInset>
          </>
        ) : (
          <LoginPage />
        )}
      </div>
    </SidebarProvider>
  );
}
