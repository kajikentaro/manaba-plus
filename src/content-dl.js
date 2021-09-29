const path_module = require('path');
let status = 1;
let id = -1;
//0 stop, error
//1 waiting init
//2 downloading
//3 finish
const STOP_MESSAGE_ON_DL = "ファイルダウンロードが中止されました。";
const STOP_MESSAGE_ON_INIT = "ダウンロードが中止されました。";
const STOP_MESSAGE_ON_DL_CONFIRM = "ダウンロードが中断されました。";

const startDownloadContents = async () => {
  // 「準備中...」を表示する
  loadingDisplay();
  document.getElementById("stop-dl").onclick = stopDL;

  try {
    progressDisp(null,"URLリストを取得中");
    // スクレイピング開始
    const courseURLs = await getCourseURLs();
    const contentURLs = await getContentURLs(courseURLs);
    const pageURLs = await getPageURLs(contentURLs);
    const allFileInfo = await getFileInfo(pageURLs);

    const alreadyStoredFileInfo = await getStoredUrls();
    const mustDLfileInfo = filterInfo(allFileInfo, alreadyStoredFileInfo);
    if (status !== 1) throw new Error(STOP_MESSAGE_ON_INIT);
    if (mustDLfileInfo.length === 0) {
      status = 3;
      progressDisp("完了。新規ファイルはありませんでした。")
      return;
    }
    status = 2;
    await downloadFiles(mustDLfileInfo, alreadyStoredFileInfo);
    status = 3;
    progressDisp("ダウンロードが完了しました。")
  } catch (e) {
    // eが想定外のエラーの場合はそのままthrowする。
    if (e.message !== STOP_MESSAGE_ON_INIT && e.message !== STOP_MESSAGE_ON_DL && e.message !== STOP_MESSAGE_ON_DL_CONFIRM) throw e;
    // 想定内は表示
    progressDisp(e.message);
  }
}
function loadingDisplay() {
  var dot_num = 0;
  showInitializingDot();
  function showInitializingDot() {
    let message = document.getElementById("message");
    let text = ["準備中", "準備中 .", "準備中 . .", "準備中 . . ."];
    if (status == 1) {
      dot_num++;
      message.innerHTML = text[dot_num % 4];
      setTimeout(showInitializingDot, 500);
    }
  }
}
const stopDL = () => {
  if (status === 3 || status === 0) return;
  progressDisp('ダウンロードの中止中. . .')
  status = 0;
  if (id !== -1) {
    chrome.downloads.cancel(id, () => {
      console.log("cancel chrome downloads")
      //例外のスローはダウンロードしたメソッドのcatchで行う。
    });
  }
}

