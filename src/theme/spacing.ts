// Spacing & layout tokens from Stitch design system
// Optimized for 390px mobile frame (iPhone 14)

export const Spacing = {
  containerPadding: 20, // Horizontal screen margins
  sectionMargin: 32,    // Between major content sections
  stackLg: 24,          // Large vertical gap
  stackMd: 16,          // Medium vertical gap
  stackSm: 8,           // Small vertical gap
  gridGutter: 12,       // Card grid gaps
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius — "Softly Geometric" language
export const Radius = {
  sm: 4,    // Small utility elements
  DEFAULT: 8,  // Default inputs/buttons
  md: 10,   // Interactive components (buttons, inputs)
  lg: 16,   // Main cards, feature containers
  xl: 24,
  pill: 20, // Tags, chips, status badges
  full: 9999,
};

// Elevation / Shadow tokens
export const Shadow = {
  // Level 3: Floating interactive cards/buttons
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  // Primary button shadow (blue tinted)
  primaryButton: {
    shadowColor: '#3563e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  // Bottom navigation
  bottomNav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
};

// Component heights (from design system spec)
export const Heights = {
  button: 52,       // Primary & secondary buttons
  input: 52,        // Standard input fields
  bottomNav: 64,    // Bottom navigation bar
  carCard: 200,     // Car image area height
};
