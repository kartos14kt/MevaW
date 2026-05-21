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
            "Musica 1",
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
        html += `<div class="musica" onclick="selecionarMusica(this)">${musica}</div>`;
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

btnPlay.addEventListener("click", () => {
    if (audio.paused) {
    audio.play()
    icone.src = "icons/pausado.png"
    } else {
    audio.pause()
    icone.src = "icons/tocando.png"
    }
})