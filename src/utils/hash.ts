const textEncoder = new TextEncoder()

export const sha256 = async function (text) {
  const src = textEncoder.encode(text)
  const buffer = await crypto.subtle.digest('SHA-256', src)
  const dst = new Uint8Array(buffer)
  return Array.from(dst)
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')
}
