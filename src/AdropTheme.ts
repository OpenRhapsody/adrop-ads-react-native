export const AdropTheme = {
    light: 'light',
    dark: 'dark',
    auto: 'auto',
} as const

export type AdropTheme = (typeof AdropTheme)[keyof typeof AdropTheme]
