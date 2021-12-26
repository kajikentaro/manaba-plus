import * as PathModule from "path";
import {
  DOWNLOAD_LIST,
  STOP_MESSAGE_ON_DL,
  STOP_MESSAGE_ON_DL_CONFIRM,
  STOP_MESSAGE_ON_INIT,
  URL_HOME,
} from "./const";

type DownloadStatus =
  | "STOPPED_OR_ERROR"
  | "WAITING_INIT"
  | "DOWNLOADING"
  | "DONE";
let downloadStatus: DownloadStatus = "WAITING_INIT";
let id = -1;

const startDownloadContents = async () => {
  // 「準備中...」を表示する
  loadingDisplay();
  document.getElementById("stop-dl").onclick = stopDL;

  try {
    progressDisp(null, "URLリストを取得中", null);
    // スクレイピング開始
    const courseURLs = await getCourseURLs();
    const contentURLs = await getContentURLs(courseURLs);
    const pageURLs = await getPageURLs(contentURLs);
    const allFileInfo = await getFileInfo(pageURLs);

    const alreadyStoredFileInfo = await getStoredUrls();
    const mustDLfileInfo = filterInfo(allFileInfo, alreadyStoredFileInfo);
    if (downloadStatus !== "WAITING_INIT")
      throw new Error(STOP_MESSAGE_ON_INIT);
    if (mustDLfileInfo.length === 0) {
      downloadStatus = "DOWNLOADING";
      progressDisp("完了。新規ファイルはありませんでした。", null, null);
      return;
    }
    downloadStatus = "DOWNLOADING";
    await downloadFiles(mustDLfileInfo, alreadyStoredFileInfo);
    downloadStatus = "DOWNLOADING";
    progressDisp("ダウンロードが完了しました。", null, null);
  } catch (e) {
    // eが想定外のエラーの場合はそのままthrowする。
    if (
      e.message !== STOP_MESSAGE_ON_INIT &&
      e.message !== STOP_MESSAGE_ON_DL &&
      e.message !== STOP_MESSAGE_ON_DL_CONFIRM
    )
      throw e;
    // 想定内は表示
    progressDisp(e.message, null, null);
  }
};
const loadingDisplay = () => {
  let dotNum = 0;
  const showInitializingDot = () => {
    const message = document.getElementById("message");
    const text = ["準備中", "準備中 .", "準備中 . .", "準備中 . . ."];
    if (downloadStatus === "WAITING_INIT") {
      dotNum++;
      message.innerHTML = text[dotNum % 4];
      setTimeout(showInitializingDot, 500);
    }
  };
  showInitializingDot();
};
const stopDL = () => {
  if (downloadStatus === "DOWNLOADING" || downloadStatus === "STOPPED_OR_ERROR")
    return;
  progressDisp("ダウンロードの中止中. . .", null, null);
  downloadStatus = "STOPPED_OR_ERROR";
  if (id !== -1) {
    chrome.downloads.cancel(id, () => {
      console.log("cancel chrome downloads");
      // 例外のスローはダウンロードしたメソッドのcatchで行う。
    });
  }
};

