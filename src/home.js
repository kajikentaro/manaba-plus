import {URL_HOME, ENABLE_INSERT_MP, HIDED_ASSIGNHMENT} from "./const";
const DELETABLE_ROW = "deletable-row";
let preClickedLabel = "deadline";
let sortIsReverse = false;
let showDisable = false;
let allAssignments;
let hidedAssignments;
let startMpDone = false;
let showExtraAss = false;
const init = async () =>{
	const enableInsertMp = await isEnableInsertMp()
	if (enableInsertMp === false) return;
	await insertMpButton();
	document.getElementById("download-content").onclick = () => {
		if (confirm("コースコンテンツをPCにまとめてダウンロードします。続行しますか？")) {
			window.open(chrome.runtime.getURL("download-progress.html"));
		}
	}
	document.getElementById("open-option").onclick = () => {
			window.open(chrome.runtime.getURL("options.html"));
	}
}
const startMp = async ()=>{
	// prevent over two times button click
	if (startMpDone) {
		return;
	}
	startMpDone = true;
	// fetch assignment datas
	allAssignments = await fetchSummaries();
	hidedAssignments = await fetchHided();
	// show toggles
	document.getElementById("toggles").style.display = "flex";

	document.getElementById("toggle-extra-ass-hide").onchange = (e) => {
		showExtraAss = e.target.checked;
		reviewTable(allAssignments, preClickedLabel, sortIsReverse);
	}
	document.getElementById("toggle-hide").onchange = (e) => {
		showDisable = e.target.checked;
		reviewTable(allAssignments, preClickedLabel, sortIsReverse);
	}

	setDisables(allAssignments, hidedAssignments);// allAssignmentsのdisableを設定する。
	reviewTable(allAssignments);
}
const getCourseURLs = () => {
  const manabaCourseDOMs = document.querySelectorAll(".course-cell a:first-child");
  const courseURLs = [];
  manabaCourseDOMs.forEach(manabaCourseDOM => {
    courseURLs.push(manabaCourseDOM.href);
  })
  return courseURLs;
};
const isEnableInsertMp = async () => {
	const res = await new Promise((resolve) => {
		chrome.storage.local.get([ENABLE_INSERT_MP], function (result) {
			if (result.enableInsertMp === undefined) resolve(true);
			resolve(result.enableInsertMp);
		});
	});
	return res;
}
const fetchHided = async () => {
	const res = await new Promise((resolve) => {
		chrome.storage.sync.get([HIDED_ASSIGNHMENT], function (result) {
			if (!result.hidedAssignment) resolve([]);
			resolve(result.hidedAssignment);
		});
	});
	return res;
}
function setDisables(all, hided) {
	for (const ass of all) {
		if (hided.includes(ass.href)) {
			ass.disable = true;
		} else {
			ass.disable = false;
		}
	}
}
const fetchSummaries = async () => {
	const docParser = (doc) => {
		const clipStr = element => {
			let str = element.innerText;
			str = str.replace(/\r?\n/g, ""); // delete return
			str = str.replace(/\s+/g, "");// delete space
			return str;
		};
		const assignmentDomRows = doc.getElementsByTagName("table")[0].getElementsByTagName("tr");
		for (let i = 0; i < assignmentDomRows.length; i++){
			if (i === 0) continue; // skip title
			const cols = assignmentDomRows[i].children;
			const dict = {
				courseName: clipStr(cols[1]),
				href: cols[0].getElementsByTagName("a")[0].href,
				assignmentName: clipStr(cols[0]),
				deadline: cols[2].innerText ? new Date(cols[2].innerText) : Infinity,// 暫定処置
			}
			const assignment = new Assignment();
			assignment.initJson(dict);
			assignments.push(assignment);
		}
	}
	const assignments = [];
	const targetUrls = [URL_HOME + "_summary_query", URL_HOME + "_summary_survey", URL_HOME + "_summary_report"];
	for (const url of targetUrls) {
		const res = await fetch(url);
		const text = await res.text();
		const domparser = new DOMParser();
		const doc = domparser.parseFromString(text, "text/html");
		docParser(doc);
	}
	return assignments;
}
const insertMpButton = async ()=>{
	const mark = document.getElementsByClassName("contentbody-left")[0];
	mark.insertAdjacentHTML(
		"afterbegin",
		(await (await fetch(chrome.runtime.getURL("insert.html"))).text())
	);
	document.getElementById("show-assignment").onclick = () => {
		startMp();
	}
	
}

