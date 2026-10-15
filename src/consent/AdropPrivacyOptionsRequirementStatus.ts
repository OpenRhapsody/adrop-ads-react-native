export enum AdropPrivacyOptionsRequirementStatus {
    /** Not yet determined (requestConsentInfoUpdate has not completed in this app session, or the installed backfill does not support it) */
    UNKNOWN = 0,
    /** An entry point to change privacy options must be shown */
    REQUIRED = 1,
    /** No entry point is needed */
    NOT_REQUIRED = 2,
}
