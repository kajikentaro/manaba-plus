'use strict'
import * as component from './methods/component.js';
const DELETABLE_ROW = "deletable-row";
let pre_clicked_label = "deadline";
let sort_is_reverse = false;
let show_disable = false;
const init = async ()=>{
	insert_mp_button();
}
//todo
function insert_toggle() {
	document.getElementById('toggle_disable').style.display = "inline-block";
	document.getElementById('toggle_disable').onclick = () => {
		show_disable = !show_disable;
		review_table(assignment_yet);
		if (show_disable) {
			document.getElementById('toggle_disable').innerHTML = "非表示にする";
		} else {
			document.getElementById('toggle_disable').innerHTML = "非表示も表示";
		}
	}
}
let all_assignments;
let hided_assignments;
//todo
let fetch_hided = async () => {
	const res = await new Promise((resolve) => {
		chrome.storage.sync.get(["hided_assignment"], function (result) {
			if (!result.hided_assignment) resolve([]);
			resolve(result.hided_assignment);
		});
	});
	return res;
}
const start_mp = async ()=>{
	all_assignments = await fetch_summaries();
	hided_assignments = await fetch_hided();
	set_disables(all_assignments, hided_assignments);//all_assignmentsのdisableを設定する。
	review_table(all_assignments);
}
function set_disables(all, hided) {
	for (let ass of all) {
		if (hided.includes(ass.href)) {
			ass.disable = true;
		} else {
			ass.disable = false;
		}
	}
}
const fetch_summaries = async () => {
	const doc_parser = (doc) => {
		let clip_str = element => {
			let str = element.innerText;
			str = str.replace(/\r?\n/g, ''); //delete return
			str = str.replace(/\s+/g, "");//delete space
			return str;
		};
		let assignment_dom_rows = doc.getElementsByTagName("table")[0].getElementsByTagName("tr");
		for (let i = 0; i < assignment_dom_rows.length; i++){
			if (i == 0) continue; // skip title
			let cols = assignment_dom_rows[i].children;
			let dict = {
				course_name: clip_str(cols[1]),
				href: cols[0].getElementsByTagName('a')[0].href,
				assignment_name: clip_str(cols[0]),
				start_time: new Date(clip_str(cols[2])),
				deadline: new Date(clip_str(cols[2])),//暫定処置
			}
			let assignment = new Assignment();
			assignment.init_json(dict);
			assignments.push(assignment);
		}
	}
	let assignments = [];
	let target_urls = ['https://room.chuo-u.ac.jp/ct/home_summary_query', 'https://room.chuo-u.ac.jp/ct/home_summary_survey', 'https://room.chuo-u.ac.jp/ct/home_summary_report'];
	for (let url of target_urls) {
		let res = await fetch(url);
		let text = await res.text();
		let domparser = new DOMParser();
		let doc = domparser.parseFromString(text, 'text/html');
		doc_parser(doc);
	}
	return assignments;
}
const insert_mp_button = ()=>{
	let mp_start = document.createElement("a");
	mp_start.innerHTML = "Manaba Plus";
	let mp_li = document.createElement("li");
	mp_li.appendChild(mp_start);
	let infolist_tab = document.getElementsByClassName("infolist-tab")[0];
	infolist_tab.appendChild(mp_li);
	mp_start.onclick = start_mp;
}

