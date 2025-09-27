"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, ShieldCheck, QrCode } from "lucide-react";
import { SELF_CONFIG } from "@/config/self";

type VerificationResult = {
  address?: string;
  scope?: string;
  passed?: boolean;
  raw?: unknown;
};

type Props = {
  onVerified: (r: VerificationResult) => void;
  disabled?: boolean;
  userAddress?: string | null;
};

export function SelfVerification({ onVerified, disabled, userAddress }: Props) {
  const [open, setOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkMissing, setSdkMissing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo(() => SELF_CONFIG, []);

  const startSdk = useCallback(async () => {
    setError(null);
    setSdkMissing(false);
    setVerifying(true);
    try {
      const sdk: any =
        (window as any).SelfQRCodeSDK || (window as any).Self || (window as any).SelfQR;

      if (!sdk || typeof sdk.init !== "function") {
        setSdkMissing(true);
        return;
      }

      // Best-effort call — aligns with Self QRCode SDK patterns.
      await sdk.init({
        container: containerRef.current,
        network: config.network,
        contractAddress: config.contractAddress,
        identityVerificationHubV2Address: config.identityVerificationHubV2Address,
        scope: config.scope,
        verificationConfigId: config.verificationConfigId,
        // Request rule: age >= 18 — encoded in the verification config on-chain
        // We only need to receive a success callback here.
        onSuccess: (payload: any) => {
          onVerified({
            address: payload?.address ?? userAddress ?? undefined,
            scope: config.scope,
            passed: true,
            raw: payload,
          });
          setOpen(false);
        },
        onError: (e: any) => {
          setError(typeof e === "string" ? e : e?.message ?? "Verification failed");
        },
      });
    } catch (e: any) {
      setError(e?.message ?? "Unable to start verification");
    } finally {
      setVerifying(false);
    }
  }, [config, onVerified, userAddress]);

  useEffect(() => {
    if (open) {
      // Kick off the SDK when the dialog opens
      void startSdk();
    } else {
      setError(null);
      setSdkMissing(false);
    }
  }, [open, startSdk]);

  return (
    <>
      <Button type="button" variant="outline" disabled={!!disabled} onClick={() => setOpen(true)}>
        <QrCode className="mr-2 h-4 w-4" /> Verify age with Self
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" /> Identity Verification
            </DialogTitle>
          </DialogHeader>

          {sdkMissing && (
            <Alert className="mb-3" variant="destructive">
              <AlertDescription>
                Self QRCode SDK not detected. To enable live verification, add the SDK per
                Self docs. Meanwhile, you can proceed in mock mode.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-3" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div ref={containerRef} className="flex items-center justify-center min-h-40">
            {verifying && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing verification...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Network: {config.network}</span>
            <span>Scope: {config.scope.slice(0, 10)}...</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
