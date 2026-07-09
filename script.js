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
    }
}

//ポストを作成
function createpost(username, date, content, id) {
    const post = document.createElement("div");

    let isDeleting = false;
    
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

