import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventFormFields, { type FormValues } from '../components/events/EventFormFields';
import CoverPhotoUploader from '../components/events/CoverPhotoUploader';
import SlugField from '../components/events/SlugField';
import QRCodeDisplay from '../components/ui/QRCodeDisplay';
import ExtrudedButton from '../components/ui/ExtrudedButton';
import DymoLabel from '../components/ui/DymoLabel';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreateEvent, planLoading } = usePlan();

  // Redirect if limit reached
  useEffect(() => {
    if (!planLoading && !canCreateEvent) {
      navigate('/upgrade');
    }
  }, [canCreateEvent, planLoading, navigate]);
  const [values, setValues] = useState<FormValues>({
    title: '',
    event_type: 'wedding',
    date: '',
    time: '',
    location: '',
    description: '',
    is_paid_event: false,
    photo_price_cents: null,
  });
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (values.title) {
      setSlug(slugify(values.title));
    }
  }, [values.title]);

  const publicUrl = slug ? `${window.location.origin}/upload/${slug}` : '';

  function handleChange(field: keyof FormValues, value: string | boolean | number | null) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const newErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.title.trim()) newErrors.title = 'Title is required';
    if (!values.date) newErrors.date = 'Date is required';
    if (!slug.trim()) setSlugError('Slug is required');
    if (values.is_paid_event && (values.photo_price_cents === null || values.photo_price_cents < 50)) {
      newErrors.photo_price_cents = 'Price must be at least $0.50.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && slug.trim() !== '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);

    let coverPath: string | null = null;

    if (coverFile) {
      const ext = coverFile.name.split('.').pop();
      const filename = `covers/${slug}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(filename, coverFile);
      if (uploadError) {
        setSubmitError('Failed to upload cover photo. Please try again.');
        setSubmitting(false);
        return;
      }
      coverPath = filename;
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: values.title.trim(),
        description: values.description.trim() || null,
        event_type: values.event_type,
        date: values.date,
        time: values.time || null,
        location: values.location.trim() || null,
        cover_photo_path: coverPath,
        slug,
        status: 'active',
        is_paid_event: values.is_paid_event,
        photo_price_cents: values.is_paid_event ? values.photo_price_cents : null,
        user_id: user?.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        setSlugError('This slug is already taken. Please choose a different one.');
      } else if (error.message?.includes('Free plan limit reached')) {
        navigate('/upgrade');
        return;
      } else {
        setSubmitError('Failed to create event. Please try again.');
      }
      setSubmitting(false);
      return;
    }

    navigate(`/events/${data.id}`);
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-5xl">
      <div className="mb-8">
        <DymoLabel className="mb-3 inline-block">NEW EVENT</DymoLabel>
        <h1 className="font-jakarta font-bold text-headline-lg-mobile md:text-4xl text-on-surface">
          Create an Event
        </h1>
        <p className="font-jakarta text-body-md text-on-surface-variant mt-2">
          Set up your event and share the QR code with guests.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="font-jakarta font-bold text-lg text-on-surface mb-6">Event Details</h2>
              <EventFormFields values={values} onChange={handleChange} errors={errors} />
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="font-jakarta font-bold text-lg text-on-surface mb-6">Cover Photo</h2>
              <CoverPhotoUploader
                value={coverFile}
                preview={coverPreview}
                onChange={(file, preview) => {
                  setCoverFile(file);
                  setCoverPreview(preview);
                }}
                onRemove={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
              />
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="font-jakarta font-bold text-lg text-on-surface mb-6">Public URL</h2>
              <SlugField value={slug} onChange={setSlug} error={slugError} />
            </div>
          </div>

          {/* Sidebar: QR Preview + Submit */}
          <div className="space-y-6">
            <div className="bg-surface-container-low rounded-xl border border-outline-variant p-6 shadow-sm sticky top-28">
              <DymoLabel className="mb-4 inline-block">QR PREVIEW</DymoLabel>

              <div className="flex flex-col items-center gap-4 mb-6">
                {slug ? (
                  <QRCodeDisplay
                    value={publicUrl}
                    size={160}
                    caption={`/upload/${slug}`}
                  />
                ) : (
                  <div className="w-44 h-44 bg-surface-container-high rounded-lg flex items-center justify-center border-2 border-dashed border-outline-variant">
                    <p className="font-mono-brand text-[10px] text-on-surface-variant text-center px-4">
                      QR CODE WILL APPEAR HERE
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-on-surface-variant border-t border-outline-variant pt-4">
                <div className="flex justify-between">
                  <span className="font-mono-brand text-label-tag">TITLE</span>
                  <span className="font-jakarta text-on-surface truncate max-w-28">
                    {values.title || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono-brand text-label-tag">DATE</span>
                  <span className="font-jakarta text-on-surface">{values.date || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono-brand text-label-tag">TYPE</span>
                  <span className="font-jakarta text-on-surface capitalize">{values.event_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono-brand text-label-tag">PRICING</span>
                  <span className="font-jakarta text-on-surface">
                    {values.is_paid_event && values.photo_price_cents
                      ? `$${(values.photo_price_cents / 100).toFixed(2)}`
                      : 'Free'}
                  </span>
                </div>
              </div>

              {submitError && (
                <p className="mt-4 font-jakarta text-sm text-error bg-error-container rounded-lg p-3">
                  {submitError}
                </p>
              )}

              <div className="flex flex-col gap-3 mt-6">
                <ExtrudedButton
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="w-full justify-center"
                  icon={
                    submitting
                      ? <span className="material-symbols-outlined text-base animate-spin">sync</span>
                      : <span className="material-symbols-outlined text-base">check_circle</span>
                  }
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </ExtrudedButton>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3 font-mono-brand text-label-tag text-on-surface-variant hover:text-on-surface transition-colors text-center"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
