---
name: Physical Desk System
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#4e4632'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#80765f'
  outline-variant: '#d1c6ab'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#ffcf00'
  on-primary-container: '#6f5900'
  inverse-primary: '#efc200'
  secondary: '#00658d'
  on-secondary: '#ffffff'
  secondary-container: '#47c1ff'
  on-secondary-container: '#004d6c'
  tertiary: '#bb1615'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffc7bf'
  on-tertiary-container: '#b71212'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe084'
  primary-fixed-dim: '#efc200'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#c6e7ff'
  secondary-fixed-dim: '#81cfff'
  on-secondary-fixed: '#001e2d'
  on-secondary-fixed-variant: '#004c6b'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4aa'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#930006'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-tag:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 40px
  gutter: 24px
  object-gap: 16px
  desk-padding: 32px
---

## Brand & Style

This design system is built upon a **Skeuomorphic-lite** aesthetic, specifically designed to evoke the tactile satisfaction of a physical creative workspace. The personality is optimistic, bright, and approachable, transforming a digital photo management dashboard into a tangible "desk" where images are objects rather than pixels.

The visual language draws inspiration from industrial design—specifically vintage and modern instant cameras. It utilizes soft shadows, subtle gradients, and highlights to mimic matte and glossy plastic surfaces. The goal is to make the user feel like they are physically organizing a collection of memories, reducing the coldness of SaaS interfaces with the warmth of physical interaction.

## Colors

The palette is centered on a "Studio White" desk surface—a warm, off-white neutral that provides a clean, high-contrast base for vibrant accents.

- **Sunshine Yellow (Primary):** Used for primary actions and "Power" states, mimicking the iconic shutter buttons of classic instant cameras.
- **Sky Blue (Secondary):** Used for selection states, focus indicators, and secondary utility buttons.
- **Poppy Red (Tertiary):** Reserved for destructive actions (Delete) or urgent notifications, echoing the industrial "Stop" or "Record" indicators.
- **Desk Surface (Neutral):** A layered set of light grays and off-whites used to define the "depth" of the desk through neomorphic highlights and shadows.

## Typography

The typography strategy balances modern legibility with a "hardware" aesthetic.

- **Primary Typeface:** **Plus Jakarta Sans** provides a friendly, geometric, and highly legible experience for all functional UI and content. Its soft curves complement the rounded corners of the hardware-inspired elements.
- **Functional Typeface:** **Space Mono** is used exclusively for status tags and metadata labels. This mimics the "label maker" or "stamped" feel often found on the back of physical photos or industrial equipment.
- **Scale:** High contrast between headlines and body text ensures a clear hierarchy on a busy "desk."

## Layout & Spacing

The layout treats the screen as a **fixed-surface desk**. While the content is responsive, the container maintains generous "safe zones" on the edges to simulate the physical margins of a tabletop.

- **Grid Model:** A 12-column fluid grid is used for the dashboard structure, but "Photo Objects" (Polaroids) are allowed to have slight, randomized rotations (1-2 degrees) to enhance the feeling of physical items tossed on a surface.
- **Rhythm:** Spacing is intentionally loose. Elements should never feel cramped; the "desk" requires white space to maintain its premium, clean aesthetic.
- **Breakpoints:** On mobile, the "Desk" margins shrink to 16px, and Polaroid cards transition to a simplified 2-column stack to maximize photo visibility.

## Elevation & Depth

Hierarchy is defined through **tactile neomorphism**. Surfaces do not just "float"; they are either extruded from or indented into the desk.

- **The Desk (Base):** Level 0. Flat, matte finish.
- **The Polaroid (Raised Surface):** Uses two levels of shadows. A soft, large-radius ambient shadow suggests the photo is sitting a few millimeters above the desk, and a sharper, darker shadow near the edge defines the thickness of the paper stock.
- **Tactile Buttons (Extruded):** These use a "top-left light source" logic. A white highlight on the top-left edge and a soft gray shadow on the bottom-right.
- **Input Fields (In-set):** Search bars and text inputs are "pressed" into the desk using inner shadows, making them feel like carved-out trays for data.

## Shapes

The shape language is "Soft-Industrial." Every corner is rounded to feel comfortable to the touch, echoing the molded plastic of a camera body.

- **Standard Elements:** 0.5rem (8px) radius. Used for buttons, input fields, and small containers.
- **Photo Cards:** 1rem (16px) outer radius to mimic the die-cut corners of premium instant film.
- **Status Tags:** Pill-shaped (fully rounded) to look like embossed plastic label strips.

## Components

### Buttons (The Shutter)
Buttons must look like physical plastic components.
- **Primary Action:** Sunshine Yellow with a subtle "gloss" gradient from top to bottom. On hover, the "shutter" should appear to slightly depress (reduce shadow spread).
- **Secondary Action:** Sky Blue with a matte finish.

### Photo Cards (The Polaroid)
The central component of the system.
- **Structure:** A thick white border (24px bottom, 12px sides/top).
- **Surface:** The image itself should have a very subtle inner glow to simulate the glossy finish of a photograph.
- **Stacking:** When multiple photos are selected, they should visually "stack" with overlapping shadows.

### Status Tags (The Label Maker)
Tags for "Event Name" or "Date" should look like Dymo labels.
- **Style:** High-contrast background (Black or Poppy Red) with white **Space Mono** text.
- **Texture:** A slight vertical "ribbed" texture can be applied to the background to simulate plastic tape.

### Input Fields
- **Search:** In-set (sunken) into the desk surface. No border, just a change in tonal depth and a soft inner shadow.

### Toggle Switches
- **Toggle:** Designed to look like a physical sliding power switch on a camera, using a high-contrast track and a tactile, raised "nub."
