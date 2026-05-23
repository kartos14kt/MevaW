const audio = document.getElementById("audio")
const btnPlay = document.getElementById("play")
const titulo = document.getElementById("titulo")
const artista = document.getElementById("artista")
const progresso = document.querySelector(".progresso")
const icone = document.getElementById("iconePlay")
const capa = document.querySelector(".capa")
const listM = document.querySelector(".listM")




// Previne arrastar imagens nativas do navegador
document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

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



// Mapeamento de músicas para seus arquivos
const musicas = [
    {
        titulo: "Só uma noite",
        src: "audios/SoUmaNoite.mp3",
        capa: "icons/umanoite.avif",
        artista: "Fabio Brazza"
    },

    {
        titulo: "Musica 2",
        src: "audios/oRapePreto.mp3",
        capa: "capas/capa2.png",
        artista: "Artista Y"
    }
]


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
        const musica = musicas.find(m => m.titulo === nomMusica)
        const caminhoAudio = musica.src

        // Toca a música
        titulo.textContent = nomMusica
        artista.textContent = musica.artista
        audio.src = caminhoAudio
        capa.src = musica.capa
        capa.alt = `${nomMusica} capa`
        icone.src = "icons/pausado.png"

        // Toca a música após 1 segundo
        setTimeout(() => {
            audio.play()
        }, 500)
    }
})

let arrastando = false
progresso.addEventListener("mousedown", () => {
    arrastando = true
    audio.pause()
})
progresso.addEventListener("mouseup", () => {
    audio.play()
    arrastando = false
})

audio.addEventListener("timeupdate", () => {
    if(arrastando) return

    audio.currentTime
    audio.duration
    const porcentagem = (audio.currentTime / audio.duration) * 100
    progresso.value = porcentagem


})
progresso.addEventListener("input", () => {

    const tempo =
    (progresso.value / 100) * audio.duration

    audio.currentTime = tempo

})