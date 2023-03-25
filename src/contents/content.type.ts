export {}

declare global {
  interface ContentContext extends DownloadContext {
    /**
     * A URL to a page that has the link to the file.
     */
    parentUrl: string

    /**
     * A hash string used to identify.
     */
    hash: string

    /**
     * Indicates if the file is excluded from downloading.
     */
    excluded: boolean
  }
}
