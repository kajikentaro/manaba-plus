let progress_tabid;
import * as component from './component.js';
let permit_dl = true;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.type == 'startDL-trigger'){
		getFilesStructure(request.progress_tabid);
		sendResponse(permit_dl);
		permit_dl  = false;
		return true;
	}
});
function getFilesStructure(progress_tabid){
	let course_size=0, content_size=0, page_size=0, file_size=0;
	let course_n=0, content_n=0, page_n=0, file_n=0;
	let result = [];
	let courses = component.getCourses();
	course_size = courses.length;
	for(let course of courses){
		let url  = course['href'] + '_page';
		let request = new XMLHttpRequest();
		request.addEventListener('load', received_course);
		request.course = course['name'];
		request.open('get',url);
		request.send();
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
}