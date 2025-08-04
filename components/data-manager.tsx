"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, AlertTriangle } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { CloudSync } from "@/components/cloud-sync"

interface DataManagerProps {
  trades: any[]
  deposits: any[]
  balance: number
  onImportData: (data: { trades: any[]; deposits: any[]; balance: number }) => void
  onClearData: () => void
}

export function DataManager({ trades, deposits, balance, onImportData, onClearData }: DataManagerProps) {
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)

  const exportData = () => {
    const data = {
      trades,
      deposits,
      balance,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trading-journal-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Data Exported",
      description: "Your trading data has been exported successfully.",
    })
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Validate data structure
        if (data.trades && data.deposits && typeof data.balance === "number") {
          onImportData({
            trades: data.trades,
            deposits: data.deposits,
            balance: data.balance,
          })

          toast({
            title: "Data Imported",
            description: "Your trading data has been imported successfully.",
          })
        } else {
          throw new Error("Invalid data format")
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "The file format is invalid or corrupted.",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
        // Reset file input
        event.target.value = ""
      }
    }

    reader.readAsText(file)
  }

  const handleClearData = () => {
    onClearData()

    // Also clear any remaining localStorage items that might not be handled by the parent
    localStorage.removeItem("trading-journal-cloud-connected")
    localStorage.removeItem("trading-journal-sync-code")
    localStorage.removeItem("trading-journal-last-sync")
    localStorage.removeItem("trading-journal-cloud-data")
    localStorage.removeItem("trading-journal-device-id")
    localStorage.removeItem("trading-journal-device-name")
    localStorage.removeItem("trading-journal-auto-sync")

    toast({
      title: "Data Cleared",
      description: "All your trading data has been cleared. The page will refresh.",
    })

    // Small delay to show the toast, then reload
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-muted-foreground">Backup, restore, sync, and manage your trading data</p>
      </div>

      {/* Add Cloud Sync Section */}
      <CloudSync trades={trades} deposits={deposits} balance={balance} onSyncData={onImportData} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>Download a backup of all your trading data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Your backup will include:</p>
                <div className="space-y-1">
                  <div>• {trades.length} trades</div>
                  <div>• {deposits.length} deposits</div>
                  <div>• Current balance: ${balance.toFixed(2)}</div>
                  <div>• Export timestamp</div>
                </div>
              </div>
              <Button onClick={exportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>Restore your trading data from a backup file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Import a previously exported backup file.</p>
                <p className="text-amber-600 mt-2">⚠️ This will replace all current data</p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-file"
                  disabled={isImporting}
                />
                <Button
                  onClick={() => document.getElementById("import-file")?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? "Importing..." : "Import Data"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of the existing content remains the same */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that will permanently delete your data</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your trading history ({trades.length}{" "}
                  trades), deposit records ({deposits.length} deposits), account balance (${balance.toFixed(2)}), and
                  all analytics and progress data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, clear all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Storage Information</CardTitle>
          <CardDescription>How your data is stored and protected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Local Storage</p>
                <p className="text-muted-foreground">
                  Your data is stored locally in your browser and never sent to external servers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Cloud Sync (Optional)</p>
                <p className="text-muted-foreground">
                  Securely sync your data across multiple devices using encrypted connections.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Automatic Saving</p>
                <p className="text-muted-foreground">All changes are automatically saved as you make them.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Browser Dependent</p>
                <p className="text-muted-foreground">
                  Local data is tied to this specific browser. Use cloud sync or exports for cross-device access.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Backup Recommended</p>
                <p className="text-muted-foreground">
                  Regular exports and cloud sync are recommended to prevent data loss.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
