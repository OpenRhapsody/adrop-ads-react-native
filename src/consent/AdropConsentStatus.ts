export enum AdropConsentStatus {
    /** Not yet determined */
    UNKNOWN = 0,
    /** Consent required (popup display needed) */
    REQUIRED = 1,
    /** Consent not required (not applicable region) */
    NOT_REQUIRED = 2,
    /** Consent obtained */
    OBTAINED = 3,
}
