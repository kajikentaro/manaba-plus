import { DOWNLOAD_LIST, MPError, STOP_MESSAGE_ON_DL, STOP_MESSAGE_ON_DL_CONFIRM, STOP_MESSAGE_ON_INIT, URL_HOME } from "module/const";
import downloadFile from "module/DownloadFile";
import fetchDocument from "module/FetchDocument";
import { DownloadStatus, FileInfo, FilterInfo, ProgressDisp, UrlDigFunction } from "module/type";

let downloadStatus: DownloadStatus = "WAITING_INIT";
let downloadChromeId = -1;

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
    if (downloadStatus !== "WAITING_INIT") throw new MPError(STOP_MESSAGE_ON_INIT);
    if (mustDLfileInfo.length === 0) {
      downloadStatus = "DONE";
      progressDisp("完了。新規ファイルはありませんでした。", null, null);
      return;
    }

    // ダウンロード開始
    downloadStatus = "DOWNLOADING";
    await downloadFiles(mustDLfileInfo, alreadyStoredFileInfo);
    downloadStatus = "DONE";
    progressDisp("ダウンロードが完了しました。", null, null);
  } catch (e) {
    const mpError = e as MPError;
    if (mpError.MP_IDENTIFY) {
      progressDisp(mpError.message, null, null);
    } else {
      throw e;
    }
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
  if (downloadStatus === "DONE" || downloadStatus === "STOPPED_OR_ERROR") return;
  progressDisp("ダウンロードの中止中. . .", null, null);
  downloadStatus = "STOPPED_OR_ERROR";
  if (downloadChromeId !== -1) {
    chrome.downloads.cancel(downloadChromeId, () => {});
  }
};

const getCourseURLs: () => Promise<string[]> = async () => {
  const doc = await fetchDocument(URL_HOME);
  const manabaCourseDOMs = doc.querySelectorAll<HTMLAnchorElement>(".course-cell a:first-child");

  const courseURLs = [] as string[];
  manabaCourseDOMs.forEach((manabaCourseDOM) => {
    courseURLs.push(manabaCourseDOM.href);
    progressDisp(null, `${courseURLs.length}個のコースを検出 (1/4)`, null);
  });
  return courseURLs;
};

const getContentURLs: UrlDigFunction = async (urls) => {
  const contentURLs = [] as string[];
  await Promise.all(
    urls.map(async (url) => {
      if (downloadStatus !== "WAITING_INIT") throw new MPError(STOP_MESSAGE_ON_INIT);
      const doc = await fetchDocument(`${url}_page`);
      const elements = doc.querySelectorAll<HTMLAnchorElement>(".about-contents a");

      elements.forEach((element) => {
        if (downloadStatus !== "WAITING_INIT") throw new MPError(STOP_MESSAGE_ON_INIT);
        contentURLs.push(element.href);
        progressDisp(null, `${contentURLs.length}個のコンテンツを検出 (2/4)`, null);
      });
    })
  );
  return contentURLs;
};

const getPageURLs: UrlDigFunction = async (urls: string[]) => {
  const pageURLs = [] as string[];
  await Promise.all(
    urls.map(async (url) => {
      if (downloadStatus !== "WAITING_INIT") throw new MPError(STOP_MESSAGE_ON_INIT);
      const doc = await fetchDocument(url);
      const elements = doc.querySelectorAll<HTMLAnchorElement>(".contentslist li a");
      elements.forEach((element) => {
        pageURLs.push(element.href);
        progressDisp(null, `${pageURLs.length}個のページを検出 (3/4)`, null);
      });
    })
  );
  return pageURLs;
};

const getFileInfo = async (urls: string[]) => {
  const fileInfo = [] as FileInfo[];
  await Promise.all(
    urls.map(async (url) => {
      if (downloadStatus !== "WAITING_INIT") throw new MPError(STOP_MESSAGE_ON_INIT);
      const doc = await fetchDocument(url);
      const elements = doc.querySelectorAll<HTMLAnchorElement>(".file a");
      const courseName = doc.querySelector<HTMLAnchorElement>("#coursename").innerText;
      const contentName = doc.querySelector<HTMLAnchorElement>(".contents a").innerText;

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
const getStoredUrls: () => Promise<FileInfo[]> = () => {
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
const filterInfo: FilterInfo = (raws, storeds) => {
  const mustDLfileInfo = [] as FileInfo[];
  for (const raw of raws) {
    let isNew = true;
    for (const stored of storeds) {
      if (raw.url === stored.url) isNew = false;
    }
    if (isNew) mustDLfileInfo.push(raw);
  }
  return mustDLfileInfo;
};

const downloadFiles = async (mustDLfileInfo: FileInfo[], storedUrls: FileInfo[]) => {
  for (let i = 0; i < mustDLfileInfo.length; i++) {
    if (downloadStatus !== "DOWNLOADING") throw new MPError(STOP_MESSAGE_ON_DL);
    const file = mustDLfileInfo[i];
    progressDisp(`${file.courseName} をダウンロード中`, `${i + 1}/${mustDLfileInfo.length}`, ((i + 1) / mustDLfileInfo.length) * 100);
    const setGlobalDownloadId = (downloadId: number) => {
      downloadChromeId = downloadId;
    };
    await downloadFile(file, setGlobalDownloadId)
      .then(() => {
        storedUrls.push(file);
        chrome.storage.local.set({ [DOWNLOAD_LIST]: storedUrls }, () => {});
      })
      .catch((e) => {
        if (downloadStatus !== "DOWNLOADING") throw new MPError(STOP_MESSAGE_ON_DL);
        if (!window.confirm("接続エラーが発生しました。次のファイルを続けてダウンロードしますか？")) {
          stopDL();
          throw new MPError(STOP_MESSAGE_ON_DL_CONFIRM);
        }
      });
  }
};

const progressDisp: ProgressDisp = (message = null, rate = null, progressN = null) => {
  if (message) document.getElementById("message").innerHTML = message;
  if (rate) document.getElementById("number-counter").innerHTML = rate;
  if (progressN) document.querySelector<HTMLProgressElement>("progress#progress").value = progressN;
};

startDownloadContents();
