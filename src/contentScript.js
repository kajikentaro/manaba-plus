'use strict';
import * as assignment from './methods/assignment.js';
init();
function init(){
	let mark = document.getElementsByClassName("contentbody-left")[0];
	mark.insertAdjacentHTML('afterbegin','<button id="show-assignment">未提出課題を表示</button><button id="toggle_disable" style="display:none">非表示を表示</button><table id="assignment-table"><tbody id="add-parent"><tr id="show-assignment-fin"><td><p id="assignment-message"></p></td></tr></tbody></table>');
	let show_assignment_button = document.getElementById('show-assignment');
	let assignment_table = document.getElementById('assignment-table');
	assignment_table.style.width = '100%';
	assignment_table.style.padding = '2px 15px 5px 0px';
	show_assignment_button.addEventListener('click',()=>{
		show_assignment_button.innerHTML = "読み込み中";
		assignment.get_assignment();
	});
}