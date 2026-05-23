function selecionarArtista(elemento){

    // remove ativo dos artistas
    const artistas = document.querySelectorAll(".nomes");
    artistas.forEach(a => a.classList.remove("ativo"));

    // adiciona ativo no clicado
    elemento.classList.add("ativo");

    // identifica qual artista foi clicado
    const artista = elemento.dataset.artista;

    // banco de músicas
    const musicas = {
        fabio: [
            "Só uma noite",
            "Musica 2",
            "Musica 3"
        ],
        joao: [
            "Som A",
            "Som B",
            "Som C"
        ]
    };

    const sobre = document.querySelector(".listM");

    let html = "";

    // cria as divs das músicas
    musicas[artista].forEach(musica => {
        html += `<div class="musica">${musica}</div>`;
    });

    sobre.innerHTML = html;
}


// selecionar música
function selecionarMusica(elemento){

    const musicas = document.querySelectorAll(".musica");
    musicas.forEach(m => m.classList.remove("ativo"));

    elemento.classList.add("ativo");
}






const audio = document.getElementById("audio")
const btnPlay = document.getElementById("play")
const titulo = document.getElementById("titulo")
const artista = document.getElementById("artista")
const progresso = document.querySelector(".progresso")
const icone = document.getElementById("iconePlay")
const listM = document.querySelector(".listM")

// Mapeamento de músicas para seus arquivos
const musicasArquivos = {
    "Só uma noite": "audios/SoUmaNoite.mp3",
    "Musica 2": "audios/musica2.mp3",
    "Musica 3": "audios/musica3.mp3",
    "Som A": "audios/somA.mp3",
    "Som B": "audios/somB.mp3",
    "Som C": "audios/somC.mp3"
}


btnPlay.addEventListener("click", () => {
    if (audio.paused) {
        audio.play()
        icone.src = "icons/pausado.png"
    } else {
        audio.pause()
        icone.src = "icons/tocando.png"
    }
})


listM.addEventListener("click", (e) => {
    if (e.target.classList.contains("musica")) {
        // Remove ativo de todas
        const todas = document.querySelectorAll(".musica");
        todas.forEach(m => m.classList.remove("ativo"));
        
        // Adiciona ativo na clicada
        e.target.classList.add("ativo");
        
        // Pega o nome da música e o arquivo correspondente
        const nomMusica = e.target.textContent
        const caminhoAudio = musicasArquivos[nomMusica]
        
        // Toca a música
        titulo.textContent = nomMusica
        artista.textContent = "Fabio"
        audio.src = caminhoAudio
        audio.play()
        icone.src = "icons/pausado.png"
    }
})