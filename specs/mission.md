# InstantEvent — Mission

## What It Is

InstantEvent is a real-time photo collection and physical product fulfillment platform built for in-person events. Guests scan a QR code, crop and upload a photo from their phone, and receive an automated email when their photo magnet is ready. Organizers manage everything from a live dashboard that receives photos the moment guests upload them.

## Who It's For

**Event Organizers / Admins**
Small event businesses, wedding photographers, market vendors, and pop-up experience operators who produce physical photo products (magnets, prints) on-site or ship them after the event. They need a fast, organized way to collect photos from dozens or hundreds of guests and track fulfillment status without manual follow-up.

**Guests / Customers**
Attendees at weddings, markets, birthday parties, and other in-person events. They have no account, no app to install — they scan a QR code and upload from their browser in under a minute.

## Purpose

Replace paper sign-in sheets, generic upload links, and manual text/email follow-ups with a branded, event-specific workflow that starts with a guest selfie and ends with a physical keepsake and an automated delivery notification.

## Mission Statement

Make every in-person event feel memorable by giving guests a frictionless way to contribute photos and receive a physical keepsake — and giving organizers a calm, organized command center to fulfill every order without chaos.

## App Structure

```
InstantEvent
├── Admin Dashboard (authenticated)
│   ├── Events List — overview of all events, photo counts, statuses
│   ├── Create Event — form to set up a new event with QR code
│   └── Event Detail — live polaroid grid, status management, batch actions
└── Guest Upload Page (public, no login)
    ├── Event Banner — event name, date, welcoming message
    ├── Guest Info Form — name + email capture
    ├── Crop Tool — 1:1 square crop locked for consistent magnet output
    └── Upload Confirmation — thank-you screen with email notification promise
```

## Key Components

| Component | Purpose |
|---|---|
| Polaroid Grid | Real-time display of guest photos as physical-feeling polaroid cards |
| QR Code Generator | Per-event QR code linking to the public upload URL |
| Status Workflow | new → printing → printed → completed with email trigger on completed |
| Guest Identity | Name + email captured per upload, normalized to prevent duplicate notifications |
| Email Notification | Automated "your magnet is ready" email sent when admin marks photo completed |
| DYMO Labels | Space Mono status tags that mimic physical label-maker tape on each photo |

## Target Audience

- **Primary:** Independent photographers and event vendors who run photo magnet or print booths at weddings, markets, and private events (1–500 guests per event)
- **Secondary:** Corporate event planners running branded activations or team-building events who need a simple photo collection tool
- **Not targeting (v1):** Large-scale concert/festival environments requiring hardware integrations, multi-admin teams, or enterprise SSO
