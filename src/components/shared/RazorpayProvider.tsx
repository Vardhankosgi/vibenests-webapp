import { ReactNode, useEffect, useState } from "react";
import { loadRazorpayCheckoutScript } from "@/lib/razorpay";

export default function RazorpayProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRazorpayCheckoutScript()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep UI responsive; actual payment button will validate SDK.
  return <>{ready ? children : children}</>;
}

