export {}

declare global {
  interface ScrapingNode {
    prefix?: string
    selectors: string
    children?: ScrapingNode[]
  }

  interface ScrapingTrace {
    token: string
    max: number
    index: number
  }
}
