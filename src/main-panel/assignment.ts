import { sha256 } from '../utils/hash'

export default class Assignment {
  /**
   * The hash string that identify the assignment
   */
  public readonly hash: Promise<string>

  /**
   * Construct an assignment and set `hash`.
   * @param url The URL to the assignment page
   * @param title The title of the assignment
   * @param course The name of the parent course
   * @param deadline The deadline of the assignment if set, otherwise null
   */
  constructor(
    public readonly url: string,
    public readonly title: string,
    public readonly course: string,
    public readonly deadline: Date = null
  ) {
    this.hash = sha256(url)
  }

  // #region isShown
  private _isShown: boolean = true

  /**
   * An event handler called when `isShown` is changed
   */
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
