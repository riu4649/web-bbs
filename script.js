const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? ""
    : "https://web-bbs-production.up.railway.app";

const form = document.getElementById("form");
let isPosting = false;

/*let username = document.getElementById("usernameadd");
let content = document.getElementById("content");*/

const threadform = document.getElementById("threadform");
const threadTitle = document.getElementById("threadtitle");
const threadUsername = document.getElementById("threadusername");
const threadButton = document.getElementById("threadButton");

const posts = document.getElementById("posts");

const threads = document.getElementById("threads")

/*form.addEventListener("submit", function(event) {
    event.preventDefault();
    post();
});*/

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

//loadPosts();
loadThreads();

//投稿を読み込む
async function loadPosts() {
    try {
        posts.innerHTML = "";
        const response = await request(`${API_BASE_URL}/posts`);
        const postsList = await response.json();
        for (const post of postsList) {
            const date = new Date(post.date);
            const datetext = formatDate(date);
            console.log(date);
            createpost(post.username, datetext, post.content, post.id);
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function loadThreads() {
    try {
        const response = await request(`${API_BASE_URL}/threads`);
        const threadList = await response.json();
        for (const thread of threadList) {
            createThreadElement(
                thread.title,
                thread.username,
                thread.date,
                thread.id,
                thread.updated_at
            );
            console.log(threadList);
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

//投稿ボタンを取得
const postButton = document.getElementById("postButton");
  


//新しくポストを作成
async function post() {

    if (isPosting) {
        return;
    }

    isPosting = true;
    username.disabled = true;
    content.disabled = true;
    postButton.textContent = "投稿中...";
    postButton.disabled = true;
   
    
    const postdate = {
        username: username.value,
        content: content.value
    };

    try {
        await request(`${API_BASE_URL}/posts`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postdate)
        });
        await loadPosts();
        content.value = "";
        content.focus();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
     finally {
        isPosting =false;
        username.disabled = false;
        content.disabled = false;
        postButton.disabled = false;
        postButton.textContent = "投稿";
    }
}


//スレッドを作成
async function createthread() {
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
    }
}

//ポストを作成
function createpost(username, date, content, id) {
    const post = document.createElement("div");
    post.className = "post"

    let isDeleting = false;

    const name = document.createElement("p")
    name.className = "name"
    name.textContent = username;

    const dateElement = document. createElement("p");
    dateElement.className = "date"
    dateElement.textContent = date;
    
    const text = document.createElement("p");
    text.textContent = content;

    const editbutton = document.createElement("button");
    editbutton.className = "edit"
    editbutton.textContent = "編集";

    const deletebutton = document.createElement("button");
    deletebutton.className = "delete"
    deletebutton.textContent = "削除";

    const detailbox = document.createElement("button");
    detailbox.className = "image-button"
    detailbox.type = "button";

    const detailimg = document.createElement("img");
    detailimg.src = "detail.svg"
    detailimg.alt = "詳細を見る"
    detailimg.width = "24px";
    detailimg.height = "24px";

    const postHeader = document.createElement("div");
    postHeader.className = "postHeader"

    const postFooter = document.createElement("div");
    postFooter.className = "postFooter"

    postHeader.appendChild(name);
    postHeader.appendChild(dateElement);
    postFooter.appendChild(editbutton);
    postFooter.appendChild(deletebutton);
    detailbox.appendChild(detailimg);
    post.appendChild(postHeader);
    post.appendChild(text);
    post.appendChild(postFooter);
    post.appendChild(detailbox);
    posts.appendChild(post);

    detailbox.addEventListener("click", () => {
        postFooter.classList.toggle("is-open");
        detailbox.classList.toggle("is-change");
    });

    post.addEventListener("mouseleave", () => {
        postFooter.classList.remove("is-open");
        detailbox.classList.remove("is-change");
    });
    

    //削除ボタン
    deletebutton.addEventListener("click", async function() {

        if (!confirm("本当に削除しますか？")) {
            return;
        }

        if (isDeleting) {
            return;
        }

        isDeleting = true;


        try {
            await request(`${API_BASE_URL}/posts/${id}`, {
                method: "DELETE"  
            });

            await loadPosts();

            } catch (error) {
                console.error(error);
                alert(error.message);
            } finally {
                isDeleting = false;
        }
    });
    
    //編集ボタン
    editbutton.addEventListener("click", async () => {
    const newContent = prompt("編集内容", content);

    if (newContent === null) return;

    if (newContent.trim() === "") {
        alert("内容を入力してください")
        return;
    }



    //ここでputを送信し、編集する
    try {
        await request(`${API_BASE_URL}/posts/${id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: newContent })
        });
    
        await loadPosts();
        
    } catch (error) {
        console.error(error);
        alert(error.message);
    }   
    });
}

function createThreadElement(title, username, date, id, updated_at) {
    const thread = document.createElement("div");
    thread.className = "thread"

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

    const threadheader = document.createElement("div");
    threadheader.className = "threadheader";

    threadheader.appendChild(titleElement);
    threadheader.appendChild(dateElement);
    threadheader.appendChild(update);
    thread.appendChild(threadheader);
    thread.appendChild(usernameElement);
    threads.appendChild(thread);

    thread.addEventListener("click", () => {
        window.location.href = `thread.html?id=${id}`
    })
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
/*let maxlength = 25;
username.addEventListener("input", () => {
    username.value = username.value.slice(0, maxlength);
});*/