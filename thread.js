const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? ""
        : "https://web-bbs-production.up.railway.app";

const params = new URLSearchParams(window.location.search);
const threadId = params.get("id");

const titleElement = document.getElementById("threadTitle");
const usernameElement = document.getElementById("threadUsername");
const dateElement = document.getElementById("threadDate");
const update = document.getElementById("updatedate")
let isPosting = false;
let isDeleting = false;
let lastPostId = 0;

const form = document.getElementById("form");
let username = document.getElementById("usernameadd");
//let content = document.getElementById("content");
const posts = document.getElementById("posts");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    post();
});

async function request(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
    }

    return response;
};

async function loadThread() {
    const response = await request(`${API_BASE_URL}/thread/${threadId}`);
    const thread = await response.json();

    titleElement.textContent = thread.title;
    usernameElement.textContent = "作成者: " + thread.username;
    dateElement.textContent = "作成日: " + formatDate(new Date(thread.date));
    update.textContent = "更新日: " + formatDate(new Date(thread.updated_at));

    console.log(thread);
}

async function loadPosts() {
    try {
        posts.innerHTML = "";
        const response = await request(`${API_BASE_URL}/thread/${threadId}/posts`);
        const postsList = await response.json();
        for (const post of postsList) {
            const date = new Date(post.date);
            const datetext = formatDate(date);
            createpost(post.username, datetext, post.content, post.id);
            lastPostId = post.id;
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function loadNewPosts() {
    try {
        const response = await request(
            `${API_BASE_URL}/thread/${threadId}/posts?lastId=${lastPostId}`
        );

        const postList = await response.json();

        for (const post of postList) {
            const date = new Date(post.date);
            const datetext = formatDate(date);
            createpost(post.username, datetext, post.content, post.id);
            lastPostId = post.id;
        }

    } catch (error) {
        console.error(error);
    }
}

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
        thread_id: threadId,
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
        await loadNewPosts();
        content.value = "";
        content.focus();
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        isPosting =false;
        username.disabled = false;
        content.disabled = false;
        postButton.disabled = false;
        postButton.textContent = "投稿";
    }
}



function createpost(username, date, content, id) {
    const post = document.createElement("div");
    post.className = "post"

    const name = document.createElement("p");
    name.className = "name"
    name.textContent = username;

    const dateElement = document.createElement("p");
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

    post.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    detailbox.addEventListener("click", (event) => {
        event.stopPropagation();
        postFooter.classList.toggle("is-open");
        detailbox.classList.toggle("is-change");
    });

    document.addEventListener("click", () => {
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
username.addEventListener("input", () => {
    username.value = username.value.slice(0, maxlength);
});


async function initialize() {
    await loadThread();
    await loadPosts();

    setInterval(loadNewPosts, 5000);
}

initialize();
