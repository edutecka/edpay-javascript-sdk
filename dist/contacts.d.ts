/** Phone number formats accepted by the SDK's contact helpers. */
export type PhoneNumberOutput = "international" | "country-code" | "national";
/** Rules for validating and formatting a phone number for a country or API method. */
export interface PhoneNumberOptions {
    /** Country calling code without `+`. Defaults to Mozambique (`258`). */
    countryCallingCode?: string;
    /** Required number of national digits. Defaults to 9 for Mozambique. */
    nationalLength?: number;
    /** Optional national prefixes required by the selected payment method. */
    nationalPrefixes?: readonly string[];
    /** Request representation. Defaults to E.164-style `+<country><national>`. */
    output?: PhoneNumberOutput;
    /** Display grouping from left to right. Defaults to `[2, 3, 4]` for Mozambique. */
    groupSizes?: readonly number[];
}
/**
 * Normalize a phone number to the configured request format. The default is
 * `+258` plus nine national digits. Method presets are available for phone
 * methods; unknown methods return no preset and should use account metadata.
 */
export declare function normalizePhoneNumber(value: string, options?: PhoneNumberOptions): string;
/** Return known phone rules for a method; null means the method is non-phone or unknown. */
export declare function phoneNumberOptionsForMethod(method: string): PhoneNumberOptions | null;
/** Format a validated phone number for display, using spaces between groups. */
export declare function formatPhoneNumber(value: string, options?: PhoneNumberOptions): string;
/** Add the configured country calling code and return an E.164-style value. */
export declare function addCountryPrefix(value: string, options?: PhoneNumberOptions): string;
/** Remove the configured country calling code and return national digits. */
export declare function removeCountryPrefix(value: string, options?: PhoneNumberOptions): string;
/** Return whether the number matches the configured country, length, and prefixes. */
export declare function validatePhoneNumber(value: string, options?: PhoneNumberOptions): boolean;
//# sourceMappingURL=contacts.d.ts.map