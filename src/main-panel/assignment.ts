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

  /**
   * Encode the assignment object into a string.
   * @returns The encoded string
   */
  public toString() {
    return JSON.stringify({
      url: this.url,
      title: this.title,
      course: this.course,
      deadline: this.deadline?.getTime() ?? 0,
    })
  }

  /**
   * Decode a string into an assignment object.
   * @param str The string to be decoded
   * @returns The assignment object
   */
  public static from(str: string) {
    const obj: {
      url: string
      title: string
      course: string
      deadline: number
    } = JSON.parse(str)

    let deadline = null

    if (obj.deadline > 0) {
      deadline = new Date(obj.deadline)
    }

    return new Assignment(obj.url, obj.title, obj.course, deadline)
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
