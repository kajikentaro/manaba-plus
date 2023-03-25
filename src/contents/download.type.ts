export {}

declare global {
  interface DownloadContext {
    /**
     * The URL of the file.
     */
    url: string

    /**
     * Path parts expressing where the file should be saved.
     * child <---> parent
     */
    tokens: string[]
  }
}