const getCourseURLs = async () => {
  const topPageRes = await fetch(URL_HOME);
  const domparser = new DOMParser();
  const topPageDOM = domparser.parseFromString(
    await topPageRes.text(),
    "text/html"
  );
  const base = topPageDOM.createElement("base");
  base.setAttribute("href", URL_HOME);
  topPageDOM.head.appendChild(base);
  const manabaCourseDOMs = topPageDOM.querySelectorAll<HTMLAnchorElement>(
    ".course-cell a:first-child"
  );

  const courseURLs = [];
  manabaCourseDOMs.forEach((manabaCourseDOM) => {
    courseURLs.push(manabaCourseDOM.href);
    progressDisp(null, `${courseURLs.length}個のコースを検出 (1/4)`, null);
  });
  return courseURLs;
};
const getContentURLs = async (urls) => {
  const contentURLs = [];
  await Promise.all(
    urls.map(async (url) => {
      if (downloadStatus !== "WAITING_INIT")
        throw new Error(STOP_MESSAGE_ON_INIT);
      const res = await fetch(`${url}_page`);
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(await res.text(), "text/html");
      const base = doc.createElement("base");
      base.setAttribute("href", URL_HOME);
      doc.head.appendChild(base);
      const elements =
        doc.querySelectorAll<HTMLAnchorElement>(".about-contents a");

      elements.forEach((element) => {
        contentURLs.push(element.href);
        progressDisp(
          null,
          `${contentURLs.length}個のコンテンツを検出 (2/4)`,
          null
        );
      });
    })
  );
  return contentURLs;
};
const getPageURLs = async (urls) => {
  const pageURLs = [];
  await Promise.all(
    urls.map(async (url) => {
      if (downloadStatus !== "WAITING_INIT")
        throw new Error(STOP_MESSAGE_ON_INIT);
      const res = await fetch(url);
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(await res.text(), "text/html");
      const base = doc.createElement("base");
      base.setAttribute("href", URL_HOME);
      doc.head.appendChild(base);
      const elements =
        doc.querySelectorAll<HTMLAnchorElement>(".contentslist li a");

      elements.forEach((element) => {
        pageURLs.push(element.href);
        progressDisp(null, `${pageURLs.length}個のページを検出 (3/4)`, null);
      });
    })
  );
  return pageURLs;
};
// ファイル情報の配列を返す。例: ({ url: https://hogehoge.pdf, courseName: ○○演習, contentName: 第一回課題資料})
const getFileInfo = async (urls) => {
  const fileInfo = [];
  await Promise.all(
    urls.map(async (url) => {
      if (downloadStatus !== "WAITING_INIT")
        throw new Error(STOP_MESSAGE_ON_INIT);
      const res = await fetch(url);
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(await res.text(), "text/html");
      const base = doc.createElement("base");
      base.setAttribute("href", URL_HOME);
      doc.head.appendChild(base);
      const elements = doc.querySelectorAll<HTMLAnchorElement>(".file a");

      const courseName =
        doc.querySelector<HTMLAnchorElement>("#coursename").innerText;
      const contentName =
        doc.querySelector<HTMLAnchorElement>(".contents a").innerText;
      elements.forEach((element) => {
        fileInfo.push({
          url: element.href,
          courseName,
          contentName,
        });
        progressDisp(null, `${fileInfo.length} 個のファイルを検出 (4/4)`, null);
      });
    })
  );
  return fileInfo;
};
// chromeのローカルストレージに保存されたDL済み情報を返す。
const getStoredUrls = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get([DOWNLOAD_LIST], (value) => {
      let result = [];
      if (value && Object.keys(value).length !== 0) {
        result = value[DOWNLOAD_LIST];
      }
      resolve(result);
    });
  });
};
// hrefを基準に、storedsに存在しないrawsのデータを返す。
const filterInfo = (raws, storeds) => {
  const mustDLfileInfo = [];
  for (const raw of raws) {
    let isNew = true;
    for (const stored of storeds) {
      if (raw.url === stored.url) isNew = false;
    }
    if (isNew) mustDLfileInfo.push(raw);
  }
  return mustDLfileInfo;
};
const downloadFiles = async (mustDLfileInfo, storedUrls) => {
  interface File {
    url: string;
    courseName: string;
    contentName: string;
  }
  const downloadFile: (file: File) => Promise<void> = async (file) => {
    const filenameEx = decodeURI(file.url.match(".+/(.+?)([?#;].*)?$")[1]);
    let filePath = PathModule.join(
      "Manaba",
      file.courseName.replace("/", "-"),
      file.contentName.replace("/", "-"),
      filenameEx.replace("/", "-")
    );
    filePath = filePath.replace(/\s+/g, "");
    chrome.downloads.download(
      { url: file.url, filename: filePath, saveAs: false },
      (downloadID) => {
        id = downloadID;
      }
    );
    return await new Promise((resolve, reject) => {
      resolveHold = resolve;
      rejectHold = reject;
    });
  };
  let resolveHold: (value: void | PromiseLike<void>) => void;
  let rejectHold: (value: void | PromiseLike<void>) => void;
  chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (id !== downloadDelta.id) return;
    if (downloadDelta.state) {
      console.log(downloadDelta.state);
      if (downloadDelta.state.current === "interrupted") rejectHold();
      if (downloadDelta.state.current === "complete") resolveHold();
    }
  });
  for (let i = 0; i < mustDLfileInfo.length; i++) {
    if (downloadStatus !== "DOWNLOADING") throw new Error(STOP_MESSAGE_ON_DL);
    const file = mustDLfileInfo[i];
    progressDisp(
      `${file.courseName} をダウンロード中`,
      `${i + 1}/${mustDLfileInfo.length}`,
      ((i + 1) / mustDLfileInfo.length) * 100
    );
    await downloadFile(file)
      .then(() => {
        storedUrls.push(file);
        chrome.storage.local.set({ [DOWNLOAD_LIST]: storedUrls }, () => {
          console.log("store url");
        });
      })
      .catch((e) => {
        if (downloadStatus !== "DOWNLOADING")
          throw new Error(STOP_MESSAGE_ON_DL);
        console.log(e);
        if (
          !window.confirm(
            "接続エラーが発生しました。次のファイルを続けてダウンロードしますか？"
          )
        ) {
          stopDL();
          throw new Error(STOP_MESSAGE_ON_DL_CONFIRM);
        }
      });
  }
};
type ProgressDisp = (
  message: string | null | undefined,
  rate: string | null | undefined,
  progressN: number | null | undefined
) => void;
const progressDisp: ProgressDisp = (
  message = null,
  rate = null,
  progressN = null
) => {
  if (message) document.getElementById("message").innerHTML = message;
  if (rate) document.getElementById("number-counter").innerHTML = rate;
  if (progressN)
    (document.getElementById("progress") as HTMLProgressElement).value =
      progressN;
};
startDownloadContents();
// debug(JSON.parse('[{"url":"https://room.chuo-u.ac.jp/ct/page_3102310c2368869_3222457479_3759335733/20210927os.pdf?view=full","courseName":"オペレーティングシステム技術","contentName":"授業資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3102310c2368869_3222457479_3490916946/20210927os-sub.pdf?view=full","courseName":"オペレーティングシステム技術","contentName":"授業資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3085900c2368863_1343431926_2417224013/%E9%85%8D%E5%B8%83%E7%94%A8_%E7%AC%AC1%E5%9B%9E_%E6%9C%80%E9%81%A9%E5%8C%96_2021.pdf?view=full","courseName":"最適化","contentName":"オンライン参加用の講義資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3085900c2368863_2685602822_2954059957/%E9%85%8D%E5%B8%83%E7%94%A8_%E7%AC%AC2%E5%9B%9E_%E6%9C%80%E9%81%A9%E5%8C%96_2021.pdf?view=full","courseName":"最適化","contentName":"オンライン参加用の講義資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3083499c2368986_1611858048_1880272815/%E7%AC%AC1%E5%9B%9E_%E8%AC%9B%E7%BE%A9%E8%B3%87%E6%96%99.pdf?view=full","courseName":"開発系プログラミング演習","contentName":"授業"},{"url":"https://room.chuo-u.ac.jp/ct/page_3111153c2368884_1074985888_3222453811/01_mental.pdf?view=full","courseName":"ソフトウェア技術","contentName":"履修方法と質問方法"},{"url":"https://room.chuo-u.ac.jp/ct/page_3111153c2368884_1074989961_1343441366/02_competency.pdf?view=full","courseName":"ソフトウェア技術","contentName":"履修方法と質問方法"},{"url":"https://room.chuo-u.ac.jp/ct/page_3100797c2368866_1880270090_2148725126/01.pdf?view=full","courseName":"数理情報学３","contentName":"[01]"},{"url":"https://room.chuo-u.ac.jp/ct/page_3100797c2368866_1880270090_3759331448/01A.pdf?view=full","courseName":"数理情報学３","contentName":"[01]"},{"url":"https://room.chuo-u.ac.jp/ct/page_3128882c2368866_269688168_2685605749/02.pdf?view=full","courseName":"数理情報学３","contentName":"[02]"},{"url":"https://room.chuo-u.ac.jp/ct/page_3102332c2368872_806551547_806551544/20210927lf.pdf?view=full","courseName":"大規模・高速計算","contentName":"授業資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3089922c2365554_2685593211_3759327649/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC3%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第３回授業（2021-10-05）の課題文献"},{"url":"https://room.chuo-u.ac.jp/ct/page_3117904c2365554_1880276057_3490916835/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC3%E5%9B%9E%E8%AC%9B%E7%BE%A9%E7%94%A8%EF%BC%88%E4%BA%8B%E5%89%8D%E9%85%8D%E5%B8%83%E7%94%A8%EF%BC%89.pdf?view=full","courseName":"科学技術英語","contentName":"第３回授業（2021-10-05）の講義ノート"},{"url":"https://room.chuo-u.ac.jp/ct/page_3117895c2365554_3759334705_538116965/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC4%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第４回授業（2021-10-12）の課題文献"},{"url":"https://room.chuo-u.ac.jp/ct/page_3080183c2365554_2417222730_3222447365/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%91%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第１回授業（2021-09-21）の講義マテリアル"},{"url":"https://room.chuo-u.ac.jp/ct/page_3080183c2365554_2417222730_3222448987/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%91%E5%9B%9E%20%E8%AC%9B%E7%BE%A9%E7%94%A8%EF%BC%88%E4%BA%8B%E5%89%8D%E9%85%8D%E5%B8%83%EF%BC%894in1.pdf?view=full","courseName":"科学技術英語","contentName":"第１回授業（2021-09-21）の講義マテリアル"},{"url":"https://room.chuo-u.ac.jp/ct/page_3080279c2365554_2417222734_1611856817/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%92%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第２回授業（2021-09-28）の 課題文献"},{"url":"https://room.chuo-u.ac.jp/ct/page_3089910c2365554_806543032_3089909/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%92%E5%9B%9E%E8%AC%9B%E7%BE%A9%E7%94%A8%EF%BC%88%E4%BA%8B%E5%89%8D%E9%85%8D%E5%B8%83%E7%94%A8%EF%BC%89.pdf?view=full","courseName":"科学技術英語","contentName":"第２回授業（2021-09-28）の 講義ノート"}]'))
