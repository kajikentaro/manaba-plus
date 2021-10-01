let go_home_btn = document.createElement("button");
go_home_btn.innerHTML = "ログイン画面へ";
go_home_btn.classList.add("button");
go_home_btn.onclick = () => {
	window.location.href = "https://room.chuo-u.ac.jp/ct/home";
}

let center_div = document.createElement("div");
center_div.style.textAlign = "center";
center_div.appendChild(go_home_btn);

let content = document.getElementById("content");
content.appendChild(center_div);
