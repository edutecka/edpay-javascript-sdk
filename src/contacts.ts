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

interface ParsedPhoneNumber {
  countryCallingCode: string;
  nationalNumber: string;
}

function normalizeOptions(options: PhoneNumberOptions = {}): Required<Pick<PhoneNumberOptions, "countryCallingCode" | "nationalLength" | "output">> & PhoneNumberOptions {
  const countryCallingCode = (options.countryCallingCode ?? "258").replace(/^\+/, "");
  const nationalLength = options.nationalLength ?? 9;
  const output = options.output ?? "international";

  if (!/^[1-9]\d{0,2}$/.test(countryCallingCode)) {
    throw new TypeError("countryCallingCode must contain 1 to 3 digits and cannot start with 0.");
  }
  if (!Number.isInteger(nationalLength) || nationalLength < 1 || nationalLength + countryCallingCode.length > 15) {
    throw new TypeError("nationalLength must fit within the E.164 limit of 15 digits.");
  }
  if (output !== "international" && output !== "country-code" && output !== "national") {
    throw new TypeError("output must be 'international', 'country-code', or 'national'.");
  }
  if (options.nationalPrefixes?.some((prefix) => !/^\d+$/.test(prefix))) {
    throw new TypeError("nationalPrefixes must contain digits only.");
  }
  if (options.groupSizes?.some((size) => !Number.isInteger(size) || size < 1)) {
    throw new TypeError("groupSizes must contain positive integers.");
  }

  return { ...options, countryCallingCode, nationalLength, output };
}

function parsePhoneNumber(value: string, options: PhoneNumberOptions = {}): ParsedPhoneNumber {
  const config = normalizeOptions(options);
  if (typeof value !== "string") {
    throw new TypeError("Phone number must be a string.");
  }

  const input = value.trim();
  if (!input || !/^\+?[\d\s().-]+$/.test(input)) {
    throw new TypeError("Phone number contains unsupported characters.");
  }
  if ((input.match(/\(/g)?.length ?? 0) !== (input.match(/\)/g)?.length ?? 0)) {
    throw new TypeError("Phone number has unbalanced parentheses.");
  }

  const markedInternational = input.startsWith("+");
  let digits = input.replace(/\D/g, "");
  const hasInternational00Prefix = digits.startsWith("00");
  if (hasInternational00Prefix) digits = digits.slice(2);

  const isInternational = markedInternational || hasInternational00Prefix ||
    (digits.startsWith(config.countryCallingCode) && digits.length > config.nationalLength);
  let nationalNumber: string;
  if (isInternational) {
    if (!digits.startsWith(config.countryCallingCode)) {
      throw new TypeError("Phone number does not use the configured country calling code.");
    }
    nationalNumber = digits.slice(config.countryCallingCode.length);
  } else {
    nationalNumber = digits;
  }

  if (nationalNumber.length !== config.nationalLength || !/^\d+$/.test(nationalNumber)) {
    throw new TypeError("Phone number does not match the configured national length.");
  }
  if (config.nationalPrefixes?.length && !config.nationalPrefixes.some((prefix) => nationalNumber.startsWith(prefix))) {
    throw new TypeError("Phone number does not match the configured national prefixes.");
  }

  return { countryCallingCode: config.countryCallingCode, nationalNumber };
}

/**
 * Normalize a phone number to the configured request format. The default is
 * `+258` plus nine national digits. Method presets are available for phone
 * methods; unknown methods return no preset and should use account metadata.
 */
export function normalizePhoneNumber(value: string, options: PhoneNumberOptions = {}): string {
  const config = normalizeOptions(options);
  const parsed = parsePhoneNumber(value, config);
  if (config.output === "national") return parsed.nationalNumber;
  if (config.output === "country-code") return `${parsed.countryCallingCode}${parsed.nationalNumber}`;
  return `+${parsed.countryCallingCode}${parsed.nationalNumber}`;
}

/** Return known phone rules for a method; null means the method is non-phone or unknown. */
export function phoneNumberOptionsForMethod(method: string): PhoneNumberOptions | null {
  const key = method.trim().toLowerCase().replace(/[ _-]/g, "");
  if (key === "emola") return { countryCallingCode: "258", nationalLength: 9, nationalPrefixes: ["86", "87"], output: "national" };
  if (key === "mpesa") return { countryCallingCode: "258", nationalLength: 9, nationalPrefixes: ["84", "85"], output: "country-code" };
  return null;
}

/** Format a validated phone number for display, using spaces between groups. */
export function formatPhoneNumber(value: string, options: PhoneNumberOptions = {}): string {
  const parsed = parsePhoneNumber(value, options);
  const config = normalizeOptions(options);
  const defaultGroups = parsed.countryCallingCode === "258" && parsed.nationalNumber.length === 9
    ? [2, 3, 4]
    : [parsed.nationalNumber.length];
  const groups = config.groupSizes ?? defaultGroups;
  const formattedGroups: string[] = [];
  let offset = 0;
  for (const size of groups) {
    if (offset >= parsed.nationalNumber.length) break;
    formattedGroups.push(parsed.nationalNumber.slice(offset, offset + size));
    offset += size;
  }
  if (offset < parsed.nationalNumber.length) {
    formattedGroups.push(parsed.nationalNumber.slice(offset));
  }
  return `+${parsed.countryCallingCode} ${formattedGroups.join(" ")}`;
}

/** Add the configured country calling code and return an E.164-style value. */
export function addCountryPrefix(value: string, options: PhoneNumberOptions = {}): string {
  return normalizePhoneNumber(value, { ...options, output: "international" });
}

/** Remove the configured country calling code and return national digits. */
export function removeCountryPrefix(value: string, options: PhoneNumberOptions = {}): string {
  return normalizePhoneNumber(value, { ...options, output: "national" });
}

/** Return whether the number matches the configured country, length, and prefixes. */
export function validatePhoneNumber(value: string, options: PhoneNumberOptions = {}): boolean {
  try {
    parsePhoneNumber(value, options);
    return true;
  } catch {
    return false;
  }
}
