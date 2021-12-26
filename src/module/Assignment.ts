import { AssignmentInterface, AssignmentMember } from "./type";
import { Infinity, getLocalDateStr, DELETABLE_ROW } from "./const";

export default class Assignment implements AssignmentInterface {
  courseName: string;
  href: string;
  assignmentName: string;
  disable: boolean;
  deadline: Date;
  colorCode: string;
  static inputClick: () => void;

  initJson(dict: AssignmentMember) {
    this.courseName = dict.courseName;
    this.href = dict.href;
    this.assignmentName = dict.assignmentName;
    this.disable = dict.disable;
    this.deadline = dict.deadline;
    this.colorCode = this.getColor(this.deadline);
  }

  getColor(deadline: Date) {
    if (deadline === Infinity) return "#F4F4F4";
    const nowTime = new Date(getLocalDateStr());
    const timeDiff = deadline.getTime() - nowTime.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    if (dayDiff < 1) {
      return "#ffe6e9";
    } else if (dayDiff < 3) {
      return "#fff4d1";
    } else if (dayDiff < 7) {
      return "#cce8cc";
    } else {
      return "#F4F4F4";
    }
  }

  dateToStr(date: Date) {
    if (date === Infinity) return "";
    const datesJp = ["日", "月", "火", "水", "木", "金", "土"];
    let txt = "";
    txt += date.getMonth() + 1 + "/";
    txt += date.getDate() + "(";
    txt += datesJp[date.getDay()] + ") ";
    txt += date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
    return txt;
  }

  setupInput(td: HTMLTableCellElement) {
    td.classList.add("input");
    td.onclick = (e) => {
      this.disable = !this.disable;
      Assignment.inputClick();
      e.stopPropagation();
    };
    if (this.disable === true) {
      td.innerHTML = '<div class="flex"><input type="checkbox" checked="true"></div>';
    } else {
      td.innerHTML = '<div class="flex"><input type="checkbox"></div>';
    }
  }

  getTd() {
    const tr = document.createElement("tr");
    tr.classList.add(DELETABLE_ROW);

    const tdCourse = tr.insertCell();
    tdCourse.innerHTML = this.courseName;
    tdCourse.classList.add("course");

    const tdAss = tr.insertCell();
    tdAss.innerHTML = "<a href='" + this.href + "'>" + this.assignmentName + "</a>";
    tdAss.classList.add("ass");
    this.setupInput(tr.insertCell());
    tr.insertCell().innerHTML = this.dateToStr(this.deadline);
    tr.style.backgroundColor = this.colorCode;
    return tr;
  }
}
