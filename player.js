const audio = document.getElementById("audio")
const btnPlay = document.getElementById("play")
const titulo = document.getElementById("titulo")
const artista = document.getElementById("artista")
const progresso = document.querySelector(".progresso")
const icone = document.getElementById("iconePlay")
const capa = document.querySelector(".capa")
const listM = document.querySelector(".listM")
const volume = document.querySelector(".volume")
const iconVolume = document.querySelector(".icon-volume")
let animando = false
let trocado = false
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
const volumes = {
    0: "icons/volume_mudo.png",
    1: "icons/volume_baixo.png",
    2: "icons/volume_alto.png",
    3: "icons/audio_maximo.png",
    4: "icons/audio_maximo_inclinado.png"
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

volume.addEventListener("input", () => {

    audio.volume = volume.value / 100

    if (audio.volume === 0) {

        iconVolume.src = volumes[0]

    } else if (audio.volume <= 0.5) {

        iconVolume.src = volumes[1]

    } else if (audio.volume > 0.5 && audio.volume <= 0.75) {

        iconVolume.src = volumes[2]

    }

})

setInterval(() => {

    if (audio.volume > 0.75) {

        if (trocado) {

            iconVolume.src = volumes[3]

        } else {

            iconVolume.src = volumes[4]

        }

        trocado = !trocado
    }

}, 1000)