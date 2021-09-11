'use strict'
console.log("summary-query loaded");
//module 
class Assignment {
	static async init_storage_ass() {
		if (hided_assignment)return;
		hided_assignment = await new Promise((resolve) => {
			chrome.storage.sync.get(["hided_assignment"], function (result) {
				if (!result.hided_assignment) resolve([]);
				resolve(result.hided_assignment);
			});
		});
	}
	init_json(dict) {
		this.course_name = dict.course_name;
		this.href = dict.href;
		this.assignment_name = dict.assignment_name;
		this.disable = dict.disable;
		this.start_time = new Date(dict.start_time);
		this.deadline = new Date(dict.deadline);
		this.color_code = this.get_color(this.start_time);
	}
	static set_disables(assignments, hide_urls) {
		for (let ass of assignments) {
			if (hide_urls.includes(ass.href)) {
				ass.disable = true;
			} else {
				ass.disable = false;
			}
		}
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
let assignments = [];
let doc_parser = (doc) => {
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
let fetch_summaries = async () => {
	let target_urls = ['https://room.chuo-u.ac.jp/ct/home_summary_query', 'https://room.chuo-u.ac.jp/ct/home_summary_survey', 'https://room.chuo-u.ac.jp/ct/home_summary_report'];
	for (let url of target_urls) {
		let res = await fetch(url);
		let text = await res.text();
		let domparser = new DOMParser();
		let doc = domparser.parseFromString(text, 'text/html');
		doc_parser(doc);
	}
	console.log(assignments);
}

//add mp button
let mp_start = document.createElement("a");
mp_start.innerHTML = "Manaba Plus";
let mp_li = document.createElement("li");
mp_li.appendChild(mp_start);
let infolist_tab = document.getElementsByClassName("infolist-tab")[0];
infolist_tab.appendChild(mp_li);

mp_start.onclick = () => {
	console.log("mp-start clicked");
	fetch_summaries();
}


