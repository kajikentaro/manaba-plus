import { sha256 } from '../utils/hash'

export default class Assignment {
  public readonly hash: Promise<string>

  constructor(
    public readonly url: string,
    public readonly title: string,
    public readonly course: string,
    public readonly deadline: Date
  ) {
    this.hash = sha256(url)
  }

  // #region isShown
  private _isShown: boolean = true

  public onIsShownChanged: ((value: boolean) => void)[] = []

  public get isShown(): boolean {
    return this._isShown
  }

  public set isShown(value: boolean) {
    if (this._isShown !== value) {
      this._isShown = value

      for (const handler of this.onIsShownChanged) {
        handler(value)
      }
    }
  }
  // #endregion
}
