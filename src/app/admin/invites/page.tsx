"use client";
export const dynamic = "force-dynamic";

import { useState, useTransition } from "react";
import { generateInviteCode, getInviteCodes } from "@/server/actions/invite-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Plus, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface InviteCode {
  id: string;
  code: string;
  createdBy: string | null;
  usedBy: string | null;
  usedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

function getStatus(code: InviteCode): "used" | "expired" | "active" {
  if (code.usedBy) return "used";
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) return "expired";
  return "active";
}

export default function AdminInvitesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [expiresInDays, setExpiresInDays] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadCodes() {
    const result = await getInviteCodes();
    if ("codes" in result) setCodes(result.codes as InviteCode[]);
  }

  useEffect(() => {
    loadCodes();
  }, []);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const days = expiresInDays ? parseInt(expiresInDays, 10) : undefined;
      const result = await generateInviteCode(days);
      if ("error" in result) {
        setError(result.error ?? "Unknown error");
      } else {
        await loadCodes();
      }
    });
  }

  async function handleCopy(code: string, id: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Invite Codes</h1>
      <p className="text-muted-foreground mb-6">
        Generate and manage invite codes for new user registrations.
      </p>

      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Generate New Code
        </h2>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Expires in days (optional)"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            className="max-w-xs"
            min="1"
          />
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Plus className="size-4 mr-2" />
            )}
            Generate Code
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Code
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Created By
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Used By
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Expires
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Created
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No invite codes yet.
                </td>
              </tr>
            )}
            {codes.map((c) => {
              const status = getStatus(c);
              return (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold tracking-widest text-foreground">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.createdBy ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        status === "active"
                          ? "default"
                          : status === "used"
                          ? "secondary"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.usedBy ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(c.code, c.id)}
                      title="Copy code"
                    >
                      {copiedId === c.id ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
