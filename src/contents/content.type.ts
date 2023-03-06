export {}

declare global {
  interface ContentContext extends DownloadContext {
    parentUrl: string
    hash: string
    excluded: boolean
  }
}
