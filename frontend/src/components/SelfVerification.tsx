"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, ShieldCheck, QrCode } from "lucide-react";
import { SELF_CONFIG } from "@/config/self";
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode";
import { hashEndpointWithScope, formatEndpoint } from "@selfxyz/common";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const [debugAppInfo, setDebugAppInfo] = useState<any | null>(null);
  const [debugEndpointHash, setDebugEndpointHash] = useState<string | null>(
    null
  );

  const cfg = useMemo(() => SELF_CONFIG, []);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSelfApp(null);
      return;
    }

    // Build the SelfApp using official SDK per docs
    setLoading(true);
    try {
      if (!cfg.scope || !cfg.endpoint) {
        setError(
          "Self config missing: ensure NEXT_PUBLIC_SELF_SCOPE and NEXT_PUBLIC_SELF_ENDPOINT are set."
        );
        return;
      }

      const userId = userAddress;
      const appInput = {
        version: 2,
        appName: cfg.appName,
        scope: cfg.scope,
        endpoint: cfg.endpoint || undefined,
        logoBase64: cfg.logoUrl,
        userId,
        endpointType: cfg.endpointType as any,
        userIdType: "hex" as const,
        userDefinedData: "EthGlobal Delhi demo",
        disclosures: {
          minimumAge: 18,
        },
      };
      const app = new SelfAppBuilder(appInput).build();
      console.log("app", app);
      setSelfApp(app);
      setDebugAppInfo(appInput);
      try {
        const ep = appInput.endpoint || "";
        const sc = appInput.scope || "";
        if (ep && sc) {
          const formatted = formatEndpoint(ep);
          const h = hashEndpointWithScope(ep, sc);
          console.log("Self endpoint formatted:", formatted, "hash:", h);
          setDebugEndpointHash(h);
        } else {
          setDebugEndpointHash(null);
        }
      } catch {
        setDebugEndpointHash(null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to build Self app");
    } finally {
      setLoading(false);
    }
  }, [open, cfg, userAddress]);

  const handleSuccess = (payload?: any) => {
    onVerified({
      address: userAddress || payload?.address,
      scope: cfg.scope,
      passed: true,
      raw: payload,
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={!!disabled}
        onClick={() => setOpen(true)}
      >
        <QrCode className="mr-2 h-4 w-4" /> Verify age with Self
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" /> Identity Verification
            </DialogTitle>
          </DialogHeader>

          {error && (
            <Alert className="mb-3" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center min-h-40 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing QR
              Code…
            </div>
          )}

          {!loading && selfApp && (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccess}
              onError={(e: any) => {
                setError(
                  typeof e === "string"
                    ? e
                    : e?.message ?? "Verification failed"
                );
              }}
            />
          )}

          {!loading && selfApp && cfg.mockVerification && (
            <div className="flex justify-end mt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSuccess({ mock: true })}
              >
                Use Mock Verification
              </Button>
            </div>
          )}

          {!loading && selfApp && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                View Self App (debug)
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(selfApp, null, 2)}
              </pre>
            </details>
          )}

          {!loading && !selfApp && (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  Self configuration incomplete. Add NEXT_PUBLIC_SELF_* envs to
                  enable live verification. Using mock verification for now.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSuccess({ mock: true })}
                >
                  Use Mock Verification
                </Button>
              </div>
            </div>
          )}

          {!!debugAppInfo && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                View Self App Input (debug)
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(debugAppInfo, null, 2)}
              </pre>
              {debugEndpointHash && (
                <div className="mt-2 text-xs">
                  <div>Endpoint hash (scope-bound):</div>
                  <code className="break-all">{debugEndpointHash}</code>
                </div>
              )}
            </details>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
            <span>Network: {cfg.endpointType}</span>
            <span>Scope: {cfg.scope?.slice(0, 10)}...</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
