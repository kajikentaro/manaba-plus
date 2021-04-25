"use strict"
import * as component from './component.js';
let MANAGE_CLS = "MD-assignment";
let DEV = JSON.parse('[{"course_name":"社会情報学２","href":"https://room.chuo-u.ac.jp/ct/course_2369010_report_2631393","assignment_name":"第3回講義レポート","status":"受付中","disable":true,"start_time":"2021-04-23T08:00:00.000Z","deadline":"2021-04-29T14:55:00.000Z","color_code":"#cce8cc"},{"course_name":"実践プログラミング","href":"https://room.chuo-u.ac.jp/ct/course_2369115_report_2653818","assignment_name":"[03A]","status":"受付中","disable":true,"start_time":"2021-04-22T04:00:00.000Z","deadline":"2021-04-27T03:00:00.000Z","color_code":"#fff4d1"},{"course_name":"計算幾何学","href":"https://room.chuo-u.ac.jp/ct/course_2368875_query_2649329","assignment_name":"第3回小テスト","status":"受付中","disable":true,"start_time":"2021-04-23T05:30:00.000Z","deadline":"2021-04-25T15:00:00.000Z","color_code":"#ffe6e9"},{"course_name":"ディジタル信号処理","href":"https://room.chuo-u.ac.jp/ct/course_2368995_report_2606859","assignment_name":"第1回演習問題","status":"受付中","disable":true,"start_time":"2021-04-14T07:50:00.000Z","deadline":"2021-04-28T06:10:00.000Z","color_code":"#cce8cc"},{"course_name":"ディジタル信号処理","href":"https://room.chuo-u.ac.jp/ct/course_2368995_report_2610929","assignment_name":"第2回演習問題","status":"受付中","disable":true,"start_time":"2021-04-21T07:50:00.000Z","deadline":"2021-04-28T06:10:00.000Z","color_code":"#cce8cc"}]');
class Assignment{
	constructor(row, course_name){
		this.course_name = course_name;
		this.href = row.children[0].getElementsByTagName("a")[0].href;
		this.assignment_name = row.children[0].getElementsByTagName("a")[0].innerHTML;
		this.status = "受付中";
		this.disable = true;
		this.start_time = new Date(row.children[2].innerHTML);
		this.deadline = new Date(row.children[3].innerHTML);
		this.color_code = this.get_color(this.deadline);
	}
	static set_disables(assignments, hide_urls){
		for(let ass of assignments){
			if(hide_urls.includes(ass.href)){
				ass.disable = true;
			}else{
				ass.disable = false;
			}
		}
	}
	set_input_click_event(input_click_event){
		this.input_click_event = input_click_event;
	}
    get_color(deadline){
		let now_time = new Date(new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }));
		let time_diff = deadline.getTime() - now_time.getTime();
		let day_diff = Math.floor(time_diff / (1000 * 60 * 60 * 24));
		if (day_diff < 1) {
			return '#ffe6e9';
		} else if (day_diff < 3) {
			return '#fff4d1';
		} else if (day_diff < 7) {
			return '#cce8cc';
		}else{
			return "auto";
		}
	}
	date_to_str(date){
		let dates_jp = [ "日", "月", "火", "水", "木", "金", "土" ] ;
		let txt = "";
		txt += date.getMonth() + "/";
		txt += date.getDate() + "(";
		txt += dates_jp[date.getDay()] + ") ";
		txt += date.getHours() + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
		return txt;
	}
	setup_input(td){
		td.style.textAlign = 'center';
		td.style.verticalAlign = 'bottom';
		td.onclick = (e)=>{
			e.stopPropagation();
			if(td.checked){
				this.disable = true;
			}else{
				this.disable = false;
			}
			this.input_click_event();
		}
		if(this.disable == true){
			td.innerHTML = '<input type="checkbox" checked="true">'
		}else{
			td.innerHTML = '<input type="checkbox">'
		}
	}
	get_td(){
		let tr = document.createElement("tr");
		tr.classList.add(MANAGE_CLS);
		tr.insertCell().innerHTML = this.course_name;
		tr.insertCell().innerHTML = "<a href='" + this.href + "'>" + this.assignment_name + "</a>";
		this.setup_input(tr.insertCell());
		tr.insertCell().innerHTML = this.date_to_str(this.start_time)
		tr.insertCell().innerHTML = this.date_to_str(this.deadline)
		tr.style.backgroundColor = this.color_code;
		return tr;
	}
}
export var get_assignment = ()=>{
	let assignment_yet = []
	let course_size = 0;
	let course_n = 0;
    start();
	function start(){
		assignment_yet = [];
		let courses = component.getCourses();
		let suffixs = ['_query','_survey','_report'];
		course_size = courses.length * suffixs.length;
		for(let course of courses){
			for(let suffix of suffixs){
				let url  = course['href'] + suffix;
				let request = new XMLHttpRequest();
				request.addEventListener('load', ()=>{
					received_course(request.responseText, course.name);
				});
				request.course = course['name'];
				request.open('get',url);
				request.send();
			}
		}
	}
		let dev = [];
	function received_course(responseText, course_name){
		let domparser = new DOMParser();
		let doc = domparser.parseFromString(responseText,'text/html');
		let stdlist = doc.getElementsByClassName("stdlist")[0]
		let rows = [];
		if(stdlist){
			rows = stdlist.getElementsByTagName("tr");
		}
		for (let row of rows) {
			let text = row.children[1].innerHTML;
			if (text.includes("受付中") && text.includes("未提出")) {
				dev.push(JSON.parse(JSON.stringify({row,course_name})));
				assignment_yet.push(new Assignment(row, course_name));
			}
		}
		progress('course');
	}
	function progress(type) {
		if (type == 'course') {
			course_n += 1;
		}
		if (course_size == course_n ){
			console.log(JSON.stringify(dev));
            document.getElementById('show-assignment').style.display = 'none';
            set_assignment(assignment_yet);
		}
	}
}
var set_assignment = (assignment_yet)=>{
	console.log(JSON.stringify(assignment_yet));
	var show_disable = false;
	var hided_assignment;
    start();
	async function start(){
		insert_toggle();
		set_input_click_event(assignment_yet);
		hided_assignment = await new Promise((resolve) => {
			chrome.storage.sync.get(["hided_assignment"], function(result) {
				if(!result.hided_assignment)resolve([]);
				resolve(result.hided_assignment);
			});
		});
		Assignment.set_disables(assignment_yet, hided_assignment);
		filter_and_show(assignment_yet);
	}
	function set_input_click_event(rows){
		for(let row of rows){
			row.set_input_click_event(()=>{
				collect_and_preserve();
				filter_and_show(assignment_yet);
			});
		}
	}
	function clear_assignment(){
		let remove_rows = document.getElementsByClassName(MANAGE_CLS);
		while(remove_rows.length){
			remove_rows[0].remove();
		}
	}
    function insert_label(){
        var label = document.createElement('tr');
		label.innerHTML = '<td>コース</td><td>課題名</td><td>非表示</td><td>受付開始</td><td>受付終了</td>'
		label.classList.add(MANAGE_CLS );
        let add_parent = document.getElementById('add-parent');
        let show_assignment_fin = document.getElementById('show-assignment-fin');
        add_parent.insertBefore(label, show_assignment_fin);
    }
    function insert_toggle(){
		document.getElementById('toggle_disable').style.display = "inline-block";
		document.getElementById('toggle_disable').onclick = ()=>{
			show_disable = !show_disable;
			filter_and_show(assignment_yet);
			if(show_disable){
				document.getElementById('toggle_disable').innerHTML = "非表示にする"
			}else{
				document.getElementById('toggle_disable').innerHTML = "非表示を表示"
			}
		}
    }
	function collect_and_preserve(){
		var disable_href = [];
		for(var row of assignment_yet){
			if(row.disable == true){
				disable_href.push(row.href);
			}
		}
		chrome.storage.sync.set({hided_assignment: disable_href}, function() {
		});
	}
	function display(rows){
		clear_assignment();
		if(rows.length == 0){
			document.getElementById('assignment-message').innerHTML = "課題はありませんでした・ω・";
		}else{
			insert_label();
			document.getElementById('assignment-message').innerHTML = "";
			let show_assignment_fin = document.getElementById('show-assignment-fin');
			let add_parent = document.getElementById('add-parent');
			for(let row of rows){
				add_parent.insertBefore(row.get_td(), show_assignment_fin);
			}
		}
	}
	function filter_and_show(rows){
		let enable_row = [];
		for(let row of rows){
			if(show_disable == false){//フィルターがオンの場合
				if(row.disable == true)continue;//非表示なら表示しない
				enable_row.push(row)
			}
			enable_row.push(row);
		}
		//ソート
		enable_row.sort((a, b) => {
			if (a.deadline < b.deadline) { return -1; } else { return 1; }
        });
		display(enable_row);
    }
}