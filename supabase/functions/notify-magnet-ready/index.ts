import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let photoId: string;
    let guestId: string;

    if (payload.photoId) {
      // Called directly from the UI with { photoId }
      const { data: photo, error: photoError } = await supabase
        .from('photos')
        .select('id, event_guest_id, status')
        .eq('id', payload.photoId)
        .maybeSingle();

      if (photoError || !photo) {
        return new Response(JSON.stringify({ error: 'Photo not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (photo.status !== 'completed') {
        return new Response(JSON.stringify({ message: 'Photo is not completed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      photoId = photo.id;
      guestId = photo.event_guest_id;
    } else {
      // Webhook shape: { record: { id, event_guest_id, status, ... } }
      const photo = payload.record;
      if (!photo || photo.status !== 'completed') {
        return new Response(JSON.stringify({ message: 'Not a completed status change' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      photoId = photo.id;
      guestId = photo.event_guest_id;
    }

    // Get guest info + event title
    const { data: guest, error: guestError } = await supabase
      .from('event_guests')
      .select('id, name, email, event_id, events(title)')
      .eq('id', guestId)
      .maybeSingle();

    if (guestError || !guest) {
      console.error('Guest not found:', guestError);
      return new Response(JSON.stringify({ error: 'Guest not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing sent notification for this specific photo (prevent duplicates)
    const { data: existingNotification } = await supabase
      .from('email_notifications')
      .select('id')
      .eq('photo_id', photoId)
      .eq('status', 'sent')
      .maybeSingle();

    if (existingNotification) {
      return new Response(JSON.stringify({ message: 'Notification already sent for this photo' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert pending notification record
    const { data: notification, error: notifError } = await supabase
      .from('email_notifications')
      .insert({
        event_guest_id: guest.id,
        photo_id: photoId,
        email: guest.email,
        type: 'magnet_ready',
        status: 'pending',
      })
      .select()
      .single();

    if (notifError || !notification) {
      console.error('Failed to create notification record:', notifError);
      return new Response(JSON.stringify({ error: 'Failed to create notification record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const eventTitle = (guest as any).events?.title ?? 'your event';

    if (!resendApiKey) {
      // Log as sent in dev environments without Resend configured
      await supabase
        .from('email_notifications')
        .update({ status: 'failed', error_message: 'RESEND_API_KEY not configured' })
        .eq('id', notification.id);

      return new Response(JSON.stringify({ message: 'Resend not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'InstantEvent <hello@contact.magletes.com>',
        to: [guest.email],
        subject: `Your photo magnet is ready! 📸`,
        html: `
          <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9f9f7;">
            <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #d1c6ab; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-family: Space Mono, monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; background: #bb1615; color: white; padding: 4px 10px; text-transform: uppercase;">
                  MAGNET READY
                </span>
              </div>
              <h1 style="font-size: 26px; font-weight: 700; color: #1a1c1b; margin: 0 0 12px; text-align: center;">
                Your magnet is ready, ${guest.name}!
              </h1>
              <p style="font-size: 16px; color: #4e4632; line-height: 1.6; text-align: center; margin: 0 0 24px;">
                Your photo magnet from <strong>${eventTitle}</strong> has been completed and is ready for you.
              </p>
              <p style="font-size: 14px; color: #80765f; text-align: center; line-height: 1.5;">
                Please see the event organizer to collect your magnet.
              </p>
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #d1c6ab; text-align: center;">
                <p style="font-family: Space Mono, monospace; font-size: 11px; color: #80765f; letter-spacing: 0.05em;">
                  INSTANTEVENT · PHOTO MAGNETS
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      await supabase
        .from('email_notifications')
        .update({ status: 'failed', error_message: errText })
        .eq('id', notification.id);

      return new Response(JSON.stringify({ error: 'Email send failed', detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as sent
    await supabase
      .from('email_notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', notification.id);

    return new Response(JSON.stringify({ success: true, email: guest.email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
