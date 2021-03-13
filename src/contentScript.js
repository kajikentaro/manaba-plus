'use strict';
function getCourses(){
	let courses = [];
	let courseDOMs = document.getElementsByClassName("course-cell");
	for(let course of courseDOMs){
		let element = course.getElementsByTagName("a")[0];
		let aflinks = ["_query", "_survey", "_report", "_page"]
		let links = []
		for(let aflink of aflinks){
			links.push(element.href + aflink);
		}
		let dict = {'href' : element.href, 'name' : element.innerHTML, 'links' : links};
		courses.push(dict);
	}
	return courses;
}
function getFilesStructure(){
	let course_size=0, content_size=0, page_size=0, file_size=0;
	let course_n=0, content_n=0, page_n=0, file_n=0;
	function progress(type) {
		if (type == 'course') {
			course_n += 1;
		}
		if (type == 'content') {
			content_n += 1;
		}
		if (type == 'page') {
			page_n += 1;
		}
		if (type == 'file') {
			page_n += 1;
		}
		console.log(course_size, content_size, page_size, file_size);
		console.log(course_n, content_n, page_n, file_n);
		chrome.runtime.sendMessage({ type: 'initializing', file_num:file_size});
		if (course_size == course_n && content_size == content_n && page_size == page_n) {
			chrome.runtime.sendMessage(
				{
					type: 'startDL-32',
					download_list: result,
					progress_tabid:progress_tabid
				});
		}
		if (course_size == course_n && content_size == content_n && page_size == page_n && file_size == file_n) {
			//alert('done download');
		}
	}

	let courses = getCourses();
	course_size = courses.length;
	let result = [];
	function received_page(){
		let domparser = new DOMParser();
		let doc = domparser.parseFromString(this.responseText,'text/html');
		let  files = doc.getElementsByClassName("file");
		for(let file of files){
			let url = file.getElementsByTagName("a")[0].href;
			result.push({course: this.course, content: this.content, page: this.page, url: url});
		}
		file_size += files.length;
		progress('page');
	}
	function received_content(){
		let domparser = new DOMParser();
		let doc = domparser.parseFromString(this.responseText,'text/html');
		let pages = doc.getElementsByClassName("contentslist")[0].getElementsByTagName("li");
		for(let page of pages){
			let url = page.getElementsByTagName("a")[0].href;
			let page_name = page.getElementsByTagName("a")[0].innerHTML;
			let request = new XMLHttpRequest();
			request.addEventListener('load', received_page);
			request.course = this.course;
			request.content = this.content;
			request.page = page_name;
			request.open('get',url);
			request.send();
		}
		page_size += pages.length;
		progress('content');
	}
	function received_course(){
		let domparser = new DOMParser();
		let doc = domparser.parseFromString(this.responseText,'text/html');
		let contents = doc.getElementsByClassName("about-contents");
		for(let content of contents){
			let url = content.getElementsByTagName("a")[0].href;
			let content_name = content.getElementsByTagName("a")[0].innerHTML;
			let request = new XMLHttpRequest();
			request.addEventListener('load', received_content);
			request.course = this.course;
			request.content = content_name;
			request.open('get',url);
			request.send();
		}
		content_size += contents.length;
		progress('course');
	}
	for(let course of courses){
		let url  = course['href'] + '_page';
		let request = new XMLHttpRequest();
		request.addEventListener('load', received_course);
		request.course = course['name'];
		request.open('get',url);
		request.send();
	}
}
let progress_tabid;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.type == 'startDL-trigger'){
		console.log('startDL');
		getFilesStructure();
		progress_tabid = request.progress_tabid;
		return true;
	}
});
function getAssignment(){
	let assignment_yet = []
	let course_size = 0;
	let course_n = 0;
	function progress(type) {
		if (type == 'course') {
			course_n += 1;
		}
		if (course_size == course_n ){
			document.getElementById('show-assignment').style.display = 'none';
			setAssignment(assignment_yet);
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
	function start(){
		assignment_yet = [];
		let courses = getCourses();
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
	start();
}
function setAssignment(assignment_yet){
	if(assignment_yet.length == 0){
		document.getElementById('assignment-message').innerHTML = "未提出課題はありませんでした・ω・"

	}
	function start(){
		function insert_label(){
			var label = document.createElement('tr');
			label.innerHTML = '<td>課題名</td><td>状態</td><td>非表示</td><td>受付開始</td><td>受付終了</td>'
			let add_parent = document.getElementById('add-parent');
			let show_assignment_fin = document.getElementById('show-assignment-fin');
			add_parent.insertBefore(label, show_assignment_fin);
		}
		insert_label();
		document.getElementById('toggle_disable').style.display = "inline-block";
		document.getElementById('toggle_disable').onclick = ()=>{
			show_disable = !show_disable;
			show_dev(assignment_yet, show_disable);
			if(show_disable){
				document.getElementById('toggle_disable').innerHTML = "非表示にする"
			}else{
				document.getElementById('toggle_disable').innerHTML = "非表示を表示"
			}
		}
		chrome.storage.sync.get(["hided_assignment"], function(result) {
			set_disable_button(assignment_yet, result.hided_assignment);
			show_dev(assignment_yet, show_disable);
		});
	}
	var show_disable = false;
	function set_disable_button(rows, hide_url){
		for(var row of rows){
			let td = document.createElement('td');
			td.style.textAlign = 'center';
			td.style.verticalAlign = 'bottom';
			td.onclick = (e)=>{
				e.stopPropagation();
				collect_and_preserve();
				show_dev(assignment_yet, show_disable);
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
	function show_dev(rows, show_disable){
		let show_assignment_fin = document.getElementById('show-assignment-fin');
		let add_parent = document.getElementById('add-parent');
		let shuffle_adapter = [];
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
			shuffle_adapter.push({date: target_time, position: i});
		}
		shuffle_adapter.sort((a, b) => {
			if (a.date < b.date) {
				return -1;
			} else {
				return 1;
			}
		});
		for(let i of shuffle_adapter){
			add_parent.insertBefore(rows[i.position], show_assignment_fin);
			rows[i.position].style.display = "table-row";

			var no_disp_if_checked = () =>{
				var input = rows[i.position].getElementsByTagName('input')[0];
				if(input.checked){
					rows[i.position].style.display = "none";
				}
			}
			if(show_disable == false)no_disp_if_checked();
		}
	}
	start();
}
//ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
function develop(){
	console.log("develop mode");
	function createElementFromHTML(html) {
		const tempEl = document.createElement('div');
		tempEl.innerHTML = html;
		return tempEl.firstElementChild;
	}
	var dev_txt = '<table class="stdlist" width="100%"> <tbody><tr class="title"> <th width="50%">タイトル</th> <!--   <th width="10%">閲覧設定</th> --> <th width="20%">状態</th> <th width="15%">受付開始日時</th> <th width="15%">受付終了日時</th> </tr> <!-- レポート一覧　--> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row1 hilitecolor"> <td class="border center" title="第1回授業（導入，風化）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2012958">第1回授業（導入，風化）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-09-24 15:00</td> <td class="border center">2020-10-01 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row"> <td class="border center" title="第2回授業（重力移動）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2043385">第2回授業（重力移動）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-10-01 15:00</td> <td class="border center">2020-10-08 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row1"> <td class="border center" title="第3回授業（河川①）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2072532">第3回授業（河川①）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-10-08 15:00</td> <td class="border center">2020-10-15 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row"> <td class="border center" title="第4回授業（河川②）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2104706">第4回授業（河川②）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-10-15 15:00</td> <td class="border center">2020-10-22 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row1"> <td class="border center" title="第5回授業（地下水）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2137304">第5回授業（地下水）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-10-22 15:00</td> <td class="border center">2020-11-05 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row"> <td class="border center" title="第6回授業（氷河①）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2191715">第6回授業（氷河①）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-11-05 15:00</td> <td class="border center">2020-11-12 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row1"> <td class="border center" title="第7回授業（氷河②）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2214342">第7回授業（氷河②）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-11-12 15:00</td> <td class="border center">2020-11-19 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row"> <td class="border center" title="第8回授業（氷河③）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2282582">第8回授業（氷河③）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-11-19 15:00</td> <td class="border center">2020-11-26 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row1"> <td class="border center" title="第9回授業（砂漠と風）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2322454">第9回授業（砂漠と風）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-11-26 15:00</td> <td class="border center">2020-12-03 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row"> <td class="border center" title="第10回授業（海岸と海）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2352670">第10回授業（海岸と海）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-12-03 15:00</td> <td class="border center">2020-12-10 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row1"> <td class="border center" title="第11回授業（地質年代）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2395308">第11回授業（地質年代）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-12-10 15:00</td> <td class="border center">2020-12-17 13:20</td> </tr> <tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row"> <td class="border center" title="第12回授業（地質年代②）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2420705">第12回授業（地質年代②）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-12-17 15:00</td> <td class="border center">2021-01-07 13:20</td> </tr> </tbody></table>'
	var dev_doc = createElementFromHTML(dev_txt);
	var rows = dev_doc.getElementsByTagName("tr");
	var dev_assignment_yet = []
	for (let row of rows) {
		let text = row.children[1].innerHTML;
		if (text.includes("受付終了")) {
			row.children[1].innerHTML = "受付中";
			//let item = JSON.parse(JSON.stringify(row));
			dev_assignment_yet.push(row.cloneNode(true));
		}
	}
	setAssignment(dev_assignment_yet);
}
//ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
function init(){
	let mark = document.getElementsByClassName("contentbody-left")[0];
	mark.insertAdjacentHTML('afterbegin','<button id="show-assignment">未提出課題を表示</button><button id="toggle_disable" style="display:none">非表示を表示</button><table id="assignment-table"><tbody id="add-parent"><tr id="show-assignment-fin"><td><p id="assignment-message"></p></td></tr></tbody></table>');
	let show_assignment_button = document.getElementById('show-assignment');
	let assignment_table = document.getElementById('assignment-table');
	assignment_table.style.width = '100%';
	assignment_table.style.padding = '2px 15px 5px 0px';
	show_assignment_button.addEventListener('click',()=>{
		show_assignment_button.innerHTML = "読み込み中";
		getAssignment();
		//develop();
	});
}
init();