const input_click = () => {
	collect_and_preserve();
	review_table(all_assignments);
	function collect_and_preserve(){
		let disable_href = [];
		for (let row of all_assignments) {
			if (row.disable == true) {
				disable_href.push(row.href);
			}
		}
		chrome.storage.sync.set({ hided_assignment: disable_href }, function () {
		});
	}
}
let review_table = (rows, sort_base = "deadline", reverse = false) => {
	clear_assignment();
	insert_label(sort_base, reverse);
	let enable_rows = filter();
	insert_rows(enable_rows);
	function filter() {
		let enable_row = [];
		for (let row of rows) {
			if (show_disable == false) {//フィルターがオンの場合
				if (row.disable == true) continue;//非表示なら表示しない
			}
			enable_row.push(row);
		}
		//ソート
		enable_row.sort((a, b) => {
			if (reverse) {
				if (a[sort_base] >= b[sort_base]) { return -1; } else { return 1; }
			} else {
				if (a[sort_base] < b[sort_base]) { return -1; } else { return 1; }
			}
		});
		return enable_row;
	}
	function insert_label(_sort_base, _reverse) {
		let tr = document.createElement("tr");
		tr.classList.add("table-header");
		tr.classList.add(DELETABLE_ROW);

		let classes = ["course", "ass", null, null, null];
		let sort_bases = ["course_name", "assignment_name", null, "start_time", "deadline"];
		let texts = ["コース", "題名", "非表示", "受付開始", "受付終了"];
		for (let i = 0; i < 5; i++) {
			let th = document.createElement("th");
			tr.appendChild(th);
			if (sort_bases[i] == _sort_base) {//ここを基準にソートした場合
				th.classList.add("sort-active");
				th.innerHTML = _reverse ? texts[i] + "▼" : texts[i] + "▲";
			} else if (sort_bases[i]) {//それ以外の場合
				th.innerHTML = texts[i] + "　";
			} else {//inputの場合
				th.innerHTML = texts[i];
			}
			if (!sort_bases[i]) continue;
			if (classes[i]) th.classList.add(classes[i]);
			th.classList.add("sort-label");
			th.onclick = function () {
				let closer = () => {
					if (pre_clicked_label == sort_bases[i]) sort_is_reverse = !sort_is_reverse;
					else sort_is_reverse = false;
					pre_clicked_label = sort_bases[i];
					review_table(backup_AY, sort_bases[i], sort_is_reverse);
				}
				return closer;
			}();
		}
		let add_parent = document.getElementsByClassName('contentbody-l')[0];
		add_parent.appendChild(tr);
	}
	function insert_rows(rows) {
		let add_parent = document.getElementsByClassName('contentbody-l')[0];
		if (rows.length == 0) {
			let no_ass_message = document.createElement("tr");
			no_ass_message.classList.add(DELETABLE_ROW);
			no_ass_message.classList.add("no-assignment-message");
			no_ass_message.innerHTML = "ないヨ。 _(:3 」∠ )_ ";
			no_ass_message.setAttribute("rowspan", "5");
			add_parent.appendChild(no_ass_message);
		} else {
			for (let row of rows) {
				add_parent.appendChild(row.get_td());
			}
		}
	}
	function clear_assignment() {
		let remove_rows = document.getElementsByClassName(DELETABLE_ROW);
		while (remove_rows.length) {
			remove_rows[0].remove();
		}
	}
}
class Assignment {
	init_json(dict) {
		this.course_name = dict.course_name;
		this.href = dict.href;
		this.assignment_name = dict.assignment_name;
		this.status = dict.status;
		this.disable = dict.disable;
		this.start_time = new Date(dict.start_time);
		this.deadline = new Date(dict.deadline);
		this.color_code = dict.color_code;
	}
	init_row(row, course_name) {
		this.course_name = course_name;
		this.href = row.children[0].getElementsByTagName("a")[0].href;
		this.assignment_name = row.children[0].getElementsByTagName("a")[0].innerHTML;
		this.status = "受付中";
		this.disable = true;
		this.start_time = row.children[2].innerHTML ? new Date(row.children[2].innerHTML) : -Infinity;
		this.deadline = row.children[3].innerHTML ? new Date(row.children[3].innerHTML) : Infinity;
		this.color_code = this.get_color(this.deadline);
	}
	get_color(deadline) {
		if (deadline == Infinity) return "#F4F4F4";
		let now_time = new Date(new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }));
		let time_diff = deadline.getTime() - now_time.getTime();
		let day_diff = Math.floor(time_diff / (1000 * 60 * 60 * 24));
		if (day_diff < 1) {
			return '#ffe6e9';
		} else if (day_diff < 3) {
			return '#fff4d1';
		} else if (day_diff < 7) {
			return '#cce8cc';
		} else {
			return "#F4F4F4";
		}
	}
	date_to_str(date) {
		if (date == Infinity || date == -Infinity) return ""
		let dates_jp = ["日", "月", "火", "水", "木", "金", "土"];
		let txt = "";
		txt += (date.getMonth() + 1) + "/";
		txt += date.getDate() + "(";
		txt += dates_jp[date.getDay()] + ") ";
		txt += date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
		return txt;
	}
	setup_input(td) {
		td.classList.add("input");
		td.onclick = (e) => {
			this.disable = !this.disable;
			input_click();
			e.stopPropagation();
		}
		if (this.disable == true) {
			td.innerHTML = '<input type="checkbox" checked="true">'
		} else {
			td.innerHTML = '<input type="checkbox">'
		}
	}
	get_td() {
		let tr = document.createElement("tr");
		tr.classList.add(DELETABLE_ROW);

		let td_course = tr.insertCell();
		td_course.innerHTML = this.course_name;
		td_course.classList.add("course");

		let td_ass = tr.insertCell();
		td_ass.innerHTML = "<a href='" + this.href + "'>" + this.assignment_name + "</a>";
		td_ass.classList.add("ass");
		this.setup_input(tr.insertCell());
		tr.insertCell().innerHTML = this.date_to_str(this.start_time)
		tr.insertCell().innerHTML = this.date_to_str(this.deadline)
		tr.style.backgroundColor = this.color_code;
		return tr;
	}
}
init();
//CODE FOR DEVELOPMENT
/*
let DEV = JSON.parse('[{"course_name":"社会情報学２","href":"https://room.chuo-u.ac.jp/ct/course_2369010_report_2631393","assignment_name":"第3回講義レポート","status":"受付中","disable":true,"start_time":"2021-04-23T08:00:00.000Z","deadline":"2021-04-29T14:55:00.000Z","color_code":"#cce8cc"},{"course_name":"実践プログラミング","href":"https://room.chuo-u.ac.jp/ct/course_2369115_report_2653818","assignment_name":"[03A]","status":"受付中","disable":true,"start_time":"2021-04-22T04:00:00.000Z","deadline":"2021-04-27T03:00:00.000Z","color_code":"#fff4d1"},{"course_name":"計算幾何学","href":"https://room.chuo-u.ac.jp/ct/course_2368875_query_2649329","assignment_name":"第3回小テスト","status":"受付中","disable":true,"start_time":"2021-04-23T05:30:00.000Z","deadline":"2021-04-25T15:00:00.000Z","color_code":"#ffe6e9"},{"course_name":"ディジタル信号処理","href":"https://room.chuo-u.ac.jp/ct/course_2368995_report_2606859","assignment_name":"第1回演習問題","status":"受付中","disable":true,"start_time":"2021-04-14T07:50:00.000Z","deadline":"2021-04-28T06:10:00.000Z","color_code":"#cce8cc"},{"course_name":"ディジタル信号処理","href":"https://room.chuo-u.ac.jp/ct/course_2368995_report_2610929","assignment_name":"第2回演習問題","status":"受付中","disable":true,"start_time":"2021-04-21T07:50:00.000Z","deadline":"2021-04-28T06:10:00.000Z","color_code":"#cce8cc"}]');
export let dev = ()=>{
	let rows = [];
	for(let a of DEV){
		let r = new Assignment();
		r.init_json(a);
		rows.push(r);
	}
	set_assignment(rows);
}
*/