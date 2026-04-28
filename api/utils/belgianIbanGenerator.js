export function generateBelgianIBAN() {
  const countryCode = "BE";

  // Generate 12 random digits (Belgian BBAN)
  let bban = "";
  for (let i = 0; i < 12; i++) {
    bban += Math.floor(Math.random() * 10);
  }

  // Move country code + placeholder check digits to end
  const rearranged = bban + countryCode + "00";

  // Convert letters to numbers (A=10, B=11, ..., Z=35)
  const converted = rearranged
    .split("")
    .map(char =>
      isNaN(char) ? (char.charCodeAt(0) - 55).toString() : char
    )
    .join("");

  // Compute mod 97
  const mod97 = BigInt(converted) % 97n;

  // Calculate check digits
  const checkDigits = (98n - mod97).toString().padStart(2, "0");

  return `${countryCode}${checkDigits}${bban}`;
}