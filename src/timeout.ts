console.log("hello")
let go_home_btn = document.createElement("a");
go_home_btn.id = "go-home-btn";
go_home_btn.innerHTML = "ログイン画面へ";
go_home_btn.href = "https://room.chuo-u.ac.jp/ct/home"

let center_div = document.createElement("div");
center_div.style.textAlign = "center";
center_div.appendChild(go_home_btn);

let content = document.getElementById("content");
content.appendChild(center_div);
