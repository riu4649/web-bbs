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
let isPosting = false;

const form = document.getElementById("form");
let username = document.getElementById("usernameadd");
let content = document.getElementById("content");
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
    usernameElement.textContent = "user: " + thread.username;
    dateElement.textContent = formatDate(new Date(thread.date));

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
            console.log(date);
            createpost(post.username, datetext, post.content);
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
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

function createpost(username, date, content) {
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

    post.appendChild(name);
    post.appendChild(dateElement);
    post.appendChild(text);
    posts.appendChild(post);
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

loadThread();
loadPosts();