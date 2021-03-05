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
let tmp =[
	{
		"course": "xxx",
		"content": " xxxxx ",
		"page": "xxxx",
		"url": "https://room.chuo-u.ac.jp/ct/page_2043377c1340651_1342875133_1342875132/%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99_03_%E9%87%8D%E5%8A%9B%E7%A7%BB%E5%8B%95.pdf?view=full"
	},
	{
		"course": "yyy",
		"content": " yyyy ",
		"page": "yyyyyyy",
		"url": "https://room.chuo-u.ac.jp/ct/page_2043377c1340651_1342875135_1342875134/%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88%E8%AA%B2%E9%A1%8C_02_%E9%87%8D%E5%8A%9B%E7%A7%BB%E5%8B%95.pdf?view=full"
	}];


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
	let course_size = 0;
	let course_n = 0;
	function progress(type) {
		if (type == 'course') {
			course_n += 1;
		}
		if (course_size == course_n ){
			let show_assignment_fin = document.getElementById('show-assignment-fin');
			let add_parent = document.getElementById('add-parent');
			let shuffle_adapter = [];
			let now_time = new Date(new Date().toLocaleString({ timeZone: 'Asia/Tokyo' }));
			for(let i = 0;i < assignment_yet.length;i++){
				let target_time = new Date(assignment_yet[i].children[3].innerText);
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
				assignment_yet[i].classList.add(deadline_css);//set for manaba enhanced
				assignment_yet[i].children[0].style.backgroundColor = deadline_color;
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
				add_parent.insertBefore(assignment_yet[i.position], show_assignment_fin);
			}
			show_assignment_button.style.display = "none";
			console.log(assignment_yet);
		}
	}
	let assignment_yet = []
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
function develop(){
	filter_assignment(dev_doc);
}
var dev_txt = '<tr onmouseover="hilite(this)" onclick="OpenChildAnchor(this)" class="row1"> <td class="border center" title="第1回授業（導入，風化）レポート"> <h3 class="report-title"><img src="/icon-assignment.png" class="inline" title=""> <!--提出済みか未提出か--> <a href="course_1340651_report_2012958">第1回授業（導入，風化）レポート</a> </h3> </td> <!-- <td class="border center"> </td> --> <!--        <td style="text-align:center;">0</td> <td> <div class="period">不明</div> <div class="period"> ファイル送信     </div> </td> --> <td class="border center"> <div>受付終了</div> <strong>提出済み</strong> (1ファイル) </td> <td class="border center">2020-09-24 15:00</td> <td class="border center">2020-10-01 13:20</td> </tr>'
let dev_domparser = new DOMParser();
let dev_doc = domparser.parseFromString(dev_txt,'text/html');

var hided_assignment;
function pre_func(){
	chrome.storage.sync.get(['hided_assignment'], function(result) {
		hided_assignment = result;
		console.log('Value currently is ' + result);
	});
}
function filter_assignment(row){
	var url = row.getElementsByClassName("a")[0].href;
	hided_assignment.forEach(e => {
		if(e == url)return true;
	});
	return false;

	chrome.storage.sync.set({key: "kkk"}, function() {
		console.log('Value is set to ' + value);
	});
}
let mark = document.getElementsByClassName("contentbody-left")[0];
mark.insertAdjacentHTML('afterbegin','<button id="show-assignment">未提出課題を表示</button><table id="assignment-table"><tbody id="add-parent"><tr id="show-assignment-fin"></tr></tbody></table>');
let show_assignment_button = document.getElementById('show-assignment');
let assignment_table = document.getElementById('assignment-table');
assignment_table.style.width = '100%';
assignment_table.style.padding = '2px 15px 5px 0px';
show_assignment_button.addEventListener('click',()=>{
	show_assignment_button.innerHTML = "読み込み中";
	//getAssignment();
	develop();
});

