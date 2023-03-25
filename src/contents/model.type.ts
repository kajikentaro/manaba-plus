export {}

declare global {
  /**
   * A node of a scraping model.
   */
  interface ScrapingNode {
    /**
     * A string connected to the tail of the parent scraping URL
     */
    prefix?: string

    /**
     * Query selectors to get the next scraping URLs.
     */
    selectors: string

    children?: ScrapingNode[]

    /**
     * A filter function to specify scraping URLs.
     * @param url The scraping URL
     * @returns True if the page should be scraped, otherwise false
     */
    filter?: (url: string) => Promise<boolean>
  }

  interface ScrapingTrace {
    /**
     * A key string got from the scraped page
     */
    token: string

    /**
     * The count of scraping URLs of the parent scraped page
     */
    max: number

    /**
     * The index in parent scraping URLs
     */
    index: number
  }
}
