const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? ""
    : "https://web-bbs-production.up.railway.app";


const threadform = document.getElementById("threadform");
const threadTitle = document.getElementById("threadtitle");
const threadUsername = document.getElementById("threadusername");

let isPosting = false;

const threads = document.getElementById("threads");

threadform.addEventListener("submit", function(event) {
    event.preventDefault();
    createthread();
});


async function request(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
    }

    return response;
}

loadThreads();

async function loadThreads() {
    try {
        threads.innerHTML = "";
        const response = await request(`${API_BASE_URL}/threads`);
        const threadList = await response.json();
        console.log(threadList);
        for (const thread of threadList) {
            createThreadElement(
                thread.title,
                thread.username,
                thread.date,
                thread.id,
                thread.updated_at
            );
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


//スレッドを作成
async function createthread() {
    if (isPosting) {
        return;
    }

    isPosting = true;
    threadUsername.disabled = true;
    threadTitle.disabled = true;
    threadButton.textContent = "投稿中...";
    threadButton.disabled = true;


    const threadData = {
        title: threadTitle.value,
        username: threadUsername.value
    };
    try {
        await request(`${API_BASE_URL}/threads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(threadData)
        });
        await loadThreads();
        threadTitle.value = "";
        threadUsername.value = "";
        threadTitle.focus();
    } catch(error) {
        console.error(error);
        alert(error.message);
    } finally {
        isPosting =false;
        threadUsername.disabled = false;
        threadTitle.disabled = false;
        threadButton.disabled = false;
        threadButton.textContent = "投稿";
    }
}


function createThreadElement(title, username, date, id, updated_at) {
    const thread = document.createElement("div");
    thread.className = "thread"

    let isDeleting = false;

    const titleElement = document.createElement("h3");
    titleElement.className = "threadtitle"
    titleElement.textContent = title;

    const dateElement = document.createElement("p");
    dateElement.className = "threaddate"
    dateElement.textContent = "作成日: " + formatDate(new Date(date));

    const usernameElement = document.createElement("p");
    usernameElement.className = "threaduser"
    usernameElement.textContent = "作成者: " + username;

    const update = document.createElement("p");
    update.className = "update"
    update.textContent = "更新日: " + formatDate(new Date(updated_at));

    const deletebutton = document.createElement("button")
    deletebutton.className = "delete"
    deletebutton.textContent = "削除";

    const editbutton = document.createElement("button");
    editbutton.className = "edit"
    editbutton.textContent = "編集";

    const detailbox = document.createElement("button");
    detailbox.className = "image-button"
    detailbox.type = "button";

    const detailimg = document.createElement("img");
    detailimg.src = "detail.svg"
    detailimg.alt = "詳細を見る"
    detailimg.width = "24px";
    detailimg.height = "24px";


    const threadheader = document.createElement("div");
    threadheader.className = "threadheader";

    const threadfooter = document.createElement("div")
    threadfooter.className = "threadfooter";

    threadheader.appendChild(titleElement);
    threadheader.appendChild(dateElement);
    threadheader.appendChild(update);
    threadfooter.appendChild(editbutton);
    threadfooter.appendChild(deletebutton);
    detailbox.appendChild(detailimg);
    thread.appendChild(threadheader);
    thread.appendChild(usernameElement);
    thread.appendChild(threadfooter);
    thread.appendChild(detailbox);
    threads.appendChild(thread);

    thread.addEventListener("click", (event) => {
        event.stopPropagation();
        if (threadfooter.classList.contains("is-open")) {
            if (!confirm("このスレッドを開きますか？")) {
                return;
            }
        }
        window.location.href = `thread.html?id=${id}`
    });

    detailbox.addEventListener("click", (event) => {
        event.stopPropagation();
        threadfooter.classList.toggle("is-open");
        detailbox.classList.toggle("is-change");
    });

    document.addEventListener("click", () => {
        threadfooter.classList.remove("is-open");
        detailbox.classList.remove("is-change");
    });

    //削除ボタン
    deletebutton.addEventListener("click", async function(event) {
        event.stopPropagation();

        if (!confirm("本当に削除しますか？")) {
            return;
        }

        if (isDeleting) {
            return;
        }

        isDeleting = true;


        try {
            await request(`${API_BASE_URL}/threads/${id}`, {
                method: "DELETE"  
            });

            await loadThreads();

            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                isDeleting = false;
        }
    });


    //編集ボタン
    editbutton.addEventListener("click", async (event) => {
        event.stopPropagation();
        const newTitle = prompt("新しいタイトル", title);

        if (newTitle === null) return;

        if (newTitle.trim() === "") {
            alert("内容を入力してください")
            return;
        }

        //ここでputを送信し、編集する
        try {
            await request(`${API_BASE_URL}/threads/${id}`, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: newTitle })
            });
        
            await loadThreads();
            
        } catch (error) {
            console.error(error);
            alert(error.message);
        }   
        });
}



//日付の関数
function formatDate(date) {
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, "0")
     const day = String(date.getDate()).padStart(2, "0")
     const hours = String(date.getHours()).padStart(2, "0")
     const minutes = String(date.getMinutes()).padStart(2, "0")
     return `${year}/${month}/${day} ${hours}:${minutes}`;
}

//文字数制限
let maxlength = 25;
/*threadUsername.addEventListener("input", () => {
    threadUsername.value = threadUsername.value.slice(0, maxlength);
});*/

const elems = document.querySelectorAll(".input");
elems.forEach((elem) => {
    elem.addEventListener("input", () => {
        elem.value = elem.value.slice(0, maxlength);
    });
});