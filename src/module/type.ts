/* content-dl.ts */
export type UrlDigFunction = (urls: string[]) => Promise<string[]>;
export type DownloadStatus = "STOPPED_OR_ERROR" | "WAITING_INIT" | "DOWNLOADING" | "DONE";
export type FileInfo = {
  url: string;
  courseName: string;
  contentName: string;
};
export type ProgressDisp = (message: string | null | undefined, rate: string | null | undefined, progressN: number | null | undefined) => void;
export type FilterInfo = (raws: FileInfo[], storeds: FileInfo[]) => FileInfo[];

/* home.ts */
export type AssignmentMember = {
  courseName: string;
  href: string;
  assignmentName: string;
  disable: boolean;
  deadline: Date;
  colorCode: string;
};
export interface AssignmentInterface extends AssignmentMember {
  initJson: (dict: AssignmentMember) => void;
  getColor: (deadline: Date) => string;
  dateToStr: (date: Date) => string;
  setupInput: (td: HTMLTableCellElement) => void;
  getTd: () => HTMLTableRowElement;
}

/* events */
export interface HTMLInputEvent extends Event {
  target: HTMLInputElement;
}

/* storage.ts */
export type BooleanStorageKey = {
  name: string;
  defaultValue: boolean;
};
