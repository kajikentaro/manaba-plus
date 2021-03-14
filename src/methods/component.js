"use strict"
export var getCourses = ()=>{
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