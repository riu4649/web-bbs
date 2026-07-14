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
    usernameElement.textContent = thread.username;
    dateElement.textContent = formatDate(new Date(thread.date));

    console.log(thread);
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