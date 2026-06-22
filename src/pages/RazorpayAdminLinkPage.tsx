import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { loadRazorpayCheckoutScript } from '@/lib/razorpay';
import { Loader2, Check, AlertCircle } from 'lucide-react';

type Status = 'loading' | 'ready' | 'success' | 'failed' | 'error';

export default function RazorpayAdminLinkPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();

  const bookingId = useMemo(() => {
    const v = searchParams.get('bookingId');
    return v ? Number(v) : null;
  }, [searchParams]);

  const paymentId = useMemo(() => {
    const v = searchParams.get('paymentId');
    return v ? Number(v) : null;
  }, [searchParams]);

  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!orderId || !bookingId || !paymentId) {
      setStatus('error');
      setErrorMsg('Invalid payment link. Missing parameters.');
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        setStatus('loading');
        setErrorMsg('');

        await loadRazorpayCheckoutScript();
        if (cancelled) return;

        const apiBase = process.env.VITE_API_BASE || 'https://api.vibenests.in';

        const res = await fetch(`${apiBase}/payments-links-public/payments/create-order-for-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, paymentId, orderId }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || `HTTP ${res.status}`);
        }

        const payload = await res.json();
        if (cancelled) return;

        const { keyId, amount, currency, razorpayOrderId } = payload;

        if (!keyId || !razorpayOrderId) {
          throw new Error('Backend did not return Razorpay checkout options.');
        }

        const options: any = {
          key: keyId,
          amount: Math.round(Number(amount) * 100),
          currency: currency || 'INR',
          name: 'VibeNests',
          description: `Booking VN${bookingId}`,
          order_id: razorpayOrderId,
          handler: async function () {
            // In this MVP version, we don't call /payments/verify-payment from the client.
            // Booking confirmation happens asynchronously via Razorpay webhook.
            if (cancelled) return;
            setStatus('success');
          },
          modal: {
            ondismiss: function () {
              // If user closes checkout, keep booking pending.
            },
          },
        };

        setStatus('ready');
        const rzp = (window as any).Razorpay(options);
        rzp.open();
      } catch (e: any) {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(e?.message || 'Failed to initialize Razorpay checkout');
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [orderId, bookingId, paymentId]);

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => navigate('/user/dashboard', { replace: true }), 1500);
      return () => clearTimeout(t);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.015_260)] flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-md w-full glass-card rounded-3xl p-6 text-center border border-gold/20 space-y-6">
        <h2 className="font-display text-2xl font-semibold text-gradient-gold">VibeNests Payment</h2>
        
        <div className="py-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <p className="text-sm text-muted-foreground">Please wait…</p>
            </div>
          )}
          {status === 'ready' && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <p className="text-sm text-muted-foreground">Opening Razorpay checkout…</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-3 text-emerald-400">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-sm font-medium">Payment received. Booking will be confirmed shortly.</p>
            </div>
          )}
          {(status === 'failed' || status === 'error') && (
            <div className="flex flex-col items-center gap-3 text-rose-400">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-rose-400" />
              </div>
              <p className="text-sm font-medium">Something went wrong.</p>
              {errorMsg && <p className="text-xs text-muted-foreground bg-rose-500/5 px-3 py-1.5 rounded-xl border border-rose-500/10 break-words w-full">{errorMsg}</p>}
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
          Closing this page won’t cancel the payment. Final status updates are handled via Razorpay webhook.
        </p>
      </div>
    </div>
  );
}

