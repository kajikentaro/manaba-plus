let progress_tabid;
import * as component from './component.js';
let permit_dl = true;
var callback_popup;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.type == 'startDL-trigger'){
		if(permit_dl){
			callback_popup = sendResponse;
			getFilesStructure(request.progress_tabid);
			//develop();
			permit_dl  = false;
		}else{
			sendResponse({permit:false});
		}
		return true;
	}
});
function develop(){
	var txt = '[{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第1回（9月23日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_3490318525_1342853073/%E7%AC%AC1%E5%9B%9E_%E5%9C%B0%E7%90%86%E7%A9%BA%E9%96%93%E6%83%85%E5%A0%B1%E6%8A%80%E8%A1%93%E3%81%AE%E6%A6%82%E8%A6%81%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第2回（9月30日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_1989580_1989573/%E7%AC%AC2%E5%9B%9E_%E7%A9%BA%E9%96%93%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E5%8F%AF%E8%A6%96%E5%8C%96%E3%81%A8%E9%9B%86%E8%A8%88%E5%8D%98%E4%BD%8D%E3%81%AE%E5%A4%89%E6%8F%9B%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第3回（10月7日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_2685013256_2001284/%E7%AC%AC3%E5%9B%9E_%E7%A9%BA%E9%96%93%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E5%9F%BA%E7%A4%8E%E7%9A%84%E5%88%86%E6%9E%90%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第4回（10月14日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_3490359453_2685050953/%E7%AC%AC4%E5%9B%9E_%E3%83%A9%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%A2%E3%83%87%E3%83%AB%E3%81%A8%E7%A9%BA%E9%96%93%E8%A7%A3%E6%9E%90%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第5回（10月21日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_806020589_2100576/%E7%AC%AC5%E5%9B%9E_%E6%BC%94%E7%BF%92%EF%BC%88%EF%BC%91%EF%BC%89%E5%8F%AF%E8%A6%96%E5%8C%96.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第5回（10月21日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_806020589_269166889/%E9%83%BD%E9%81%93%E5%BA%9C%E7%9C%8C%E5%A2%83%E7%95%8C.zip?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第7回（11月4日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_269181693_3490406540/%E7%AC%AC7%E5%9B%9E_%E4%BA%BA%E5%8F%A3%E5%88%86%E5%B8%83%E3%81%AE%E8%A7%A3%E6%9E%90%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第6回（10月28日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_2152079_2953552902/%E7%AC%AC6%E5%9B%9E_%E6%BC%94%E7%BF%92%EF%BC%88%EF%BC%92%EF%BC%89%E5%9F%BA%E7%A4%8E%E7%9A%84%E5%88%86%E6%9E%90.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第6回（10月28日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_2152079_806051129/%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C%E5%A2%83%E7%95%8C.zip?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第6回（10月28日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_2152079_3490402195/%E6%B4%A5%E6%B3%A2%E6%B5%B8%E6%B0%B4.zip?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第8回（11月11日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_1342960202_2416754881/%E7%AC%AC8%E5%9B%9E_%E4%BA%BA%E5%8F%A3%E6%8E%A8%E8%A8%88%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第10回（11月25日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_806117498_1879835263/%E7%AC%AC10%E5%9B%9E_%E9%80%A3%E7%B6%9A%E5%9E%8B%E6%96%BD%E8%A8%AD%E9%85%8D%E7%BD%AE%E5%95%8F%E9%A1%8C%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第11回（12月2日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_3758893791_537676108/%E7%AC%AC11%E5%9B%9E_%E9%9B%A2%E6%95%A3%E5%9E%8B%E6%96%BD%E8%A8%AD%E9%85%8D%E7%BD%AE%E5%95%8F%E9%A1%8C%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第9回（11月18日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_2148246053_269202952/%E7%AC%AC9%E5%9B%9E_%E7%A9%BA%E9%96%93%E8%A3%9C%E9%96%93%E3%81%A8%E7%A9%BA%E9%96%93%E7%9A%84%E8%87%AA%E5%B7%B1%E7%9B%B8%E9%96%A2%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第12回（12月9日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_2685177186_2953637735/%E7%AC%AC12%E5%9B%9E_%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%A8%E6%9C%80%E7%9F%AD%E7%B5%8C%E8%B7%AF%E5%95%8F%E9%A1%8C%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"地理空間情報技術","content":" オンライン授業 ","page":"第13回（12月16日）","url":"https://room.chuo-u.ac.jp/ct/page_1982999c1342478_1343045722_3222066092/%E7%AC%AC13%E5%9B%9E_%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%E7%A9%BA%E9%96%93%E8%A7%A3%E6%9E%90%EF%BC%88%E9%85%8D%E4%BB%98%E8%B3%87%E6%96%99%EF%BC%89.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第1回 (9/23）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_537523801_3221879522/lect0_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第1回 (9/23）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_537523801_3490321406/lect1_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第1回 (9/23）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_537523801_2685010844/lect1_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第1回 (9/23）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_537523801_2023151/20200923comment.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第2回 (9/30)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2023136_2023128/lect2_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第2回 (9/30)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2023136_2023130/lect2_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第2回 (9/30)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2023136_1611293592/20200930comments.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第3回 (10/7）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_1611292394_3758770436/lect3_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第3回 (10/7）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_1611292394_2148195871/lect3_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第3回 (10/7）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_1611292394_1611308318/20201007memo.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第3回 (10/7）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_1611292394_1879731181/20201007comments.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第4回 (10/14）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_3758787126_806034931/2020_10_14memo.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第4回 (10/14）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_3758787126_1611333790/20201014comments.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第4回 (10/14）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_3758787126_2083638/lect4_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第4回 (10/14）","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_3758787126_3758787125/lect4_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第7回 (11/4)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2685110563_537638235/20201104comments.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第5回 (10/21)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_3221944058_806051390/20201021comments.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第6回 (10/28)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2152615_3221983539/lect5_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第6回 (10/28)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2152615_806051366/lect5_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第6回 (10/28)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2152615_1342950828/2020_10_28.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第6回 (10/28)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2152615_2953567272/20201028comments.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第10回 (11/25)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_1611418502_1611418501/lect8_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第10回 (11/25)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_1611418502_1343030766/lect8_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第10回 (11/25)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_1611418502_2685179703/comments20201125.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第8回 (11/11)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2685123687_1342967927/lect6_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第8回 (11/11)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2685123687_2416762960/lect6_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第8回 (11/11)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2685123687_2953607603/20201111comments.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第9回 (11/18)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2252939_537651659/lect7_slides.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第9回 (11/18)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2252939_1879814725/lect7_note.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第9回 (11/18)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2252939_1879835593/2020_11_18.pdf?view=full"},{"course":"数理情報学２","content":" 授業資料 ","page":"第9回 (11/18)","url":"https://room.chuo-u.ac.jp/ct/page_1993336c1342394_2252939_2148292204/comments201118.pdf?view=full"}]';
	var result = JSON.parse(txt);
	callback_popup({permit:true,dl_urls:result});
}
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
			callback_popup({permit:true,dl_urls:result});
		}
		if (course_size == course_n && content_size == content_n && page_size == page_n && file_size == file_n) {
			//alert('done download');
		}
	}
}