/**
 * Encode a byte array into a base64 string.
 * @param bytes The data to be encoded
 * @returns The encoded base64 string
 */
export const encode = function (bytes: Uint8Array) {
  return btoa([...bytes].map((b) => String.fromCharCode(b)).join(''))
}

/**
 * Decode a base64 string into a byte array.
 * @param str The base64 string to be decoded
 * @returns The decoded byte array
 */
export const decode = function (str: string) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
}
