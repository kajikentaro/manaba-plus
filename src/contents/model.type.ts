export {}

declare global {
  interface ScrapingNode {
    prefix?: string
    selectors: string
    children?: ScrapingNode[]
    filter?: (url: string) => Promise<boolean>
  }

  interface ScrapingTrace {
    token: string
    max: number
    index: number
  }
}
