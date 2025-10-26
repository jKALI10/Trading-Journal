"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Lock, Copy, Check } from "lucide-react";
import {
  hashPassword,
  generateToken,
  verifyPassword,
  generateRecoveryCode,
  hashRecoveryCode,
  verifyRecoveryCode,
} from "@/utils/auth";

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "setup" | "recover">("login");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const checkIfPasswordExists = () => {
    return !!localStorage.getItem("trading-journal-password-hash");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadRecoveryCode = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `Trading Journal - Recovery Code\n` +
          `================================\n\n` +
          `Your recovery code: ${generatedCode}\n\n` +
          `Save this code somewhere safe. You'll need it if you forget your password.\n` +
          `Do NOT share this code with anyone.\n\n` +
          `Generated: ${new Date().toLocaleString()}`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `trading-journal-recovery-code.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are identical.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const passwordHash = await hashPassword(password);
      const code = generateRecoveryCode();
      const recoveryHash = await hashRecoveryCode(code);

      localStorage.setItem("trading-journal-password-hash", passwordHash);
      localStorage.setItem("trading-journal-recovery-code-hash", recoveryHash);

      setGeneratedCode(code);
      setMode("setup");

      toast({
        title: "Password set successfully",
        description: "Save your recovery code in a safe place!",
      });
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "An error occurred while setting up your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storedHash = localStorage.getItem("trading-journal-password-hash");

      if (!storedHash) {
        toast({
          title: "No password set",
          description: "Please set up a password first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const isPasswordCorrect = await verifyPassword(password, storedHash);

      if (!isPasswordCorrect) {
        toast({
          title: "Invalid password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const token = generateToken();
      localStorage.setItem("trading-journal-auth-token", token);

      toast({
        title: "Login successful",
        description: "Welcome back to your trading journal!",
      });

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storedRecoveryHash = localStorage.getItem(
        "trading-journal-recovery-code-hash"
      );

      if (!storedRecoveryHash) {
        toast({
          title: "No recovery code found",
          description: "Recovery is not available for this account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const isCodeValid = await verifyRecoveryCode(
        recoveryCode,
        storedRecoveryHash
      );

      if (!isCodeValid) {
        toast({
          title: "Invalid recovery code",
          description: "The recovery code you entered is incorrect.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are identical.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const newPasswordHash = await hashPassword(newPassword);
      localStorage.setItem("trading-journal-password-hash", newPasswordHash);

      toast({
        title: "Password reset successfully",
        description: "You can now login with your new password.",
      });

      setMode("login");
      setRecoveryCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast({
        title: "Recovery failed",
        description: "An error occurred during password recovery.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordExists = checkIfPasswordExists();

  // Setup confirmation - show recovery code
  if (mode === "setup" && generatedCode) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Account Secured!
            </CardTitle>
            <CardDescription className="text-center">
              Save your recovery code in a safe place
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> Save this recovery code. You'll
                  need it to reset your password if you forget it.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-center break-all">
              <p className="text-lg font-bold tracking-wider">
                {generatedCode}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={copyToClipboard}
                disabled={copiedCode}
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={downloadRecoveryCode}
              >
                Download
              </Button>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                const token = generateToken();
                localStorage.setItem("trading-journal-auth-token", token);
                setTimeout(() => {
                  window.location.reload();
                }, 800);
              }}
            >
              Continue to Dashboard
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You can download or copy this code later from your browser's local
              storage.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Recovery mode - reset password with recovery code
  if (mode === "recover") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your recovery code to set a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecoverPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-code">Recovery Code</Label>
                <Input
                  id="recovery-code"
                  type="text"
                  placeholder="e.g., XXXX-XXXX-XXXX"
                  value={recoveryCode}
                  onChange={(e) =>
                    setRecoveryCode(e.target.value.toUpperCase())
                  }
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the recovery code you saved when setting up your account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode("login");
                  setRecoveryCode("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Setup mode - initial password setup
  if (!passwordExists) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Secure Your Account
            </CardTitle>
            <CardDescription className="text-center">
              Set up a password to protect your trading data from unauthorized
              access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetupPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setup-password">Create Password</Label>
                <Input
                  id="setup-password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup-confirm">Confirm Password</Label>
                <Input
                  id="setup-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> Your password is stored locally
                    and cannot be recovered if forgotten. A recovery code will
                    be generated for you to save.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Setting up..." : "Secure My Account"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your data will be protected by this password from now on.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login mode
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Trading Journal
          </CardTitle>
          <CardDescription className="text-center">
            Enter your password to access your trading data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Your data is encrypted and stored
                locally on your device.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setMode("recover");
                setPassword("");
              }}
              disabled={isLoading}
            >
              Forgot your password? Use recovery code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
