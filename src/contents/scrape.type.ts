export {}

declare global {
  interface ScrapingNode {
    selectors: string
    children?: ScrapingNode[]
  }

  interface ScrapingTrace {
    token: string
    max: number
    index: number
  }
}
