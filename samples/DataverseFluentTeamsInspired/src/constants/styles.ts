// Common style constants and patterns used across components
// Following Fluent UI design tokens and Microsoft Teams patterns

export const STYLE_CONSTANTS = {
    // Card dimensions - used by InteractiveCounter and AboutCard
    CARD: {
        width: '400px',
        maxWidth: '90%',
    },

    // Settings page card dimensions - wider cards for settings
    SETTINGS_CARD: {
        width: '800px', // Double the standard width
        maxWidth: '90%',
    },

    // Common opacity values for secondary text
    OPACITY: {
        SECONDARY: 0.7,
    },

    // Spacing values following Fluent design tokens
    SPACING: {
        MD: '16px',
        LG: '24px',
    },

    // Common layout patterns
    LAYOUT: {
        PAGE_PADDING: '24px 24px 20px 24px',
        ICON_SIZE: {
            width: '24px',
            height: '24px',
        },
    },
} as const

// Common style combinations
export const COMMON_STYLES = {
    // Card with standard dimensions
    standardCard: {
        width: STYLE_CONSTANTS.CARD.width,
        maxWidth: STYLE_CONSTANTS.CARD.maxWidth,
        minHeight: 'fit-content', // Maintain content-based height
        flexShrink: 0, // Prevent shrinking
    },

    // Card with settings page dimensions (wider)
    settingsCard: {
        width: STYLE_CONSTANTS.SETTINGS_CARD.width,
        maxWidth: STYLE_CONSTANTS.SETTINGS_CARD.maxWidth,
        minHeight: 'fit-content', // Maintain content-based height
        flexShrink: 0, // Prevent shrinking
    },

    // Secondary text styling
    secondaryText: {
        opacity: STYLE_CONSTANTS.OPACITY.SECONDARY,
    },

    // Page title styling
    pageTitle: {
        marginBottom: STYLE_CONSTANTS.SPACING.MD,
        marginTop: '0',
    },

    // Icon styling
    icon: STYLE_CONSTANTS.LAYOUT.ICON_SIZE,

    // Row layouts
    centeredRow: {
        display: 'flex',
        alignItems: 'center',
        flexShrink: 1,
        minWidth: 0,
    },

    rightAlignedRow: {
        display: 'flex',
        alignItems: 'center',
        gap: STYLE_CONSTANTS.SPACING.MD,
        flexShrink: 0,
        marginRight: '0',
    },
} as const
