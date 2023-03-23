export {}

declare global {
  interface DownloadContext {
    url: string
    tokens: string[]
  }
}
