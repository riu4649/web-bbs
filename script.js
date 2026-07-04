//ローカルデータの読み込み
//const savepost = localStorage.getItem("posts");
//const postlists = JSON.parse(savepost);
/*if (postlists) {
    for (const postData of postlists) {
        createpost(
            postData.username,
            postData.date,
            postData.content
);
    }
}*/

const form = document.getElementById("form");
//let postlist = postlists || [];
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
        createpost(post.username, post.date, post.content, post.id);
        }
    });
}
  

//新しくポストを作成
async function post() {
    let username = document.getElementById("usernameadd");
    let content = document.getElementById("content");
    let now = new Date();
    let datetext = now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();

    /*createpost(
        username.value,
        datetext,
        content.value,
    )*/
    
    const postdate = {
        username: username.value,
        date: datetext,
        content: content.value
    };

    //postlist.push(postdate);
    //localStorage.setItem("posts", JSON.stringify(postlist));
    //console.log(postlist);

    await fetch("/posts", {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(postdate)
    })
    /*createpost(
            username.value,
            datetext,
            content.value
    );*/
    loadPosts();

    content.value = "";
    content.focus();
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

    const deletebutton = document.createElement("button");
    deletebutton.textContent = "削除";

    post.appendChild(name);
    post.appendChild(dateElement);
    post.appendChild(text);
    post.appendChild(deletebutton);
    posts.appendChild(post);

    //削除ボタン
    deletebutton.addEventListener("click", async function() {
        await fetch(`/posts/${id}`, {
            method: "DELETE"  
        });
        loadPosts();
    });
}

