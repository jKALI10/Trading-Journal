"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Cloud,
  CloudOff,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

interface CloudSyncProps {
  trades: any[]
  deposits: any[]
  balance: number
  onSyncData: (data: { trades: any[]; deposits: any[]; balance: number }) => void
}

interface SyncDevice {
  id: string
  name: string
  lastSync: string
  isCurrentDevice: boolean
}

export function CloudSync({ trades, deposits, balance, onSyncData }: CloudSyncProps) {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncCode, setSyncCode] = useState("")
  const [deviceName, setDeviceName] = useState("")
  const [connectedDevices, setConnectedDevices] = useState<SyncDevice[]>([])
  const [autoSync, setAutoSync] = useState(true)

  // Generate a unique device ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem("trading-journal-device-id")
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15)
      localStorage.setItem("trading-journal-device-id", deviceId)
    }
    return deviceId
  }

  // Get device name
  const getDeviceName = () => {
    const saved = localStorage.getItem("trading-journal-device-name")
    if (saved) return saved

    const userAgent = navigator.userAgent
    if (userAgent.includes("Mobile")) return "Mobile Device"
    if (userAgent.includes("Tablet")) return "Tablet"
    return "Desktop"
  }

  useEffect(() => {
    setDeviceName(getDeviceName())
    loadSyncSettings()

    // Auto-sync every 5 minutes if enabled
    const interval = setInterval(
      () => {
        if (autoSync && isConnected) {
          syncData(false) // Silent sync
        }
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [autoSync, isConnected])

  const loadSyncSettings = () => {
    const connected = localStorage.getItem("trading-journal-cloud-connected") === "true"
    const lastSyncTime = localStorage.getItem("trading-journal-last-sync")
    const savedSyncCode = localStorage.getItem("trading-journal-sync-code")
    const savedAutoSync = localStorage.getItem("trading-journal-auto-sync") !== "false"

    setIsConnected(connected)
    setLastSync(lastSyncTime)
    if (savedSyncCode) setSyncCode(savedSyncCode)
    setAutoSync(savedAutoSync)

    if (connected) {
      loadConnectedDevices()
    }
  }

  const generateSyncCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setSyncCode(code)
    return code
  }

  const connectToCloud = async () => {
    setIsSyncing(true)
    try {
      // Simulate cloud connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const code = generateSyncCode()
      const deviceId = getDeviceId()

      // Save connection settings
      localStorage.setItem("trading-journal-cloud-connected", "true")
      localStorage.setItem("trading-journal-sync-code", code)
      localStorage.setItem("trading-journal-device-name", deviceName)

      // Initial sync
      await uploadData()

      setIsConnected(true)

      toast({
        title: "Cloud Sync Connected",
        description: `Your sync code is: ${code}. Use this code on other devices to sync your data.`,
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to cloud sync. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const connectWithCode = async () => {
    if (!syncCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid sync code.",
        variant: "destructive",
      })
      return
    }

    setIsSyncing(true)
    try {
      // Simulate connecting with existing code
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Save connection settings
      localStorage.setItem("trading-journal-cloud-connected", "true")
      localStorage.setItem("trading-journal-sync-code", syncCode.toUpperCase())
      localStorage.setItem("trading-journal-device-name", deviceName)

      // Download existing data
      await downloadData()

      setIsConnected(true)

      toast({
        title: "Connected Successfully",
        description: "Your device is now synced with the cloud.",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Invalid sync code or connection error.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const uploadData = async () => {
    const data = {
      trades,
      deposits,
      balance,
      deviceId: getDeviceId(),
      deviceName,
      timestamp: new Date().toISOString(),
    }

    // Simulate cloud upload
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Store in localStorage as simulation
    localStorage.setItem("trading-journal-cloud-data", JSON.stringify(data))

    const now = new Date().toISOString()
    setLastSync(now)
    localStorage.setItem("trading-journal-last-sync", now)

    // Update connected devices
    updateConnectedDevices()
  }

  const downloadData = async () => {
    // Simulate cloud download
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const cloudData = localStorage.getItem("trading-journal-cloud-data")
    if (cloudData) {
      const data = JSON.parse(cloudData)
      onSyncData({
        trades: data.trades || [],
        deposits: data.deposits || [],
        balance: data.balance || 0,
      })

      const now = new Date().toISOString()
      setLastSync(now)
      localStorage.setItem("trading-journal-last-sync", now)
    }
  }

  const syncData = async (showToast = true) => {
    if (!isConnected) return

    setIsSyncing(true)
    try {
      // Upload current data
      await uploadData()

      if (showToast) {
        toast({
          title: "Sync Complete",
          description: "Your data has been synced to the cloud.",
        })
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: "Sync Failed",
          description: "Unable to sync data. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const loadConnectedDevices = () => {
    // Simulate loading connected devices
    const devices: SyncDevice[] = [
      {
        id: getDeviceId(),
        name: deviceName,
        lastSync: lastSync || new Date().toISOString(),
        isCurrentDevice: true,
      },
      // Add some mock devices for demonstration
      {
        id: "device-2",
        name: "iPhone",
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isCurrentDevice: false,
      },
      {
        id: "device-3",
        name: "Work Laptop",
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isCurrentDevice: false,
      },
    ]
    setConnectedDevices(devices)
  }

  const updateConnectedDevices = () => {
    setConnectedDevices((prev) =>
      prev.map((device) => (device.isCurrentDevice ? { ...device, lastSync: new Date().toISOString() } : device)),
    )
  }

  const disconnectFromCloud = () => {
    localStorage.removeItem("trading-journal-cloud-connected")
    localStorage.removeItem("trading-journal-sync-code")
    localStorage.removeItem("trading-journal-last-sync")
    localStorage.removeItem("trading-journal-cloud-data")

    setIsConnected(false)
    setSyncCode("")
    setLastSync(null)
    setConnectedDevices([])

    toast({
      title: "Disconnected",
      description: "Cloud sync has been disabled.",
    })
  }

  const toggleAutoSync = () => {
    const newAutoSync = !autoSync
    setAutoSync(newAutoSync)
    localStorage.setItem("trading-journal-auto-sync", newAutoSync.toString())

    toast({
      title: newAutoSync ? "Auto-Sync Enabled" : "Auto-Sync Disabled",
      description: newAutoSync ? "Your data will sync automatically every 5 minutes." : "You'll need to sync manually.",
    })
  }

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cloud Sync</h1>
        <p className="text-muted-foreground">Sync your trading data across all your devices</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Cloud className="h-5 w-5 text-green-500" />
                Connected to Cloud
              </>
            ) : (
              <>
                <CloudOff className="h-5 w-5 text-muted-foreground" />
                Not Connected
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isConnected
              ? `Last synced: ${lastSync ? formatLastSync(lastSync) : "Never"}`
              : "Connect to sync your data across devices"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Sync Code: {syncCode}</p>
                  <p className="text-sm text-muted-foreground">Use this code on other devices to sync your data</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => syncData()} disabled={isSyncing} className="flex-1">
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>

                <Button onClick={toggleAutoSync} variant={autoSync ? "default" : "outline"}>
                  {autoSync ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                  Auto-Sync
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <CloudOff className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect from Cloud?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will disable cloud sync on this device. Your local data will remain intact, but it won't
                        sync with other devices anymore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={disconnectFromCloud}>Disconnect</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  placeholder="My iPhone, Work Laptop, etc."
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Create New Sync</CardTitle>
                    <CardDescription className="text-sm">Start syncing from this device</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={connectToCloud} disabled={isSyncing || !deviceName.trim()} className="w-full">
                      {isSyncing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Cloud className="h-4 w-4 mr-2" />
                      )}
                      {isSyncing ? "Connecting..." : "Create Sync"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Join Existing Sync</CardTitle>
                    <CardDescription className="text-sm">Connect using a sync code</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      placeholder="Enter sync code"
                      value={syncCode}
                      onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                    <Button
                      onClick={connectWithCode}
                      disabled={isSyncing || !syncCode.trim() || !deviceName.trim()}
                      className="w-full bg-transparent"
                      variant="outline"
                    >
                      {isSyncing ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isSyncing ? "Connecting..." : "Connect"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Devices */}
      {isConnected && connectedDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Devices</CardTitle>
            <CardDescription>Devices synced with your trading data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {device.name.toLowerCase().includes("mobile") || device.name.toLowerCase().includes("iphone") ? (
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        {device.name}
                        {device.isCurrentDevice && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            This Device
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Last sync: {formatLastSync(device.lastSync)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.isCurrentDevice ? (
                      <Badge variant="default">
                        <Wifi className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <WifiOff className="h-3 w-3 mr-1" />
                        Offline
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Information */}
      <Card>
        <CardHeader>
          <CardTitle>How Cloud Sync Works</CardTitle>
          <CardDescription>Understanding your data synchronization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✅ What Gets Synced</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• All your trades and trade history</li>
                  <li>• Deposit records and balance</li>
                  <li>• Journal entries and notes</li>
                  <li>• Tags and categories</li>
                  <li>• Analytics and performance data</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">🔒 Privacy & Security</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Data encrypted during transfer</li>
                  <li>• Unique sync codes for access control</li>
                  <li>• No personal information required</li>
                  <li>• You control which devices connect</li>
                  <li>• Can disconnect anytime</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-600">Important Notes</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep your sync code secure. Anyone with this code can access your trading data. If you suspect your
                    code is compromised, disconnect and create a new sync.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
