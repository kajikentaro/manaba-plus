'use strict'
const DELETABLE_ROW = "deletable-row";
let pre_clicked_label = "deadline";
let sort_is_reverse = false;
let show_disable = false;
let all_assignments;
let hided_assignments;
let start_mp_done = false;
const init = async ()=>{
	insert_mp_button();
}
const start_mp = async ()=>{
	//prevent over two times button click
	if (start_mp_done) {
		return;
	}
	start_mp_done = true;
	//set class that defined originally
	document.getElementsByClassName("current")[0].classList.remove("current");
	document.getElementById("mp-li").classList.add("current");
	//remove default table
	document.getElementsByClassName("stdlist")[0].style.display = "none";
	document.getElementsByClassName("contentbody-footer")[0].style.display = "none";
	//fetch assignment datas
	all_assignments = await fetch_summaries();
	hided_assignments = await fetch_hided();
	//insert frame
	let add_parent = document.getElementsByClassName('contentbody-l')[0];
	const table = document.createElement("table");
	table.id = "mp-table";
	add_parent.appendChild(table);
	//insert toggle
	let mp_li = document.createElement("li");
	mp_li.innerHTML = '<label for="toggle-hide" id="toggle-hide-label" class="toggle-label"><input type=checkbox id="toggle-hide"><p>非表示も表示</p></label>';
	let infolist_tab = document.getElementsByClassName("infolist-tab")[0];
	infolist_tab.appendChild(mp_li);
	document.getElementById("toggle-hide").onchange = (e) => {
		show_disable = e.target.checked;
		review_table(all_assignments, pre_clicked_label, sort_is_reverse);
	}

	set_disables(all_assignments, hided_assignments);//all_assignmentsのdisableを設定する。
	review_table(all_assignments);
}
let fetch_hided = async () => {
	const res = await new Promise((resolve) => {
		chrome.storage.sync.get(["hided_assignment"], function (result) {
			if (!result.hided_assignment) resolve([]);
			resolve(result.hided_assignment);
		});
	});
	return res;
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
				deadline: cols[2].innerText ? new Date(cols[2].innerText) : Infinity,//暫定処置
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
	mp_li.id = "mp-li"
	let infolist_tab = document.getElementsByClassName("infolist-tab")[0];
	infolist_tab.appendChild(mp_li);
	mp_start.onclick = start_mp;
}

const input_click = () => {
	//update disable or enable setting of assignments
	collect_and_preserve();
	review_table(all_assignments, pre_clicked_label, sort_is_reverse);
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
		let sort_bases = ["course_name", "assignment_name", null, "deadline"];
		let texts = ["コース", "題名", "非表示",  "受付終了"];
		for (let i = 0; i < 4; i++) {
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
					review_table(all_assignments, sort_bases[i], sort_is_reverse);
				}
				return closer;
			}();
		}
		let add_parent = document.getElementById('mp-table');
		add_parent.appendChild(tr);
	}
	function insert_rows(rows) {
		let add_parent = document.getElementById('mp-table');
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
		this.deadline = dict.deadline;
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
		if (date == Infinity) return ""
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
			td.innerHTML = '<div class="flex"><input type="checkbox" checked="true"></div>'
		} else {
			td.innerHTML = '<div class="flex"><input type="checkbox"></div>'
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
		tr.insertCell().innerHTML = this.date_to_str(this.deadline)
		tr.style.backgroundColor = this.color_code;
		return tr;
	}
}
init();