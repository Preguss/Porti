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

let currentPostId = null;

function setColor(color, type) {
    if (type === 'bg') {
        document.getElementById("post-color").value = color;
    } else if (type === 'text') {
        document.getElementById("post-text-color").value = color;
    }
}

function handleImageUpload() {
    const fileInput = document.getElementById("post-image-file");
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Armazenar a imagem em base64
            window.uploadedImageData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function accessBlog() {
    window.location.href = "blog.html";
}

function checkPassword() {
    let attempts = 3;
    while (attempts > 0) {
        const password = prompt("Digite a senha para acessar o blog:");
        if (password === null) {
            // Usuário clicou cancelar
            window.location.href = "index.html";
            return;
        }
        if (password === "9696") {
            document.getElementById("main-content").style.display = "block";
            loadPosts(false);
            return;
        } else {
            attempts--;
            if (attempts > 0) {
                alert(`Senha incorreta! Tente novamente. (${attempts} tentativa${attempts > 1 ? 's' : ''} restante${attempts > 1 ? 's' : ''})`);
            }
        }
    }
    alert("Tentativas esgotadas!");
    window.location.href = "index.html";
}

function showCreateForm() {
    document.getElementById("create-form").style.display = "block";
    // Limpar form
    document.getElementById("post-form").reset();
    document.getElementById("post-title").value = "";
    document.getElementById("post-subject").value = "";
    document.getElementById("post-content").value = "";
    document.getElementById("post-color").value = "#ffffff";
    document.getElementById("post-text-color").value = "#000000";
    document.getElementById("post-image-file").value = "";
    document.getElementById("post-image-url").value = "";
    window.uploadedImageData = null;
}

function cancelEdit() {
    document.getElementById("create-form").style.display = "none";
}

async function viewCreatorPosts() {
    const creatorPostsDiv = document.getElementById("creator-posts");
    const createFormDiv = document.getElementById("create-form");
    
    if (creatorPostsDiv.style.display === "block") {
        creatorPostsDiv.style.display = "none";
        return;
    }
    
    createFormDiv.style.display = "none";
    creatorPostsDiv.style.display = "block";
    
    try {
        const querySnapshot = await window.db.collection('posts').orderBy('timestamp', 'desc').get();
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        let html = "<h3>Seus Posts</h3>";
        posts.forEach(post => {
            const dateStr = post.date || "Data desconhecida";
            html += `
                <div style="background: rgba(255,255,255,0.15); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; cursor: pointer;" onclick="openPostDetail('${post.id}')">
                    <h4 style="color: var(--destacado); margin-bottom: 0.3rem;">${post.title}</h4>
                    <p style="color: var(--txt-principal); font-size: 0.9rem; margin: 0.3rem 0;"><strong>Assunto:</strong> ${post.subject}</p>
                    <p style="color: var(--txt-principal); font-size: 0.8rem; margin: 0; opacity: 0.7;"><em>${dateStr}</em></p>
                    <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                        <button class="btn-read" onclick="event.stopPropagation(); editPost('${post.id}')">Editar</button>
                        <button class="btn-read" onclick="event.stopPropagation(); deletePost('${post.id}')">Deletar</button>
                    </div>
                </div>
            `;
        });
        
        creatorPostsDiv.innerHTML = html;
    } catch (error) {
        console.error("Erro ao carregar posts:", error);
        creatorPostsDiv.innerHTML = "<p>Erro ao carregar posts.</p>";
    }
}

async function editPost(postId) {
    try {
        const doc = await window.db.collection('posts').doc(postId).get();
        if (doc.exists) {
            const post = doc.data();
            document.getElementById("post-title").value = post.title;
            document.getElementById("post-subject").value = post.subject || "";
            document.getElementById("post-content").value = post.content;
            document.getElementById("post-color").value = post.color || "#ffffff";
            document.getElementById("post-text-color").value = post.textColor || "#000000";
            document.getElementById("post-image-file").value = "";
            document.getElementById("post-image-url").value = post.image || "";
            window.uploadedImageData = null;
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

async function openPostDetail(postId) {
    try {
        const doc = await window.db.collection('posts').doc(postId).get();
        if (doc.exists) {
            currentPostId = postId;
            const post = doc.data();
            const detailContent = document.getElementById("post-content-detail");
            let imageHtml = "";
            if (post.image) {
                imageHtml = `<img src="${post.image}" alt="Imagem do post" style="max-width: 100%; height: auto; margin-bottom: 1rem;">`;
            }
            detailContent.style.backgroundColor = post.color || "#ffffff";
            detailContent.style.color = post.textColor || "#000000";
            detailContent.innerHTML = `
                ${imageHtml}
                <h2>${post.title}</h2>
                <p><strong>Assunto:</strong> ${post.subject}</p>
                <p><em>Data: ${post.date}</em></p>
                <hr>
                <p>${post.content}</p>
            `;
            document.getElementById("blog-posts").style.display = "none";
            document.getElementById("post-detail").style.display = "block";
        }
    } catch (error) {
        console.error("Erro ao abrir post:", error);
    }
}

function closePostDetail() {
    document.getElementById("post-detail").style.display = "none";
    document.getElementById("blog-posts").style.display = "block";
    currentPostId = null;
}

function enterCreatorMode() {
    const password = prompt("Digite a senha do criador:");
    if (password === null) return;
    if (password === "9696") {
        document.getElementById("creator-mode").style.display = "block";
        document.getElementById("blog-posts").style.display = "none";
        document.getElementById("post-detail").style.display = "none";
        loadPosts(true);
    } else {
        alert("Senha incorreta!");
    }
}

function exitCreatorMode() {
    document.getElementById("creator-mode").style.display = "none";
    document.getElementById("blog-posts").style.display = "block";
    document.getElementById("create-form").style.display = "none";
    document.getElementById("creator-posts").style.display = "none";
    loadPosts(false);
}

async function loadPosts(isCreatorMode = false) {
    try {
        const querySnapshot = await window.db.collection('posts').orderBy('timestamp', 'desc').get();
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const blogPostsSection = document.getElementById("blog-posts");
        // Limpar posts dinâmicos anteriores
        const dynamicPosts = blogPostsSection.querySelectorAll('.blog-post.dynamic');
        dynamicPosts.forEach(post => post.remove());
        // Adicionar posts dinâmicos (apenas título, data e assunto na lista)
        posts.forEach(post => {
            const article = document.createElement("article");
            article.className = "blog-post dynamic";
            article.style.backgroundColor = post.color || "#ffffff";
            article.style.color = post.textColor || "#000000";
            article.style.cursor = "pointer";
            
            let buttonsHtml = "";
            if (isCreatorMode) {
                buttonsHtml = `<div style="margin-top: 1rem;">
                    <button onclick="editPost('${post.id}')">Editar</button>
                    <button onclick="deletePost('${post.id}')">Excluir</button>
                </div>`;
            } else {
                buttonsHtml = `<div style="margin-top: 1rem;"><button onclick="openPostDetail('${post.id}')">Ler Mais</button></div>`;
            }
            
            article.innerHTML = `
                <h3>${post.title}</h3>
                <p><strong>Assunto:</strong> ${post.subject}</p>
                <p><em>Data: ${post.date}</em></p>
                ${buttonsHtml}
            `;
            article.style.cursor = isCreatorMode ? "default" : "pointer";
            blogPostsSection.appendChild(article);
        });
    } catch (error) {
        console.error("Erro ao carregar posts:", error);
    }
}

async function savePost(title, content) {
    try {
        const subject = document.getElementById("post-subject").value;
        const color = document.getElementById("post-color").value;
        const textColor = document.getElementById("post-text-color").value;
        
        // Verificar se há arquivo enviado
        let image = document.getElementById("post-image-url").value;
        if (window.uploadedImageData) {
            image = window.uploadedImageData;
            window.uploadedImageData = null; // Limpar após usar
        }
        
        const now = new Date();
        const date = now.toLocaleString("pt-BR");
        const timestamp = now.getTime();
        
        const form = document.getElementById("post-form");
        const editId = form.getAttribute("data-edit-id");
        
        if (editId) {
            // Editar (não atualizar timestamp)
            await window.db.collection('posts').doc(editId).update({
                title: title,
                subject: subject,
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
                subject: subject,
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
                document.getElementById("post-image-file").value = "";
                document.getElementById("post-image-url").value = "";
                window.uploadedImageData = null;
            }
        });
    }
    
    // Event listener para upload de arquivo
    const fileInput = document.getElementById("post-image-file");
    if (fileInput) {
        fileInput.addEventListener("change", handleImageUpload);
    }
});