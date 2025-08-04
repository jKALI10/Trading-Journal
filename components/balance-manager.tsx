"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Plus, TrendingUp } from "lucide-react"

interface Deposit {
  id: number
  amount: number
  date: string
}

interface BalanceManagerProps {
  balance: number
  deposits: Deposit[]
  onAddDeposit: (amount: number) => void
}

export function BalanceManager({ balance, deposits, onAddDeposit }: BalanceManagerProps) {
  const [depositAmount, setDepositAmount] = useState("")

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(depositAmount)
    if (amount > 0) {
      onAddDeposit(amount)
      setDepositAmount("")
    }
  }

  const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
  const tradingPnL = balance - totalDeposits

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Balance Management</h1>
        <p className="text-muted-foreground">Manage your trading account deposits and track your balance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total account value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeposits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{deposits.length} deposits made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${tradingPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {tradingPnL >= 0 ? "+" : ""}${tradingPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{tradingPnL >= 0 ? "Profit" : "Loss"} from trading</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Deposit</CardTitle>
            <CardDescription>Add funds to your trading account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDeposit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Deposit Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Add Deposit
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deposit History</CardTitle>
            <CardDescription>Your account funding history</CardDescription>
          </CardHeader>
          <CardContent>
            {deposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No deposits yet</p>
                <p className="text-sm">Add your first deposit to start trading</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {deposits
                  .slice()
                  .reverse()
                  .map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">${deposit.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{deposit.date}</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
