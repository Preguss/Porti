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
    updatePreview();
}

function updatePreview() {
    const preview = document.getElementById("post-preview");
    if (!preview) return;
    
    const title = document.getElementById("post-title").value || "Título do Post";
    const content = document.getElementById("post-content").value || "Digite o conteúdo do seu post aqui para ver o preview...";
    const bgColor = document.getElementById("post-color").value;
    const textColor = document.getElementById("post-text-color").value;
    const textAlign = document.getElementById("post-text-align").value;
    const imageAlign = document.getElementById("post-image-align").value;
    const imageSize = document.getElementById("post-image-size").value || "medium";
    const imagePosition = document.getElementById("post-image-position").value;
    
    preview.style.backgroundColor = bgColor;
    preview.style.color = textColor;
    
    let imageHtml = "";
    if (window.uploadedImageData) {
        let imgMargin = "";
        if (imageAlign === "left") {
            imgMargin = "margin-left: 0; margin-right: auto;";
        } else if (imageAlign === "right") {
            imgMargin = "margin-left: auto; margin-right: 0;";
        } else {
            imgMargin = "margin-left: auto; margin-right: auto;";
        }

        const sizeMap = {
            small: "200px",
            medium: "320px",
            large: "480px"
        };
        const maxWidth = sizeMap[imageSize] || "320px";

        imageHtml = `<img src="${window.uploadedImageData}" alt="Preview" style="max-width: ${maxWidth}; height: auto; margin: 0.5rem; border-radius: 5px; display: block; ${imgMargin}">`;
    }
    
    let previewContent = `<h3 style="text-align: center; margin-bottom: 1rem;">${title}</h3>`;
    
    if (imagePosition === "top") {
        previewContent += imageHtml;
        previewContent += `<p style="text-align: ${textAlign}; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">${content}</p>`;
    } else {
        previewContent += `<p style="text-align: ${textAlign}; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">${content}</p>`;
        previewContent += imageHtml;
    }
    
    preview.innerHTML = previewContent;
}

function setAlignment(align) {
    document.getElementById("post-text-align").value = align;
    updatePreview();
}

function setImagePosition(position) {
    document.getElementById("post-image-position").value = position;
    updatePreview();
}

function setImageAlign(align) {
    document.getElementById("post-image-align").value = align;
    updatePreview();
}

function compressImage(file, callback, maxSizeMB = 0.5) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Reduzir tamanho se imagem muito grande
            if (width > 1920 || height > 1920) {
                const scale = Math.min(1920 / width, 1920 / height);
                width = width * scale;
                height = height * scale;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Comprimir com qualidade reduzida até atingir tamanho desejado
            let quality = 0.85;
            let compressedData = canvas.toDataURL('image/jpeg', quality);
            
            // Se ainda estiver grande, reduzir qualidade
            while (compressedData.length / 1024 / 1024 > maxSizeMB && quality > 0.1) {
                quality -= 0.1;
                compressedData = canvas.toDataURL('image/jpeg', quality);
            }
            
            callback(compressedData);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleImageUpload() {
    const fileInput = document.getElementById("post-image-file");
    const file = fileInput.files[0];
    if (file) {
        // Comprimir para máximo 0.5MB
        compressImage(file, function(compressedData) {
            window.uploadedImageData = compressedData;
            updatePreview();
            savePostDraftToLocalStorage();
        }, 0.5);
    }
}

function savePostDraftToLocalStorage() {
    const draft = {
        title: document.getElementById("post-title").value,
        subject: document.getElementById("post-subject").value,
        content: document.getElementById("post-content").value,
        category: document.getElementById("post-category").value,
        color: document.getElementById("post-color").value,
        textColor: document.getElementById("post-text-color").value,
        textAlign: document.getElementById("post-text-align").value,
        imagePosition: document.getElementById("post-image-position").value,
        imageAlign: document.getElementById("post-image-align").value,
        image: window.uploadedImageData || document.getElementById("post-image-url").value,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('postDraft', JSON.stringify(draft));
}

function restorePostDraftFromLocalStorage() {
    const draft = localStorage.getItem('postDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            document.getElementById("post-title").value = data.title || "";
            document.getElementById("post-subject").value = data.subject || "";
            document.getElementById("post-content").value = data.content || "";
            document.getElementById("post-category").value = data.category || "";
            document.getElementById("post-color").value = data.color || "#ffffff";
            document.getElementById("post-text-color").value = data.textColor || "#000000";
            document.getElementById("post-text-align").value = data.textAlign || "left";
            document.getElementById("post-image-position").value = data.imagePosition || "top";
            document.getElementById("post-image-align").value = data.imageAlign || "center";
            
            if (data.image && data.image.startsWith('data:')) {
                window.uploadedImageData = data.image;
            } else if (data.image) {
                document.getElementById("post-image-url").value = data.image;
            }
            
            updatePreview();
            console.log("Rascunho do post restaurado!");
        } catch (error) {
            console.error("Erro ao restaurar rascunho:", error);
        }
    }
}

function clearPostDraft() {
    localStorage.removeItem('postDraft');
}

// Funções de autenticação facilitada
function isLocalhost() {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || hostname === '::1';
}

function hasRememberedAccess(type) {
    const stored = localStorage.getItem(`remember_${type}`);
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    const now = new Date().getTime();
    
    // Verifica se não expirou (30 dias)
    if (now - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`remember_${type}`);
        return false;
    }
    return true;
}

