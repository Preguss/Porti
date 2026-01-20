// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA1yAj0aoJgkS1lgSYebe50LcHOmrJOU-U",
    authDomain: "portifolio-blog-2ef8e.firebaseapp.com",
    projectId: "portifolio-blog-2ef8e",
    storageBucket: "portifolio-blog-2ef8e.firebasestorage.app",
    messagingSenderId: "741644636296",
    appId: "1:741644636296:web:b206e3ae819b1bc2dacf3d",
    measurementId: "G-NN8LRS6NCL"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

function accessBlog() {
    window.location.href = "blog.html";
}

function checkPassword() {
    const password = prompt("Digite a senha para acessar o blog:");
    if (password === "9696") {
        document.getElementById("main-content").style.display = "block";
        loadPosts(false);
    } else {
        alert("Senha incorreta!");
        window.location.href = "index.html";
    }
}

function showCreateForm() {
    document.getElementById("create-form").style.display = "block";
    // Limpar form
    document.getElementById("post-form").reset();
    document.getElementById("post-color").value = "#ffffff";
    document.getElementById("post-text-color").value = "#000000";
    document.getElementById("post-image").value = "";
}

function cancelEdit() {
    document.getElementById("create-form").style.display = "none";
}

async function editPost(postId) {
    try {
        const doc = await window.db.collection('posts').doc(postId).get();
        if (doc.exists) {
            const post = doc.data();
            document.getElementById("post-title").value = post.title;
            document.getElementById("post-content").value = post.content;
            document.getElementById("post-color").value = post.color || "#ffffff";
            document.getElementById("post-text-color").value = post.textColor || "#000000";
            document.getElementById("post-image").value = post.image || "";
            document.getElementById("create-form").style.display = "block";
            // Marcar como edição
            document.getElementById("post-form").setAttribute("data-edit-id", postId);
        }
    } catch (error) {
        console.error("Erro ao editar post:", error);
    }
}

async function deletePost(postId) {
    if (confirm("Tem certeza que deseja excluir este post?")) {
        try {
            await window.db.collection('posts').doc(postId).delete();
            loadPosts(true);
            alert("Post excluído!");
        } catch (error) {
            console.error("Erro ao excluir post:", error);
            alert("Erro ao excluir post.");
        }
    }
}

function enterCreatorMode() {
    const password = prompt("Digite a senha do criador:");
    if (password === "9696") {
        document.getElementById("creator-mode").style.display = "block";
        // Não ocultar blog-posts
        loadPosts(true); // true para modo criador
    } else {
        alert("Senha incorreta!");
    }
}

async function loadPosts(isCreatorMode = false) {
    try {
        const querySnapshot = await window.db.collection('posts').orderBy('timestamp', 'desc').get();
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const blogPostsSection = document.getElementById("blog-posts");
        // Limpar posts dinâmicos anteriores
        const dynamicPosts = blogPostsSection.querySelectorAll('.blog-post.dynamic');
        dynamicPosts.forEach(post => post.remove());
        // Adicionar posts dinâmicos
        posts.forEach(post => {
            const article = document.createElement("article");
            article.className = "blog-post dynamic";
            article.style.backgroundColor = post.color || "#ffffff";
            article.style.color = post.textColor || "#000000";
            let imageHtml = "";
            if (post.image) {
                imageHtml = `<img src="${post.image}" alt="Imagem do post" style="max-width: 100%; height: auto; margin-bottom: 1rem;">`;
            }
            let buttonsHtml = "";
            if (isCreatorMode) {
                buttonsHtml = `
                    <button onclick="editPost('${post.id}')">Editar</button>
                    <button onclick="deletePost('${post.id}')">Excluir</button>
                `;
            }
            article.innerHTML = `
                ${imageHtml}
                <h3>${post.title}</h3>
                <p>Data e Hora: ${post.date}</p>
                <p>${post.content}</p>
                ${buttonsHtml}
            `;
            blogPostsSection.appendChild(article);
        });
    } catch (error) {
        console.error("Erro ao carregar posts:", error);
    }
}

async function savePost(title, content) {
    try {
        const color = document.getElementById("post-color").value;
        const image = document.getElementById("post-image").value;
        const textColor = document.getElementById("post-text-color").value;
        const now = new Date();
        const date = now.toLocaleString("pt-BR");
        const timestamp = now.getTime();
        
        const form = document.getElementById("post-form");
        const editId = form.getAttribute("data-edit-id");
        
        if (editId) {
            // Editar (não atualizar timestamp)
            await window.db.collection('posts').doc(editId).update({
                title: title,
                content: content,
                color: color,
                image: image,
                textColor: textColor
            });
            form.removeAttribute("data-edit-id");
            alert("Post editado!");
        } else {
            // Criar
            await window.db.collection('posts').add({
                title: title,
                content: content,
                date: date,
                timestamp: timestamp,
                color: color,
                image: image,
                textColor: textColor
            });
            alert("Post publicado!");
        }
        
        document.getElementById("create-form").style.display = "none";
        loadPosts(true);
    } catch (error) {
        console.error("Erro ao salvar post:", error);
        alert("Erro ao publicar post.");
    }
}

// Event listener para o form
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("post-form");
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            const title = document.getElementById("post-title").value;
            const content = document.getElementById("post-content").value;
            await savePost(title, content);
            if (!form.getAttribute("data-edit-id")) {
                form.reset();
                // Resetar cores para padrão
                document.getElementById("post-color").value = "#ffffff";
                document.getElementById("post-text-color").value = "#000000";
                document.getElementById("post-image").value = "";
            }
        });
    }
});