const inputClick = () => {
	// update disable or enable setting of assignments
	collectAndPreserve();
	reviewTable(allAssignments, preClickedLabel, sortIsReverse);
	function collectAndPreserve(){
		const disableHref = [];
		for (const row of allAssignments) {
			if (row.disable === true) {
				disableHref.push(row.href);
			}
		}
		chrome.storage.sync.set({ [HIDED_ASSIGNHMENT]: disableHref }, function () {
		});
	}
}
const reviewTable = (rows, sortBase = "deadline", reverse = false) => {
	clearAssignment();
	insertLabel(sortBase, reverse);
	const courseURLs = getCourseURLs();
	const enableRows = filter();
	insertRows(enableRows);
	function filter() {
		const enableRow = [];
		for (const row of rows) {
			if (showDisable === false) {// フィルターがオンの場合
				if (row.disable === true) continue;// 非表示なら表示しない
			}
			if (showExtraAss === false) {// extraを表示しない場合
				let skip = true;
				for (const courseURL of courseURLs) {
					// row.hrefに全てのcourseURLが含まれなければスキップ
					if (row.href.indexOf(courseURL) !== -1) skip = false;
				}
				if (skip) continue;
			}
			enableRow.push(row);
		}
		// ソート
		enableRow.sort((a, b) => {
			if (reverse) {
				if (a[sortBase] >= b[sortBase]) { return -1; } else { return 1; }
			} else {
				if (a[sortBase] < b[sortBase]) { return -1; } else { return 1; }
			}
		});
		return enableRow;
	}
	function insertLabel(SortBase, Reverse) {
		const tr = document.createElement("tr");
		tr.classList.add("table-header");
		tr.classList.add(DELETABLE_ROW);

		const classes = ["course", "ass", null, null, null];
		const sortBases = ["course_name", "assignment_name", null, "deadline"];
		const texts = ["コース", "題名", "非表示",  "受付終了"];
		for (let i = 0; i < 4; i++) {
			const th = document.createElement("th");
			tr.appendChild(th);
			if (sortBases[i] === SortBase) {// ここを基準にソートした場合
				th.classList.add("sort-active");
				th.innerHTML = Reverse ? texts[i] + "▼" : texts[i] + "▲";
			} else if (sortBases[i]) {// それ以外の場合
				th.innerHTML = texts[i] + "　";
			} else {// inputの場合
				th.innerHTML = texts[i];
			}
			if (!sortBases[i]) continue;
			if (classes[i]) th.classList.add(classes[i]);
			th.classList.add("sort-label");
			th.onclick = function () {
				const closer = () => {
					if (preClickedLabel === sortBases[i]) sortIsReverse = !sortIsReverse;
					else sortIsReverse = false;
					preClickedLabel = sortBases[i];
					reviewTable(allAssignments, sortBases[i], sortIsReverse);
				}
				return closer;
			}();
		}
		const addParent = document.getElementById("mp-table");
		addParent.appendChild(tr);
	}
	function insertRows(rows) {
		const addParent = document.getElementById("mp-table");
		if (rows.length === 0) {
			const noAssMessage = document.createElement("tr");
			noAssMessage.classList.add(DELETABLE_ROW);
			noAssMessage.classList.add("no-assignment-message");
			noAssMessage.innerHTML = "ないヨ。 _(:3 」∠ )_ ";
			noAssMessage.setAttribute("rowspan", "5");
			addParent.appendChild(noAssMessage);
		} else {
			for (const row of rows) {
				addParent.appendChild(row.getTd());
			}
		}
	}
	function clearAssignment() {
		const removeRows = document.getElementsByClassName(DELETABLE_ROW);
		while (removeRows.length) {
			removeRows[0].remove();
		}
	}
}
class Assignment {
	initJson(dict) {
		this.courseName = dict.courseName;
		this.href = dict.href;
		this.assignmentName = dict.assignmentName;
		this.status = dict.status;
		this.disable = dict.disable;
		this.deadline = dict.deadline;
		this.colorCode = this.getColor(this.deadline);
	}

	getColor(deadline) {
		if (deadline === Infinity) return "#F4F4F4";
		const nowTime = new Date(new Date().toLocaleString({ timeZone: "Asia/Tokyo" }));
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

	dateToStr(date) {
		if (date === Infinity) return ""
		const datesJp = ["日", "月", "火", "水", "木", "金", "土"];
		let txt = "";
		txt += (date.getMonth() + 1) + "/";
		txt += date.getDate() + "(";
		txt += datesJp[date.getDay()] + ") ";
		txt += date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
		return txt;
	}

	setupInput(td) {
		td.classList.add("input");
		td.onclick = (e) => {
			this.disable = !this.disable;
			inputClick();
			e.stopPropagation();
		}
		if (this.disable === true) {
			td.innerHTML = '<div class="flex"><input type="checkbox" checked="true"></div>'
		} else {
			td.innerHTML = '<div class="flex"><input type="checkbox"></div>'
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
		tr.insertCell().innerHTML = this.dateToStr(this.deadline)
		tr.style.backgroundColor = this.colorCode;
		return tr;
	}
}
init();