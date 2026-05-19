import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventBanner from '../components/upload/EventBanner';
import GuestInfoForm from '../components/upload/GuestInfoForm';
import PhotoDropzone from '../components/upload/PhotoDropzone';
import CropTool from '../components/upload/CropTool';
import PaymentStep from '../components/upload/PaymentStep';
import UploadConfirmation from '../components/upload/UploadConfirmation';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';

type Step = 'info' | 'pick' | 'crop' | 'payment' | 'done';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function GuestUploadPage() {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<Step>('info');
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Payment state
  const [paymentClientSecret, setPaymentClientSecret] = useState('');
  const [paymentPublishableKey, setPaymentPublishableKey] = useState('');
  const [paymentAmountCents, setPaymentAmountCents] = useState(0);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (slug) loadEvent();
  }, [slug]);

  async function loadEvent() {
    setLoadingEvent(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (!data) setNotFound(true);
    else setEvent(data);
    setLoadingEvent(false);
  }

  async function handleGuestInfo(name: string, email: string) {
    if (!event) return;
    setGuestLoading(true);
    setGuestEmail(email);

    // Try INSERT first; fall back to SELECT if the guest already exists
    const { data: inserted } = await supabase
      .from('event_guests')
      .insert({ event_id: event.id, name, email })
      .select('id')
      .maybeSingle();

    if (inserted) {
      setGuestId(inserted.id);
    } else {
      const { data: existing } = await supabase
        .from('event_guests')
        .select('id')
        .eq('event_id', event.id)
        .eq('email', email)
        .maybeSingle();

      if (existing) setGuestId(existing.id);
    }

    setGuestLoading(false);
    setStep('pick');
  }

  function handleFileSelected(file: File) {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep('crop');
  }

  async function handleCropComplete(croppedBlob: Blob) {
    if (!event || !guestId) return;
    setUploading(true);
    setUploadError('');

    const ext = imageFile?.name.split('.').pop() ?? 'jpg';
    const filename = `events/${event.id}/${guestId}-${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from('event-photos')
      .upload(filename, croppedBlob, { contentType: 'image/jpeg' });

    if (storageError) {
      setUploadError('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    const paymentStatus = event.is_paid_event ? 'unpaid' : 'free';

    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        event_id: event.id,
        event_guest_id: guestId,
        storage_path: filename,
        status: 'new',
        payment_status: paymentStatus,
      })
      .select('id')
      .maybeSingle();

    if (dbError || !photoData) {
      setUploadError('Failed to save photo. Please try again.');
      setUploading(false);
      return;
    }

    if (!event.is_paid_event) {
      setUploading(false);
      setStep('done');
      return;
    }

    // Paid event: create PaymentIntent and show payment step
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            event_id: event.id,
            guest_id: guestId,
            photo_id: photoData.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        setUploadError(result.error ?? 'Failed to initialize payment. Please try again.');
        setUploading(false);
        return;
      }

      setPaymentClientSecret(result.client_secret);
      setPaymentPublishableKey(result.publishable_key);
      setPaymentAmountCents(result.amount);
      setUploading(false);
      setStep('payment');
    } catch {
      setUploadError('Failed to initialize payment. Please try again.');
      setUploading(false);
    }
  }

  function handleUploadAnother() {
    setImageFile(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setUploadError('');
    setPaymentError('');
    setStep('pick');
  }

  const totalSteps = event?.is_paid_event ? 4 : 3;

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">sync</span>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">
          search_off
        </span>
        <h1 className="font-jakarta font-bold text-2xl text-on-surface mb-2">Event Not Found</h1>
        <p className="font-jakarta text-body-md text-on-surface-variant">
          This event link is no longer active or doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-surface-container-lowest shadow-xl">
        <EventBanner event={event} />

        <div className="flex-1 px-6 py-6">
          {step === 'info' && (
            <div>
              <div className="mb-6">
                <span className="dymo-label text-[10px] mb-2 inline-block">STEP 1 OF {totalSteps}</span>
                <h2 className="font-jakarta font-bold text-xl text-on-surface">Your Details</h2>
                {event.description && (
                  <p className="font-jakarta text-sm text-on-surface-variant mt-1">{event.description}</p>
                )}
              </div>
              <GuestInfoForm onSubmit={handleGuestInfo} loading={guestLoading} />
            </div>
          )}

          {step === 'pick' && (
            <div>
              <div className="mb-6">
                <span className="dymo-label text-[10px] mb-2 inline-block">STEP 2 OF {totalSteps}</span>
                <h2 className="font-jakarta font-bold text-xl text-on-surface">Choose Your Photo</h2>
                <p className="font-jakarta text-sm text-on-surface-variant mt-1">
                  Pick a photo that will be turned into your magnet.
                </p>
              </div>
              <PhotoDropzone onFileSelected={handleFileSelected} />
            </div>
          )}

          {step === 'crop' && imageUrl && (
            <div>
              <div className="mb-4">
                <span className="dymo-label text-[10px] mb-2 inline-block">STEP 3 OF {totalSteps}</span>
              </div>
              {uploadError && (
                <div className="mb-4 bg-error-container text-on-error-container font-jakarta text-sm px-4 py-3 rounded-xl">
                  {uploadError}
                </div>
              )}
              <CropTool
                imageUrl={imageUrl}
                onCropComplete={handleCropComplete}
                onCancel={() => setStep('pick')}
                uploading={uploading}
              />
            </div>
          )}

          {step === 'payment' && paymentClientSecret && (
            <div>
              {paymentError && (
                <div className="mb-4 bg-error-container text-on-error-container font-jakarta text-sm px-4 py-3 rounded-xl">
                  {paymentError}
                </div>
              )}
              <PaymentStep
                clientSecret={paymentClientSecret}
                publishableKey={paymentPublishableKey}
                amountCents={paymentAmountCents}
                onSuccess={() => setStep('done')}
                onError={(msg) => setPaymentError(msg)}
              />
            </div>
          )}

          {step === 'done' && (
            <UploadConfirmation
              eventTitle={event.title}
              guestEmail={guestEmail}
              onUploadAnother={handleUploadAnother}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-outline-variant text-center">
          <p className="font-mono-brand text-[10px] text-on-surface-variant">
            POWERED BY INSTANTEVENT
          </p>
        </div>
      </div>
    </div>
  );
}