function rememberAccess(type) {
    const data = {
        timestamp: new Date().getTime()
    };
    localStorage.setItem(`remember_${type}`, JSON.stringify(data));
}

function accessBlog() {
    window.location.href = "blog.html";
}

function checkPassword() {
    // Auto-login em localhost
    if (isLocalhost()) {
        document.getElementById("main-content").style.display = "block";
        loadPosts(false);
        return;
    }
    
    // Verifica se tem acesso lembrado
    if (hasRememberedAccess('blog')) {
        document.getElementById("main-content").style.display = "block";
        loadPosts(false);
        return;
    }
    
    let attempts = 3;
    while (attempts > 0) {
        const password = prompt("Digite a senha para acessar o blog:");
        if (password === null) {
            // Usuário clicou cancelar
            window.location.href = "index.html";
            return;
        }
        if (password === "2") {
            // Pergunta se quer lembrar
            if (confirm("Lembrar acesso neste dispositivo por 30 dias?")) {
                rememberAccess('blog');
            }
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
    document.getElementById("creator-posts").style.display = "none";
    document.getElementById("blog-posts").style.display = "none";
    // Restaurar rascunho salvo
    restorePostDraftFromLocalStorage();
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
            document.getElementById("post-category").value = post.category || "";
            document.getElementById("post-color").value = post.color || "#ffffff";
            document.getElementById("post-text-color").value = post.textColor || "#000000";
            document.getElementById("post-text-align").value = post.textAlign || "left";
            document.getElementById("post-image-position").value = post.imagePosition || "top";
            document.getElementById("post-image-align").value = post.imageAlign || "center";
            document.getElementById("post-image-size").value = post.imageSize || "medium";
            document.getElementById("post-image-file").value = "";
            document.getElementById("post-image-url").value = post.image || "";
            window.uploadedImageData = null;
            document.getElementById("create-form").style.display = "block";
            // Marcar como edição
            document.getElementById("post-form").setAttribute("data-edit-id", postId);
            updatePreview();
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
            
            const textAlign = post.textAlign || "left";
            const imagePosition = post.imagePosition || "top";
            const imageAlign = post.imageAlign || "center";
            const imageSize = post.imageSize || "medium";
            const category = post.category || "Sem categoria";
            
            let imageHtml = "";
            if (post.image) {
                const sizeMap = {
                    small: "200px",
                    medium: "320px",
                    large: "480px"
                };
                const maxWidth = sizeMap[imageSize] || "320px";
                let imgStyle = `max-width: ${maxWidth}; height: auto; margin: 1rem 0; border-radius: 8px; display: block;`;
                if (imageAlign === "left") {
                    imgStyle += " margin-left: 0; margin-right: auto;";
                } else if (imageAlign === "right") {
                    imgStyle += " margin-left: auto; margin-right: 0;";
                } else {
                    imgStyle += " margin-left: auto; margin-right: auto;";
                }
                imageHtml = `<img src="${post.image}" alt="Imagem do post" style="${imgStyle}">`;
            }
            
            detailContent.style.backgroundColor = post.color || "#ffffff";
            detailContent.style.color = post.textColor || "#000000";
            detailContent.style.textAlign = "left";
            
            let contentHtml = `
                <div style="text-align: center; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 1rem; margin-bottom: 1rem;">
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.8rem;">${post.title}</h2>
                    <p style="margin: 0 0 0.8rem 0; font-size: 1.1rem; opacity: 0.9;">${post.subject}</p>
                    <div style="display: flex; justify-content: center; gap: 1.5rem; font-size: 0.9rem; flex-wrap: wrap;">
                        <span>📁 ${category}</span>
                        <span>📅 ${post.date}</span>
                    </div>
                </div>
            `;
            
            if (imagePosition === "top") {
                contentHtml += imageHtml;
                contentHtml += `<div style="text-align: ${textAlign}; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">${post.content}</div>`;
            } else {
                contentHtml += `<div style="text-align: ${textAlign}; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">${post.content}</div>`;
                contentHtml += imageHtml;
            }
            
            detailContent.innerHTML = contentHtml;
            document.getElementById("blog-posts").style.display = "none";
            document.getElementById("post-detail").style.display = "block";
            const heroElement = document.querySelector(".hero");
            if (heroElement) {
                heroElement.style.display = "none";
            }
        }
    } catch (error) {
        console.error("Erro ao abrir post:", error);
    }
}

