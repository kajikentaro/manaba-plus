let form = document.querySelectorAll(".report-form")[0].parentElement.parentElement;
let input = document.querySelectorAll("input[type=file]");
if(input.length){
    input = input[0];
    insert_drop_message();
    add_listener();
}
function submit(){
 let hidden = document.createElement('input');
 hidden.type = 'hidden';
 hidden.name = 'action_ReportStudent_submitdone';
 hidden.value = 1;
 //manaba.disable_submit_button(form);
 form.appendChild(hidden)
 form.submit();
}
function insert_drop_message(){
    let mess = document.createElement("p");
    mess.innerHTML = "またはここにファイルをドロップ";
    input.parentElement.parentElement.appendChild(mess);
}
function add_listener(){
    form.addEventListener("dragover", ()=>{
        event.preventDefault();
        form.parentElement.style.backgroundColor = "#d7e2fc";
    });
    form.addEventListener("dragleave", ()=>{
        form.parentElement.style.backgroundColor = "";
    });
    form.addEventListener("drop", (event)=>{
        event.preventDefault();
        input.files = event.dataTransfer.files;
        submit();
    });
}