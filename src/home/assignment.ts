export default class Assignment {
  public isShown: boolean

  constructor(
    public readonly url: string,
    public readonly title: string,
    public readonly course: string,
    public readonly deadline: Date
  ) {
    this.isShown = true
  }
}
