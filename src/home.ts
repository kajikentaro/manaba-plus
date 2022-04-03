import Assignment from "./module/Assignment";
import AssignmentViewer from "./module/AssignmentViewer";
import { ENABLE_INSERT_MP, HIDED_ASSIGNHMENT, InfinityDate, URL_HOME } from "./module/const";
import { AssignmentMember, HTMLInputEvent } from "./module/type";

let didDisplayAssignments = false;

const init = async () => {
  const enableInsertMp = await isEnableInsertMp();
  if (enableInsertMp === false) return;
  await insertMpButton();
  document.getElementById("download-content").onclick = () => {
    if (confirm("コースコンテンツをPCにまとめてダウンロードします。続行しますか？")) {
      window.open(chrome.runtime.getURL("download-progress.html"));
    }
  };
  document.getElementById("open-option").onclick = () => {
    window.open(chrome.runtime.getURL("options.html"));
  };
};

const displayAssignments = async () => {
  // prevent over two times button click
  if (didDisplayAssignments) return;
  didDisplayAssignments = true;

  // fetch assignment datas
  const allAssignments = await fetchSummaries();
  const hidedAssignments = await fetchHided();
  const courseURLs = getCourseURLs();

  const viewer = new AssignmentViewer(allAssignments, hidedAssignments, courseURLs);
  Assignment.inputClick = viewer.inputClick;

  // show toggles
  document.getElementById("toggles").style.display = "flex";
  document.getElementById("toggle-extra-ass-hide").onchange = (e: HTMLInputEvent) => {
    viewer.showExtraAssIs(e.target.checked);
    viewer.repaint();
  };
  document.getElementById("toggle-hide").onchange = (e: HTMLInputEvent) => {
    viewer.showDisableAssIs(e.target.checked);
    viewer.repaint();
  };

  viewer.repaint();
};

const getCourseURLs = () => {
  const manabaCourseDOMs = document.querySelectorAll<HTMLAnchorElement>(".course-cell a:first-child");
  const courseURLs = [] as string[];
  manabaCourseDOMs.forEach((manabaCourseDOM) => {
    courseURLs.push(manabaCourseDOM.href);
  });
  return courseURLs;
};

const isEnableInsertMp = async () => {
  const res = await new Promise((resolve) => {
    chrome.storage.local.get([ENABLE_INSERT_MP], function (result) {
      if (result[ENABLE_INSERT_MP] === undefined) resolve(true);
      resolve(result[ENABLE_INSERT_MP]);
    });
  });
  return res;
};

const fetchHided = async () => {
  const res = await new Promise((resolve) => {
    chrome.storage.sync.get([HIDED_ASSIGNHMENT], function (result) {
      if (!result[HIDED_ASSIGNHMENT]) resolve([]);
      resolve(result[HIDED_ASSIGNHMENT]);
    });
  });
  return res as string[];
};

const fetchSummaries = async () => {
  const docParser = (doc: Document) => {
    const clipStr = (element: HTMLElement) => {
      let str = element.innerText;
      str = str.replace(/\r?\n/g, ""); // delete return
      str = str.replace(/\s+/g, ""); // delete space
      return str;
    };

    const assignmentDomRows = doc.querySelectorAll<HTMLTableElement>(".pagebody table tr");
    for (let i = 0; i < assignmentDomRows.length; i++) {
      if (i === 0) continue; // skip title
      const cols = assignmentDomRows[i].children as HTMLCollectionOf<HTMLElement>;
      const dict: AssignmentMember = {
        courseName: clipStr(cols[1]),
        href: cols[0].getElementsByTagName("a")[0].href,
        assignmentName: clipStr(cols[0]),
        deadline: cols[2].innerText ? new Date(cols[2].innerText) : InfinityDate,
        disable: false,
        colorCode: "#fff",
      };
      const assignment = new Assignment();
      assignment.initJson(dict);
      assignments.push(assignment);
    }
  };

  const assignments = [] as Assignment[];
  const targetUrls = [URL_HOME + "_summary_query", URL_HOME + "_summary_survey", URL_HOME + "_summary_report"];
  for (const url of targetUrls) {
    const res = await fetch(url);
    const text = await res.text();
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(text, "text/html");
    docParser(doc);
  }
  return assignments;
};

const insertMpButton = async () => {
  const mark = document.getElementsByClassName("contentbody-left")[0];
  mark.insertAdjacentHTML("afterbegin", await (await fetch(chrome.runtime.getURL("insert.html"))).text());
  document.getElementById("show-assignment").onclick = () => {
    displayAssignments();
  };
};

init();
