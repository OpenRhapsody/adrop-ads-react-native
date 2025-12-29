export enum AdropConsentDebugGeography {
    /** No debug setting (use actual location) */
    DISABLED = 0,
    /** European Economic Area (GDPR applies) */
    EEA = 1,
    /** @deprecated - Use OTHER instead */
    NOT_EEA = 2,
    /** Regulated US states (California, etc., CCPA applies) */
    REGULATED_US_STATE = 3,
    /** Unregulated region */
    OTHER = 4,
}
