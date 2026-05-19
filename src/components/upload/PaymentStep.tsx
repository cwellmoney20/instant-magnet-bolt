import { useState, useEffect, useRef } from 'react';

interface PaymentStepProps {
  clientSecret: string;
  publishableKey: string;
  amountCents: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance;
  }
}

interface StripeInstance {
  elements: (options?: object) => StripeElements;
  confirmCardPayment: (
    clientSecret: string,
    data: object
  ) => Promise<{ error?: { message?: string }; paymentIntent?: { status: string } }>;
}

interface StripeElements {
  create: (type: string, options?: object) => StripeElement;
}

interface StripeElement {
  mount: (selector: string | HTMLElement) => void;
  unmount: () => void;
  on: (event: string, handler: (e: { error?: { message?: string } }) => void) => void;
}

function loadStripeScript(publishableKey: string): Promise<StripeInstance> {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe(publishableKey));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      if (window.Stripe) {
        resolve(window.Stripe(publishableKey));
      } else {
        reject(new Error('Stripe.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.head.appendChild(script);
  });
}

export default function PaymentStep({
  clientSecret,
  publishableKey,
  amountCents,
  onSuccess,
  onError,
}: PaymentStepProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<StripeInstance | null>(null);
  const cardElementRef = useRef<StripeElement | null>(null);
  const [cardError, setCardError] = useState('');
  const [paying, setPaying] = useState(false);
  const [ready, setReady] = useState(false);

  const amountDisplay = `$${(amountCents / 100).toFixed(2)}`;

  useEffect(() => {
    let mounted = true;

    loadStripeScript(publishableKey)
      .then((stripe) => {
        if (!mounted || !cardRef.current) return;
        stripeRef.current = stripe;

        const elements = stripe.elements({
          fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500&display=swap' }],
        });

        const card = elements.create('card', {
          style: {
            base: {
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '16px',
              color: '#1c1917',
              '::placeholder': { color: '#a8a29e' },
            },
            invalid: { color: '#dc2626' },
          },
        });

        card.mount(cardRef.current);
        card.on('change', (e) => {
          setCardError(e.error?.message ?? '');
        });
        cardElementRef.current = card;
        setReady(true);
      })
      .catch(() => {
        if (mounted) onError('Failed to load payment form. Please refresh and try again.');
      });

    return () => {
      mounted = false;
      cardElementRef.current?.unmount();
    };
  }, [publishableKey]);

  async function handlePay() {
    if (!stripeRef.current || !cardElementRef.current || paying) return;
    setPaying(true);
    setCardError('');

    const result = await stripeRef.current.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElementRef.current },
    });

    setPaying(false);

    if (result.error) {
      setCardError(result.error.message ?? 'Payment failed. Please try again.');
    } else if (result.paymentIntent?.status === 'succeeded') {
      onSuccess();
    }
  }

  return (
    <div>
      <div className="mb-6">
        <span className="dymo-label text-[10px] mb-2 inline-block">PAYMENT</span>
        <h2 className="font-jakarta font-bold text-xl text-on-surface">Complete Payment</h2>
        <p className="font-jakarta text-sm text-on-surface-variant mt-1">
          A one-time payment is required to save your photo.
        </p>
      </div>

      {/* Price display */}
      <div className="bg-primary-container rounded-xl px-5 py-4 mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono-brand text-label-tag text-on-primary-container/70">AMOUNT DUE</p>
          <p className="font-jakarta font-bold text-2xl text-on-primary-container mt-0.5">{amountDisplay}</p>
        </div>
        <span className="material-symbols-outlined text-3xl text-on-primary-container/50">credit_card</span>
      </div>

      {/* Card input */}
      <div className="mb-2">
        <label className="block font-mono-brand text-label-tag text-on-surface-variant mb-2">
          CARD DETAILS
        </label>
        <div
          ref={cardRef}
          className={`w-full px-4 py-3.5 bg-surface rounded-lg border transition-colors ${
            cardError ? 'border-error' : 'border-outline-variant focus-within:border-primary'
          }`}
          style={{ minHeight: '48px' }}
        />
        {cardError && (
          <p className="mt-1.5 font-jakarta text-sm text-error">{cardError}</p>
        )}
      </div>

      <p className="font-jakarta text-xs text-on-surface-variant mb-6 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">lock</span>
        Secured by Stripe. Your card details are never stored.
      </p>

      {!ready && (
        <div className="flex items-center justify-center py-4">
          <span className="material-symbols-outlined animate-spin text-on-surface-variant">sync</span>
        </div>
      )}

      {ready && (
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-4 rounded-xl bg-primary text-on-primary font-jakarta font-bold text-base btn-extruded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {paying ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
              Processing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">lock</span>
              Pay {amountDisplay}
            </>
          )}
        </button>
      )}

      <p className="font-jakarta text-xs text-on-surface-variant text-center mt-4">
        By paying you agree to save your photo to this event.
      </p>
    </div>
  );
}
