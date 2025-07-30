export const Colors = {
  light: {
    // Primary teal colors
    primary: "hsl(180, 100%, 18%)", // Deep teal
    "primary-foreground": "hsl(0, 0%, 96.1%)",
    
    // Secondary colors
    secondary: "hsl(180, 30%, 94%)", // Very light teal
    "secondary-foreground": "hsl(180, 100%, 18%)",
    
    // Muted colors
    muted: "hsl(180, 30%, 96%)",
    "muted-foreground": "hsl(180, 5%, 45%)",
    
    // Accent colors
    accent: "hsl(180, 30%, 94%)",
    "accent-foreground": "hsl(180, 100%, 18%)",
    
    // Destructive/Error
    destructive: "hsl(0, 84%, 60%)",
    "destructive-foreground": "hsl(0, 0%, 98%)",
    
    // Background colors
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(180, 5%, 15%)",
    
    // Card colors
    card: "hsl(0, 0%, 100%)",
    "card-foreground": "hsl(180, 5%, 15%)",
    
    // Popover colors
    popover: "hsl(0, 0%, 100%)",
    "popover-foreground": "hsl(180, 5%, 15%)",
    
    // Border and input
    border: "hsl(180, 30%, 82%)",
    input: "hsl(180, 30%, 82%)",
    
    
    ring: "hsl(180, 100%, 25%)",
    
    
    chart: {
      1: "hsl(180, 100%, 25%)",
      2: "hsl(175, 85%, 35%)",
      3: "hsl(170, 70%, 45%)",
      4: "hsl(165, 60%, 55%)",
      5: "hsl(160, 50%, 65%)"
    }
  },

   dark: {
    // --- Base & Core Text ---
    // A near-black with a hint of teal for a sophisticated, deep background.
    background: "hsl(0, 0%, 8%)",
    // A very light, slightly desaturated teal-white for maximum readability.
    foreground: "hsl(175, 15%, 96%)",

    // --- Cards & Popovers ---
    // A subtle step up from the background to create depth and layering.
    card: "hsl(175, 14%, 12%)",
    "card-foreground": "hsl(175, 15%, 96%)",

    // Slightly lighter for elements appearing on top of cards or for secondary cards.
    popover: "hsl(175, 16%, 14%)",
    "popover-foreground": "hsl(175, 15%, 96%)",

    // --- Primary Actions (e.g., "Send", "Swap") ---
    // A vibrant, high-energy teal for main call-to-action buttons.
    primary: "hsl(175, 80%, 40%)",
    // A crisp, dark text for high contrast on primary buttons.
    "primary-foreground": "hsl(175, 30%, 10%)",

    // --- Secondary Actions (e.g., "Cancel", filters) ---
    // A more subdued, desaturated teal for secondary buttons and interactive elements.
    secondary: "hsl(175, 15%, 25%)",
    // Bright, clear text that stands out on secondary surfaces.
    "secondary-foreground": "hsl(175, 25%, 85%)",

    // --- Muted & Tertiary Info ---
    // Used for subtle borders or disabled-like states.
    muted: "hsl(175, 10%, 20%)",
    // For helper text, captions, and non-critical information.
    "muted-foreground": "hsl(175, 10%, 60%)",

    // --- Accent (e.g., highlights, active toggles) ---
    // A bright, attention-grabbing color for highlights or active states.
    accent: "hsl(175, 70%, 65%)",
    // A dark, high-contrast foreground for use on top of the accent color.
    "accent-foreground": "hsl(175, 20%, 10%)",

    // --- Destructive Actions (e.g., "Delete Wallet") ---
    // A clear, unambiguous red for warnings and critical actions.
    destructive: "hsl(0, 84%, 60%)",
    "destructive-foreground": "hsl(0, 0%, 98%)",

    // --- Borders, Inputs & Focus ---
    // A subtle border to define components without being distracting.
    border: "hsl(175, 15%, 22%)",
    // Input fields that are clearly defined against the card background.
    input: "hsl(175, 15%, 18%)",
    // A highly visible focus ring for accessibility.
    ring: "hsl(175, 85%, 55%)",

    // --- Chart & Data Visualization ---
    // A harmonious and distinct palette for financial charts.
    chart: {
      1: "hsl(175, 85%, 50%)", // Brightest for primary data
      2: "hsl(175, 70%, 45%)",
      3: "hsl(175, 55%, 40%)",
      4: "hsl(175, 45%, 35%)",
      5: "hsl(175, 35%, 30%)", // Most subdued
    },
    success: "hsl(142, 76%, 36%)",           // Green for success
  "success-foreground": "hsl(0, 0%, 98%)", // White text on success
  "success-bg": "hsl(142, 76%, 8%)",       // Dark green background
  "success-border": "hsl(142, 76%, 20%)",  // Success border

  // Warning variants  
  warning: "hsl(38, 92%, 50%)",            // Amber for warnings
  "warning-foreground": "hsl(25, 30%, 10%)", // Dark text on warning
  "warning-bg": "hsl(38, 92%, 8%)",        // Dark amber background
  "warning-border": "hsl(38, 92%, 25%)",   // Warning border

  // Info variants
  info: "hsl(221, 83%, 53%)",              // Blue for info
  "info-foreground": "hsl(0, 0%, 98%)",    // White text on info
  "info-bg": "hsl(221, 83%, 8%)",          // Dark blue background
  "info-border": "hsl(221, 83%, 20%)",     // Info border

  // Enhanced destructive variants (keeping your existing destructive)
  "destructive-bg": "hsl(0, 84%, 8%)",     // Dark red background
  "destructive-border": "hsl(0, 84%, 25%)",
  },
};

// CSS Custom Properties version (for use in CSS)
export const cssVariables = {
  light: `
    --primary: 180 100% 18%;
    --primary-foreground: 0 0% 98%;
    --secondary: 180 30% 94%;
    --secondary-foreground: 180 100% 18%;
    --muted: 180 30% 96%;
    --muted-foreground: 180 5% 45%;
    --accent: 180 30% 94%;
    --accent-foreground: 180 100% 18%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --background: 0 0% 100%;
    --foreground: 180 5% 15%;
    --card: 0 0% 100%;
    --card-foreground: 180 5% 15%;
    --popover: 0 0% 100%;
    --popover-foreground: 180 5% 15%;
    --border: 180 30% 82%;
    --input: 180 30% 82%;
    --ring: 180 100% 25%;
  `,
  dark: `
    --primary: 180 100% 70%;
    --primary-foreground: 180 100% 10%;
    --secondary: 180 20% 14%;
    --secondary-foreground: 180 100% 70%;
    --muted: 180 20% 14%;
    --muted-foreground: 180 5% 65%;
    --accent: 180 20% 14%;
    --accent-foreground: 180 100% 70%;
    --destructive: 0 75% 55%;
    --destructive-foreground: 0 0% 98%;
    --background: 180 15% 8%;
    --foreground: 180 5% 90%;
    --card: 180 15% 8%;
    --card-foreground: 180 5% 90%;
    --popover: 180 15% 8%;
    --popover-foreground: 180 5% 90%;
    --border: 180 20% 18%;
    --input: 180 20% 18%;
    --ring: 180 100% 60%;
  `
};