const form = document.getElementById("form");
let isPosting = false;

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
}

loadPosts();

//投稿を読み込む
async function loadPosts() {
    const posts = document.getElementById("posts");
    posts.innerHTML = "";
    const response = await fetch("web-bbs-production.up.railway.app");
    const postsList = await response.json();
        for (const post of postsList) {
            const date = new Date(post.date);
            const datetext = formatDate(date);
            console.log(date);
            createpost(post.username, datetext, post.content, post.id);
        }
    }

//投稿ボタンを取得
const postButton = document.getElementById("postButton");
  

//新しくポストを作成
async function post() {

    if (isPosting) {
        return;
    }
    
    let username = document.getElementById("usernameadd");
    let content = document.getElementById("content");
    let now = new Date();

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
        await request("/posts", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postdate)
        });
        loadPosts();
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

//ポストを作成
function createpost(username, date, content, id) {
    const post = document.createElement("div");
    post.classList.add("post")

    let isDeleting = false;
    
    let posts = document.getElementById("posts");

    const name = document.createElement("p")
    name.classList.add("name")
    name.textContent = username;

    const dateElement = document. createElement("p");
    dateElement.classList.add("date")
    dateElement.textContent = date;
    
    const text = document.createElement("p");
    text.textContent = content;

    const editbutton = document.createElement("button");
    editbutton.textContent = "編集";

    const deletebutton = document.createElement("button");
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
    postHeader.classList.add("postHeader")

    const postFooter = document.createElement("div");
    postFooter.classList.add("postFooter")

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
            await request(`/posts/${id}`, {
                method: "DELETE"  
            });

            loadPosts();

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
        await request(`/posts/${id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: newContent })
        });
    
        loadPosts();
        
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