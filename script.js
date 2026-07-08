const form = document.getElementById("form");
let isPosting = false;

form.addEventListener("submit", function(event) {
    event.preventDefault();
    post();
});

loadPosts();

function loadPosts() {
    const posts = document.getElementById("posts");
    posts.innerHTML = "";
    fetch("/posts")
    .then(res => res.json())
    .then(postsList => {
        for (const post of postsList) {
            const date = new Date(post.date);
            const datetext = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
            console.log(date);
            createpost(post.username, datetext, post.content, post.id);
        }
    });
}
  

//新しくポストを作成
async function post() {

    if (isPosting) {
        return;
    }

    isPosting = true;

    let username = document.getElementById("usernameadd");
    let content = document.getElementById("content");
    let now = new Date();
    
    const postdate = {
        username: username.value,
        content: content.value
    };

    try {
        const response = await fetch("/posts", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postdate)
        });
        if (response.ok) {
            loadPosts();
            content.value = "";
            content.focus();
        } else {
            const message = await response.text();
            alert(message);
        }
    } catch (error) {
        console.error(error);
        alert("サーバーエラーが発生しました。");
    }
     finally {
        isPosting =false;
    }


}

//ポストを作成
function createpost(username, date, content, id) {
    const post = document.createElement("div");
    let posts = document.getElementById("posts");
    post.classList.add("post")

    const dateElement = document. createElement("p");
    dateElement.textContent = date;

    const name = document.createElement("p")
    name.textContent = username;
    
    const text = document.createElement("p");
    text.textContent = content;

    const editbutton = document.createElement("button");
    editbutton.textContent = "編集";

    const deletebutton = document.createElement("button");
    deletebutton.textContent = "削除";

    post.appendChild(name);
    post.appendChild(dateElement);
    post.appendChild(text);
    post.appendChild(editbutton);
    post.appendChild(deletebutton);
    posts.appendChild(post);

    //削除ボタン
    deletebutton.addEventListener("click", async function() {
        const response = await fetch(`/posts/${id}`, {
            method: "DELETE"  
        });
        if (response.ok) {
            loadPosts();
        } else {
            const message = await response.text();
            alert(message);
        }
    });

    editbutton.addEventListener("click", async () => {
    const newContent = prompt("編集内容", content);

    if (newContent === null) return;

    if (newContent.trim() === "") {
        alert("内容を入力してください")
        return;
    }



    //ここでputを送信し、編集する
    const response = await fetch(`/posts/${id}`, {
        method: "PUT",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newContent })
    });
    if (response.ok) {
        loadPosts();
    } else {
        const message = await response.text();
        alert(message);
    }
    });
    }

