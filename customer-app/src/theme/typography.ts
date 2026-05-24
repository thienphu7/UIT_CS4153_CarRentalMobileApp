// Typography tokens — Playfair Display (serif) + DM Sans (sans-serif)
// From Stitch "Premium Editorial Motion" design system

export const FontFamilies = {
  // Serif — for headlines and price displays
  displayBold: 'PlayfairDisplay_700Bold',

  // Sans-serif — for UI, body, labels
  sansBold: 'DMSans_700Bold',
  sansSemiBold: 'DMSans_600SemiBold',
  sansMedium: 'DMSans_600SemiBold', // alias
  sansRegular: 'DMSans_400Regular',
  numericBold: 'DMSans_700Bold',
  numericSemiBold: 'DMSans_600SemiBold',
};

export const FontSizes = {
  h1Display: 26,    // Playfair — main headlines
  priceDisplay: 22, // Playfair — price figures
  h2Semibold: 20,   // DM Sans 600 — section titles
  bodyMain: 14,     // DM Sans 400 — body copy
  bodySemibold: 14, // DM Sans 600 — emphasized body
  labelSm: 12,      // DM Sans 400 — captions, meta
  labelSmBold: 12,  // DM Sans 700 — badge text
  tabLabel: 10,     // DM Sans — bottom nav labels
};

export const LineHeights = {
  h1Display: 34,
  priceDisplay: 28,
  h2Semibold: 28,
  bodyMain: 20,
  bodySemibold: 20,
  labelSm: 16,
};

export const LetterSpacings = {
  h1Display: -0.52,  // -0.02em at 26px
  h2Semibold: -0.20, // -0.01em at 20px
};
