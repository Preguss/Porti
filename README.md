# 👨‍💻 Portfólio - Preguss

Bem-vindo ao meu portfólio pessoal! Um espaço onde compartilho meus projetos, habilidades e experiências no universo da tecnologia, automação e robótica.

## ✨ O Que Você Encontra Aqui

- **Sobre Mim**: Conheça quem é Pedro (Preguss) - um entusiasta de tecnologia, automação industrial e robótica
- **Habilidades**: Front-end, Engenharia Mecânica e modelagem CAD
- **Projetos**: Projetos práticos que desenvolvi, desde carros autônomos até robôs para competições
- **Blog**: Insights e histórias sobre os projetos e aprendizados
- **Experiência**: Meu percurso na equipe Graxaim Bots

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Firebase Firestore
- **Hospedagem**: GitHub Pages
- **Ferramentas CAD**: Inventor, SolidWorks

## 🛠️ Como Usar Este Portfólio

### Ambiente Local
1. Clone este repositório
2. Abra `index.html` no seu navegador
3. Navegue pelos diferentes projetos e seções

### Publicar no GitHub Pages
1. Faça push para a branch `main`
2. Vá em Settings > Pages > Source > Deploy from a branch
3. Selecione `main` como branch
4. Seu site estará disponível em `https://seu-usuario.github.io/Portfolio_final`

## 🔐 Configurando o Firebase (Para o Blog)

Se quiser usar a funcionalidade de blog dinâmico:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto Firebase
3. Ative o **Firestore Database** em modo de teste
4. Em **Project Settings > General > Your apps**, crie um app web
5. Copie as credenciais do Firebase
6. Abra `blog.html` e substitua o objeto `firebaseConfig` pelas suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-auth-domain",
  projectId: "seu-project-id",
  storageBucket: "seu-storage-bucket",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id"
};
```

## 📁 Estrutura do Projeto

```
Portifolio_final/
├── index.html          # Página principal
├── blog.html           # Página do blog
├── style.css           # Estilos globais
├── script.js           # Scripts interativos
├── README.md           # Este arquivo
├── images/             # Imagens e logos
└── fonts/              # Fontes personalizadas
```

## 🎨 Personalização

- **Cores**: Modifique as variáveis CSS em `style.css` (`:root`)
- **Conteúdo**: Edite `index.html` com suas informações
- **Projetos**: Adicione mais `projeto-card` na seção de projetos

## 📞 Entre em Contato

- **GitHub**: [github.com/preguss](https://github.com/preguss)
- **Instagram**: [@_pregus](https://www.instagram.com/_pregus/)

## 📝 Licença

Este projeto é de uso pessoal. Sinta-se livre para usar como inspiração para seu próprio portfólio!

---

**Feito com ❤️ por Pedro Preguss**