function closePostDetail() {
    document.getElementById("post-detail").style.display = "none";
    document.getElementById("blog-posts").style.display = "block";
    const heroElement = document.querySelector(".hero");
    if (heroElement) {
        heroElement.style.display = "block";
    }
    currentPostId = null;
}

async function editPost(postId) {
    try {
        const querySnapshot = await window.db.collection('posts').doc(postId).get();
        const post = querySnapshot.data();
        
        if (post) {
            document.getElementById("post-title").value = post.title;
            document.getElementById("post-subject").value = post.subject;
            document.getElementById("post-content").value = post.content;
            document.getElementById("post-category").value = post.category || "";
            document.getElementById("post-color").value = post.color || "#ffffff";
            document.getElementById("post-text-color").value = post.textColor || "#000000";
            document.getElementById("post-text-align").value = post.textAlign || "left";
            document.getElementById("post-image-position").value = post.imagePosition || "top";
            document.getElementById("post-image-align").value = post.imageAlign || "center";
            document.getElementById("post-image-size").value = post.imageSize || "medium";
            
            if (post.image) {
                document.getElementById("post-image-url").value = post.image;
                window.uploadedImageData = post.image;
            }
            
            const form = document.getElementById("post-form");
            form.setAttribute("data-edit-id", postId);
            
            updatePreview();
            document.getElementById("creator-posts").style.display = "none";
            document.getElementById("create-form").style.display = "block";
        }
    } catch (error) {
        console.error("Erro ao editar post:", error);
        alert("Erro ao carregar post para edição.");
    }
}

async function deletePost(postId) {
    if (confirm("Tem certeza que deseja excluir este post?")) {
        try {
            await window.db.collection('posts').doc(postId).delete();
            alert("Post excluído!");
            loadPosts(true);
        } catch (error) {
            console.error("Erro ao excluir post:", error);
            alert("Erro ao excluir post.");
        }
    }
}

