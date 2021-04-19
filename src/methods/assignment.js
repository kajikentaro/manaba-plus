"use strict"
import * as component from './component.js';
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
				request.addEventListener('load', received_course);
				request.course = course['name'];
				request.open('get',url);
				request.send();
			}
		}
	}
	function received_course(){
		let domparser = new DOMParser();
		let doc = domparser.parseFromString(this.responseText,'text/html');
		let stdlist = doc.getElementsByClassName("stdlist")[0]
		let rows = [];
		if(stdlist){
			rows = stdlist.getElementsByTagName("tr");
		}
		for (let row of rows) {
			let text = row.children[1].innerHTML;
			if (text.includes("受付中") && text.includes("未提出")) {
				row.children[1].innerHTML = "受付中";
				//let item = JSON.parse(JSON.stringify(row));
				assignment_yet.push(row.cloneNode(true));
			}
		}
		progress('course');
	}
	function progress(type) {
		if (type == 'course') {
			course_n += 1;
		}
		if (course_size == course_n ){
            document.getElementById('show-assignment').style.display = 'none';
            set_assignment(assignment_yet);
		}
	}
}
export var set_assignment = (assignment_yet)=>{
	var show_disable = false;
	let MANAGE_CLS = "MD-assignment";
    start();
	function start(){
		add_class(assignment_yet);
        sort_rows(assignment_yet);
		set_color(assignment_yet);
		disable_hilite(assignment_yet);
		insert_toggle();
		chrome.storage.sync.get(["hided_assignment"], function(result) {
			if(!result.hided_assignment)result.hided_assignment = [];
			set_disable_checked(assignment_yet, result.hided_assignment);
			filter_and_show(assignment_yet, show_disable);
		});
	}
	function add_class(rows){
		for(let row of rows){
			row.classList.add(MANAGE_CLS);
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
		label.innerHTML = '<td>課題名</td><td>状態</td><td>非表示</td><td>受付開始</td><td>受付終了</td>'
		label.classList.add(MANAGE_CLS );
        let add_parent = document.getElementById('add-parent');
        let show_assignment_fin = document.getElementById('show-assignment-fin');
        add_parent.insertBefore(label, show_assignment_fin);
    }
    function insert_toggle(){
		document.getElementById('toggle_disable').style.display = "inline-block";
		document.getElementById('toggle_disable').onclick = ()=>{
			show_disable = !show_disable;
			filter_and_show(assignment_yet, show_disable);
			if(show_disable){
				document.getElementById('toggle_disable').innerHTML = "非表示にする"
			}else{
				document.getElementById('toggle_disable').innerHTML = "非表示を表示"
			}
		}
    }
	function set_disable_checked(rows, hide_url){
		for(var row of rows){
			let td = document.createElement('td');
			td.style.textAlign = 'center';
			td.style.verticalAlign = 'bottom';
			td.onclick = (e)=>{
				e.stopPropagation();
				collect_and_preserve();
				filter_and_show(assignment_yet, show_disable);
			}
			row.insertBefore(td,row.getElementsByTagName('td')[2]);

			var url = row.getElementsByTagName("a")[0].href;
			if(hide_url.includes(url)){
				td.innerHTML = '<input type="checkbox" checked="true">'
			}else{
				td.innerHTML = '<input type="checkbox">'
			}
		}
		return rows;
	}
	function collect_and_preserve(){
		var disable_href = [];
		for(var row of assignment_yet){
			var input = row.getElementsByTagName('input')[0];
			if(input.checked){
				var url = row.getElementsByTagName("a")[0].href;
				disable_href.push(url);
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
				add_parent.insertBefore(row, show_assignment_fin);
			}
		}
	}
	function filter_and_show(rows, show_disable){
		let enable_row = [];
		for(let row of rows){
			//フィルターがオンの場合、inputにチェックが入っていたら追加しない
			if(show_disable == false){
				var input = row.getElementsByTagName('input')[0];
				if(input.checked)continue;
			}
			enable_row.push(row);
		}
		display(enable_row);
    }
    function set_color(rows){
		let now_time = new Date(new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }));
		for(let i = 0;i < rows.length;i++){
			let target_time = new Date(rows[i].children[3].innerText);
			let time_diff = target_time.getTime() - now_time.getTime();
			let day_diff = Math.floor(time_diff / (1000 * 60 * 60 * 24));
			let deadline_css = "fake";
			let deadline_color = "auto";
			if (day_diff < 1) {
				deadline_css = "one-day-before";
				deadline_color = '#ffe6e9';
			} else if (day_diff < 3) {
				deadline_css = "three-days-before";
				deadline_color = '#fff4d1';
			} else if (day_diff < 7) {
				deadline_css = "seven-days-before";
				deadline_color = '#cce8cc';
			}
			rows[i].classList.add(deadline_css);//set for manaba enhanced
			rows[i].children[0].style.backgroundColor = deadline_color;
        }
	}
	function disable_hilite(rows){
		for(var row of rows){
			row.removeAttribute('onmouseover');
			row.addEventListener('mouseover', function (event) {
				event.stopPropagation();
			}, true);
		}
	}
    function sort_rows(rows){
		rows.sort((a, b) => {
			let a_time = new Date(a.children[3].innerText);
			let b_time = new Date(b.children[3].innerText);
			if (a_time < b_time) { return -1; } else { return 1; }
        });
    }
}