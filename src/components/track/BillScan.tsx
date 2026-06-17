import { useState, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Sparkles, Upload } from "lucide-react";
import { COMMUNITY } from "@/lib/constants";
import { extractBillData, isBillScanAvailable } from "@/lib/gemini";
import { cn } from "@/lib/utils";

export function BillScan({ onScanned }: { onScanned: (kwh: number) => void }) {
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please choose an image (JPG or PNG).");
      return;
    }

    if (file.size > COMMUNITY.maxBillSizeMb * 1024 * 1024) {
      setStatus("error");
      setMessage(`Image is too large - keep it under ${COMMUNITY.maxBillSizeMb} MB.`);
      return;
    }

    setStatus("scanning");
    setMessage("");
    try {
      const { monthlyKwh } = await extractBillData(file);
      if (monthlyKwh) {
        onScanned(monthlyKwh);
        setStatus("done");
        setMessage(`Read ~${monthlyKwh} kWh/month from your bill. Adjust if needed.`);
      } else {
        setStatus("error");
        setMessage("Couldn't find the units on that bill - please enter them manually.");
      }
    } catch {
      setStatus("error");
      setMessage("Scan failed - please enter your usage manually.");
    }
  };

  if (!isBillScanAvailable) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
        <Upload className="size-4 shrink-0" aria-hidden /> Bill scanning is available on the live
        app.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        className={cn(
          "flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm font-medium transition-colors",
          status === "scanning"
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-primary/30 bg-primary/[0.04] text-primary hover:bg-primary/10",
        )}
      >
        {status === "scanning" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="size-4" aria-hidden />
        )}
        {status === "scanning" ? "Reading your bill..." : "Scan an electricity bill with AI"}
        <input
          id="bill-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
          disabled={status === "scanning"}
        />
      </label>
      {message && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={cn(
            "flex items-center gap-1.5 text-xs",
            status === "done" ? "text-success" : "text-destructive",
          )}
        >
          {status === "done" ? (
            <CheckCircle2 className="size-3.5" aria-hidden />
          ) : (
            <AlertCircle className="size-3.5" aria-hidden />
          )}
          {message}
        </p>
      )}
    </div>
  );
}