const getCourseURLs = async () => {
  const topPageRes = await fetch("https://room.chuo-u.ac.jp/ct/home")
  const domparser = new DOMParser();
  const topPageDOM = domparser.parseFromString(await topPageRes.text(), "text/html");
  let base = topPageDOM.createElement("base");
  base.setAttribute("href", "https://room.chuo-u.ac.jp/ct/home");
  topPageDOM.head.appendChild(base);
  const manabaCourseDOMs = topPageDOM.querySelectorAll(".course-cell a:first-child");

  let courseURLs = [];
  manabaCourseDOMs.forEach(manabaCourseDOM => {
    courseURLs.push(manabaCourseDOM.href);
    progressDisp(null, courseURLs.length + "個のコースを検出 (1/4)");
  })
  return courseURLs;
};
const getContentURLs = async (urls) => {
  let contentURLs = [];
  for (let url of urls) {
    if (status !== 1) throw new Error(STOP_MESSAGE_ON_INIT)
    const res = await fetch(url + "_page");
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(await res.text(), "text/html");
    let base = doc.createElement("base");
    base.setAttribute("href", "https://room.chuo-u.ac.jp/ct/home");
    doc.head.appendChild(base);
    const elements = doc.querySelectorAll(".about-contents a");

    elements.forEach(element => {
      contentURLs.push(element.href);
      progressDisp(null, contentURLs.length + "個のコンテンツを検出 (2/4)");
    });
  }
  return contentURLs;
}
const getPageURLs = async (urls) => {
  let pageURLs = [];
  for (let url of urls) {
    if (status !== 1) throw new Error(STOP_MESSAGE_ON_INIT)
    const res = await fetch(url);
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(await res.text(), "text/html");
    let base = doc.createElement("base");
    base.setAttribute("href", "https://room.chuo-u.ac.jp/ct/home");
    doc.head.appendChild(base);
    const elements = doc.querySelectorAll(".contentslist li a");

    elements.forEach(element => {
      pageURLs.push(element.href);
      progressDisp(null, pageURLs.length + "個のページを検出 (3/4)");
    });
  }
  return pageURLs;
}
// ファイル情報の配列を返す。例: ({ url: https://hogehoge.pdf, courseName: ○○演習, contentName: 第一回課題資料})
const getFileInfo = async (urls) => {
  let fileInfo = [];
  for (let url of urls) {
    if (status !== 1) throw new Error(STOP_MESSAGE_ON_INIT)
    const res = await fetch(url);
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(await res.text(), "text/html");
    let base = doc.createElement("base");
    base.setAttribute("href", "https://room.chuo-u.ac.jp/ct/home");
    doc.head.appendChild(base);
    const elements = doc.querySelectorAll(".file a");

    const courseName = doc.querySelector("#coursename").innerText;
    const contentName = doc.querySelector(".contents a").innerText;
    elements.forEach(element => {
      fileInfo.push({
        url: element.href, courseName: courseName, contentName: contentName
      });
      progressDisp(null, fileInfo.length + " 個のファイルを検出 (4/4)");
    });
  }
  return fileInfo;
}
// chromeのローカルストレージに保存されたDL済み情報を返す。
const getStoredUrls = () => {
  return new Promise(resolve => {
    chrome.storage.local.get('download_list', (value) => {
      var result = [];
      if (value && Object.keys(value).length !== 0) {
        result = value.download_list;
      }
      resolve(result);
    });
  })
}
// hrefを基準に、storedsに存在しないrawsのデータを返す。
const filterInfo = (raws, storeds) => {
  var mustDLfileInfo = [];
  for (var raw of raws) {
    var is_new = true;
    for (var stored of storeds) {
      if (raw.url == stored.url) is_new = false;
    }
    if (is_new) mustDLfileInfo.push(raw);
  }
  return mustDLfileInfo;
}
const downloadFiles = async (mustDLfileInfo, stored_urls) => {
  var resolveHold;
  var rejectHold;
  chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (id !== downloadDelta.id) return;
    if (downloadDelta.state) {
      console.log(downloadDelta.state);
      if (downloadDelta.state.current == 'interrupted') rejectHold();
      if (downloadDelta.state.current == 'complete') resolveHold();
    }
  });
  for (var i = 0; i < mustDLfileInfo.length; i++) {
    if (status !== 2) throw new Error(STOP_MESSAGE_ON_DL);
    var file = mustDLfileInfo[i];
    progressDisp(file.courseName + ' をダウンロード中', (i + 1) + "/" + mustDLfileInfo.length, (i + 1) / mustDLfileInfo.length * 100);
    await downloadFile(file).then(() => {
      stored_urls.push(file);
      chrome.storage.local.set({ 'download_list': stored_urls }, () => { console.log('store url') });
    }).catch((e) => {
      if (status !== 2) throw new Error(STOP_MESSAGE_ON_DL);
      console.log(e);
      if (window.confirm("接続エラーが発生しました。次のファイルを続けてダウンロードしますか？")) {
      } else {
        stopDL();
        throw new Error(STOP_MESSAGE_ON_DL_CONFIRM);
      }
    });
  }
  async function downloadFile(file) {
    let filename_ex = decodeURI(file.url.match(".+/(.+?)([\?#;].*)?$")[1]);
    let path = path_module.join('Manaba', file.courseName.replace("/", "-"), file.contentName.replace("/", "-"), filename_ex.replace("/", "-"));
    path = path.replace(/\s+/g, "");
    chrome.downloads.download({ url: file.url, filename: path, saveAs: false }, (downloadID) => {
      id = downloadID;
    });
    return new Promise((resolve, reject) => {
      resolveHold = resolve;
      rejectHold = reject;
    });
  }
  return;
}
function progressDisp(message = null, rate = null, progress_n = null) {
  if (message) document.getElementById('message').innerHTML = message;
  if (rate) document.getElementById('number-counter').innerHTML = rate;
  if (progress_n) document.getElementById('progress').value = progress_n;
}
startDownloadContents();
//debug(JSON.parse('[{"url":"https://room.chuo-u.ac.jp/ct/page_3102310c2368869_3222457479_3759335733/20210927os.pdf?view=full","courseName":"オペレーティングシステム技術","contentName":"授業資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3102310c2368869_3222457479_3490916946/20210927os-sub.pdf?view=full","courseName":"オペレーティングシステム技術","contentName":"授業資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3085900c2368863_1343431926_2417224013/%E9%85%8D%E5%B8%83%E7%94%A8_%E7%AC%AC1%E5%9B%9E_%E6%9C%80%E9%81%A9%E5%8C%96_2021.pdf?view=full","courseName":"最適化","contentName":"オンライン参加用の講義資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3085900c2368863_2685602822_2954059957/%E9%85%8D%E5%B8%83%E7%94%A8_%E7%AC%AC2%E5%9B%9E_%E6%9C%80%E9%81%A9%E5%8C%96_2021.pdf?view=full","courseName":"最適化","contentName":"オンライン参加用の講義資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3083499c2368986_1611858048_1880272815/%E7%AC%AC1%E5%9B%9E_%E8%AC%9B%E7%BE%A9%E8%B3%87%E6%96%99.pdf?view=full","courseName":"開発系プログラミング演習","contentName":"授業"},{"url":"https://room.chuo-u.ac.jp/ct/page_3111153c2368884_1074985888_3222453811/01_mental.pdf?view=full","courseName":"ソフトウェア技術","contentName":"履修方法と質問方法"},{"url":"https://room.chuo-u.ac.jp/ct/page_3111153c2368884_1074989961_1343441366/02_competency.pdf?view=full","courseName":"ソフトウェア技術","contentName":"履修方法と質問方法"},{"url":"https://room.chuo-u.ac.jp/ct/page_3100797c2368866_1880270090_2148725126/01.pdf?view=full","courseName":"数理情報学３","contentName":"[01]"},{"url":"https://room.chuo-u.ac.jp/ct/page_3100797c2368866_1880270090_3759331448/01A.pdf?view=full","courseName":"数理情報学３","contentName":"[01]"},{"url":"https://room.chuo-u.ac.jp/ct/page_3128882c2368866_269688168_2685605749/02.pdf?view=full","courseName":"数理情報学３","contentName":"[02]"},{"url":"https://room.chuo-u.ac.jp/ct/page_3102332c2368872_806551547_806551544/20210927lf.pdf?view=full","courseName":"大規模・高速計算","contentName":"授業資料"},{"url":"https://room.chuo-u.ac.jp/ct/page_3089922c2365554_2685593211_3759327649/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC3%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第３回授業（2021-10-05）の課題文献"},{"url":"https://room.chuo-u.ac.jp/ct/page_3117904c2365554_1880276057_3490916835/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC3%E5%9B%9E%E8%AC%9B%E7%BE%A9%E7%94%A8%EF%BC%88%E4%BA%8B%E5%89%8D%E9%85%8D%E5%B8%83%E7%94%A8%EF%BC%89.pdf?view=full","courseName":"科学技術英語","contentName":"第３回授業（2021-10-05）の講義ノート"},{"url":"https://room.chuo-u.ac.jp/ct/page_3117895c2365554_3759334705_538116965/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC4%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第４回授業（2021-10-12）の課題文献"},{"url":"https://room.chuo-u.ac.jp/ct/page_3080183c2365554_2417222730_3222447365/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%91%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第１回授業（2021-09-21）の講義マテリアル"},{"url":"https://room.chuo-u.ac.jp/ct/page_3080183c2365554_2417222730_3222448987/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%91%E5%9B%9E%20%E8%AC%9B%E7%BE%A9%E7%94%A8%EF%BC%88%E4%BA%8B%E5%89%8D%E9%85%8D%E5%B8%83%EF%BC%894in1.pdf?view=full","courseName":"科学技術英語","contentName":"第１回授業（2021-09-21）の講義マテリアル"},{"url":"https://room.chuo-u.ac.jp/ct/page_3080279c2365554_2417222734_1611856817/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%92%E5%9B%9E%E6%96%87%E7%8C%AE.pdf?view=full","courseName":"科学技術英語","contentName":"第２回授業（2021-09-28）の 課題文献"},{"url":"https://room.chuo-u.ac.jp/ct/page_3089910c2365554_806543032_3089909/%E7%A7%91%E5%AD%A6%E6%8A%80%E8%A1%93%E8%8B%B1%E8%AA%9E2021%EF%BC%88%E7%94%B0%E4%B8%AD%EF%BC%89%E7%AC%AC%EF%BC%92%E5%9B%9E%E8%AC%9B%E7%BE%A9%E7%94%A8%EF%BC%88%E4%BA%8B%E5%89%8D%E9%85%8D%E5%B8%83%E7%94%A8%EF%BC%89.pdf?view=full","courseName":"科学技術英語","contentName":"第２回授業（2021-09-28）の 講義ノート"}]'))