function enterCreatorMode() {
    // Auto-login em localhost
    if (isLocalhost()) {
        document.getElementById("creator-mode").style.display = "block";
        document.getElementById("blog-posts").style.display = "none";
        document.getElementById("post-detail").style.display = "none";
        document.getElementById("create-form").style.display = "none";
        document.getElementById("creator-posts").style.display = "block";
        loadPosts(true);
        return;
    }
    
    // Verifica se tem acesso lembrado
    if (hasRememberedAccess('creator')) {
        document.getElementById("creator-mode").style.display = "block";
        document.getElementById("blog-posts").style.display = "none";
        document.getElementById("post-detail").style.display = "none";
        document.getElementById("create-form").style.display = "none";
        document.getElementById("creator-posts").style.display = "block";
        loadPosts(true);
        return;
    }
    
    const password = prompt("Digite a senha do criador:");
    if (password === null) return;
    if (password === "9696") {
        // Pergunta se quer lembrar
        if (confirm("Lembrar acesso ao modo criador neste dispositivo por 30 dias?")) {
            rememberAccess('creator');
        }
        document.getElementById("creator-mode").style.display = "block";
        document.getElementById("blog-posts").style.display = "none";
        document.getElementById("post-detail").style.display = "none";
        document.getElementById("create-form").style.display = "none";
        document.getElementById("creator-posts").style.display = "block";
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

function showCreateForm() {
    document.getElementById("create-form").style.display = "block";
    document.getElementById("creator-posts").style.display = "none";
    document.getElementById("blog-posts").style.display = "none";
}

function viewCreatorPosts() {
    document.getElementById("create-form").style.display = "none";
    document.getElementById("creator-posts").style.display = "block";
    loadPosts(true);
}

function cancelEdit() {
    const form = document.getElementById("post-form");
    const hasContent = document.getElementById("post-title").value || document.getElementById("post-content").value;
    
    if (hasContent && !confirm("Você tem dados no formulário. Deseja descartá-los?")) {
        return;
    }
    
    form.reset();
    form.removeAttribute("data-edit-id");
    document.getElementById("create-form").style.display = "none";
    document.getElementById("post-color").value = "#ffffff";
    document.getElementById("post-text-color").value = "#000000";
    document.getElementById("post-image-file").value = "";
    document.getElementById("post-image-url").value = "";
    window.uploadedImageData = null;
    currentPostId = null;
    clearPostDraft();
    updatePreview();
    document.getElementById("creator-posts").style.display = "block";
}


async function loadPosts(isCreatorMode = false) {
    try {
        const querySnapshot = await window.db.collection('posts').orderBy('timestamp', 'desc').get();
        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const listEl = isCreatorMode ? document.getElementById("creator-posts") : document.getElementById("blog-posts");

        if (!listEl) return;

        // Mostrar lista correta e limpar itens anteriores
        listEl.style.display = "block";
        const dynamicPosts = listEl.querySelectorAll('.blog-post.dynamic');
        dynamicPosts.forEach(post => post.remove());

        posts.forEach(post => {
            const article = document.createElement("article");
            article.className = isCreatorMode ? "blog-post dynamic creator" : "blog-post dynamic";
            article.style.backgroundColor = post.color || "#ffffff";
            article.style.color = post.textColor || "#000000";
            article.style.cursor = isCreatorMode ? "default" : "pointer";
            
            const category = post.category || "Sem categoria";
            
            let buttonsHtml = "";
            if (isCreatorMode) {
                buttonsHtml = `<div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn-read" onclick="event.stopPropagation(); editPost('${post.id}')">Editar</button>
                    <button class="btn-read" onclick="event.stopPropagation(); deletePost('${post.id}')">Excluir</button>
                </div>`;
            } else {
                buttonsHtml = `<div style="margin-top: 1rem;"><button class="btn-read" onclick="event.stopPropagation(); openPostDetail('${post.id}')">Ler Mais</button></div>`;
            }
            
            article.innerHTML = `
                <h3>${post.title}</h3>
                <p><strong>Assunto:</strong> ${post.subject}</p>
                <div style="font-size: 0.85rem; opacity: 0.8; margin: 0.5rem 0;">
                    <span>📁 ${category}</span> | <span>📅 ${post.date}</span>
                </div>
                ${buttonsHtml}
            `;
            listEl.appendChild(article);
        });
    } catch (error) {
        console.error("Erro ao carregar posts:", error);
    }
}

async function savePost(title, content) {
    try {
        // Validar campos obrigatórios
        if (!title || title.trim() === "") {
            alert("Por favor, preencha o título.");
            return;
        }
        if (!content || content.trim() === "") {
            alert("Por favor, preencha o conteúdo.");
            return;
        }
        
        const subject = document.getElementById("post-subject").value;
        const category = document.getElementById("post-category").value;
        
        if (!subject || subject.trim() === "") {
            alert("Por favor, preencha o assunto.");
            return;
        }
        if (!category || category.trim() === "") {
            alert("Por favor, preencha a categoria.");
            return;
        }
        
        const color = document.getElementById("post-color").value;
        const textColor = document.getElementById("post-text-color").value;
        const textAlign = document.getElementById("post-text-align").value;
        const imagePosition = document.getElementById("post-image-position").value;
        const imageAlign = document.getElementById("post-image-align").value;
        const imageSize = document.getElementById("post-image-size").value || "medium";
        
        // Verificar se há arquivo enviado
        let image = document.getElementById("post-image-url").value;
        if (window.uploadedImageData) {
            image = window.uploadedImageData;
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
                category: category,
                color: color,
                image: image,
                textColor: textColor,
                textAlign: textAlign,
                imagePosition: imagePosition,
                imageAlign: imageAlign,
                imageSize: imageSize
            });
            form.removeAttribute("data-edit-id");
            clearPostDraft();
            alert("Post editado!");
        } else {
            // Criar
            await window.db.collection('posts').add({
                title: title,
                subject: subject,
                content: content,
                category: category,
                date: date,
                timestamp: timestamp,
                color: color,
                image: image,
                textColor: textColor,
                textAlign: textAlign,
                imagePosition: imagePosition,
                imageAlign: imageAlign,
                imageSize: imageSize
            });
            clearPostDraft();
            alert("Post publicado!");
        }
        
        document.getElementById("create-form").style.display = "none";
        loadPosts(true);
    } catch (error) {
        console.error("Erro ao salvar post:", error);
        // Salvar rascunho automaticamente em caso de erro
        savePostDraftToLocalStorage();
        alert("Erro ao publicar post: " + error.message + "\n\nSeus dados foram salvos automaticamente. Tente novamente!");
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
                updatePreview();
            }
        });
    }
    
    // Event listener para upload de arquivo
    const fileInput = document.getElementById("post-image-file");
    if (fileInput) {
        fileInput.addEventListener("change", handleImageUpload);
    }
    
    // Event listeners para atualizar preview em tempo real e salvar rascunho
    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");
    const colorInput = document.getElementById("post-color");
    const textColorInput = document.getElementById("post-text-color");
    const subjectInput = document.getElementById("post-subject");
    const categoryInput = document.getElementById("post-category");
    
    if (titleInput) {
        titleInput.addEventListener("input", updatePreview);
        titleInput.addEventListener("input", savePostDraftToLocalStorage);
    }
    if (contentInput) {
        contentInput.addEventListener("input", updatePreview);
        contentInput.addEventListener("input", savePostDraftToLocalStorage);
    }
    if (colorInput) {
        colorInput.addEventListener("input", updatePreview);
        colorInput.addEventListener("input", savePostDraftToLocalStorage);
    }
    if (textColorInput) {
        textColorInput.addEventListener("input", updatePreview);
        textColorInput.addEventListener("input", savePostDraftToLocalStorage);
    }
    if (subjectInput) {
        subjectInput.addEventListener("input", savePostDraftToLocalStorage);
    }
    if (categoryInput) {
        categoryInput.addEventListener("input", savePostDraftToLocalStorage);
    }
    
    // Restaurar rascunho ao abrir a página de blog
    if (document.getElementById("blog-posts")) {
        restorePostDraftFromLocalStorage();
    }
});