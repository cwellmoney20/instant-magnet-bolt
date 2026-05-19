import { supabase } from './supabase';
import type { PhotoStatus } from '../types/database';

export interface StatusTransition {
  forward: { status: PhotoStatus; label: string } | null;
  backward: { status: PhotoStatus; label: string } | null;
}

export function getTransitions(status: PhotoStatus): StatusTransition {
  switch (status) {
    case 'new':
      return {
        forward: { status: 'printed', label: 'Mark as Printed' },
        backward: null,
      };
    case 'printed':
      return {
        forward: { status: 'completed', label: 'Mark as Completed' },
        backward: { status: 'new', label: 'Move back to New' },
      };
    case 'completed':
      return { forward: null, backward: null };
  }
}

export async function updatePhotoStatuses(
  ids: string[],
  newStatus: PhotoStatus
): Promise<{ failedIds: string[] }> {
  const { error } = await supabase
    .from('photos')
    .update({ status: newStatus })
    .in('id', ids);

  if (error) return { failedIds: ids };
  return { failedIds: [] };
}

export interface PrintablePhoto {
  imageUrl: string;
  guestName: string;
}

export function openPrintWindow(photos: PrintablePhoto[]): void {
  const COLS = 3;
  const PER_PAGE = 6;

  const pages: PrintablePhoto[][] = [];
  for (let i = 0; i < photos.length; i += PER_PAGE) {
    pages.push(photos.slice(i, i + PER_PAGE));
  }

  const pageHtml = pages.map((page) => {
    const cells = page.map((p) => `
      <div class="cell">
        <div class="polaroid">
          <img src="${p.imageUrl}" alt="${p.guestName}" />
          <div class="caption">${p.guestName}</div>
        </div>
      </div>
    `).join('');
    return `<div class="page">${cells}</div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Print Photos</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; }
    .page {
      display: grid;
      grid-template-columns: repeat(${COLS}, 1fr);
      gap: 10mm;
      padding: 12mm;
      page-break-after: always;
      break-after: page;
      width: 100%;
    }
    .page:last-child { page-break-after: avoid; break-after: avoid; }
    .cell { display: flex; align-items: flex-start; justify-content: center; }
    .polaroid {
      background: white;
      padding: 4mm 4mm 12mm 4mm;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      width: 100%;
    }
    .polaroid img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      display: block;
    }
    .caption {
      font-family: 'Courier New', monospace;
      font-size: 8pt;
      font-weight: bold;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #444;
      text-align: center;
      margin-top: 3mm;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media print {
      .page { page-break-after: always; break-after: page; }
      .page:last-child { page-break-after: avoid; break-after: avoid; }
    }
  </style>
</head>
<body>
  ${pageHtml}
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export async function triggerResendNotification(photoId: string): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  await fetch(`${supabaseUrl}/functions/v1/notify-magnet-ready`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ photoId }),
  });
}
