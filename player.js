const audio = document.getElementById("audio")
const btnPlay = document.getElementById("play")
const tituloEl = document.getElementById("titulo")
const artistaEl = document.getElementById("artista")
const progresso = document.querySelector(".progresso")
const icone = document.getElementById("iconePlay")
const capa = document.querySelector(".capa")
const listM = document.querySelector(".listM")
const volume = document.querySelector(".volume")
const iconVolume = document.querySelector(".icon-volume")

let musicas = {}       // { "Artista": [ {titulo, src, capa, artista} ] }
let trocado = false
let arrastando = false
let estavaTocando = false
let fila = []
let indiceFila = 0

const volumes = {
    0: "icons/volume_mudo.png",
    1: "icons/volume_baixo.png",
    2: "icons/volume_alto.png",
    3: "icons/audio_maximo.png",
    4: "icons/audio_maximo_inclinado.png"
}

document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault()
})

// ─── CARREGA LISTA E LÊ METADADOS ─────────────────────────
fetch("lista.json")
    .then(r => r.json())
    .then(arquivos => {
        const promessas = arquivos.map(arquivo => lerMetadados(arquivo))
        Promise.all(promessas).then(() => carregarArtistas())
    })

function lerMetadados(arquivo) {
    return new Promise((resolve) => {
        fetch(`audios/${arquivo}`)
            .then(r => r.arrayBuffer())
            .then(buffer => {
                jsmediatags.read(new Blob([buffer]), {
                    onSuccess(tag) {
                        const t = tag.tags
                        const artista = t.artist || "Desconhecido"
                        const titulo = t.title || arquivo.replace(".mp3", "")

                        let capaUrl = "Capas_music/RapPreto.avif"
                        if (t.picture) {
                            const { data, format } = t.picture
                            const blob = new Blob([new Uint8Array(data)], { type: format })
                            capaUrl = URL.createObjectURL(blob)
                        }

                        const musica = { titulo, artista, src: `audios/${arquivo}`, capa: capaUrl }
                        if (!musicas[artista]) musicas[artista] = []
                        musicas[artista].push(musica)
                        resolve()
                    },
                    onError(err) {
                        console.warn(`Erro ao ler metadados de ${arquivo}:`, err)
                        const titulo = arquivo.replace(".mp3", "")
                        if (!musicas["Desconhecido"]) musicas["Desconhecido"] = []
                        musicas["Desconhecido"].push({ titulo, artista: "Desconhecido", src: `audios/${arquivo}`, capa: "capas/default.avif" })
                        resolve()
                    }
                })
            })
    })
}

// ─── ARTISTAS ──────────────────────────────────────────────
function carregarArtistas() {
    const container = document.querySelector(".artistas")
    const h1 = container.querySelector("h1")
    container.innerHTML = ""
    container.appendChild(h1)

    Object.keys(musicas).forEach((chave, index) => {
        const div = document.createElement("div")
        div.className = "nomes"
        div.dataset.artista = chave
        div.textContent = chave
        div.onclick = () => selecionarArtista(div)
        container.appendChild(div)

        // seleciona o primeiro artista automaticamente
        if (index === 0) selecionarArtista(div)
    })
}

function selecionarArtista(elemento) {
    document.querySelectorAll(".nomes").forEach(a => a.classList.remove("ativo"))
    elemento.classList.add("ativo")

    const chave = elemento.dataset.artista
    fila = musicas[chave]
    indiceFila = 0

    listM.innerHTML = ""
    fila.forEach(musica => {
        const div = document.createElement("div")
        div.className = "musica"
        div.textContent = musica.titulo
        listM.appendChild(div)
    })
}

// ─── SELECIONAR MÚSICA ─────────────────────────────────────
listM.addEventListener("click", (e) => {
    if (!e.target.classList.contains("musica")) return

    indiceFila = fila.findIndex(m => m.titulo === e.target.textContent)
    tocarMusica(fila[indiceFila])
})

function tocarMusica(musica) {
    tituloEl.textContent = musica.titulo
    artistaEl.textContent = musica.artista
    audio.src = musica.src
    capa.src = musica.capa
    icone.src = "icons/pausado.png"

    const nomeArquivo = musica.src.split("/").pop().replace(".mp3", "")
    carregarLetra(`letras/${nomeArquivo}.txt`)

    document.querySelectorAll(".musica").forEach(m => {
        m.classList.toggle("ativo", m.textContent === musica.titulo)
    })

    setTimeout(() => audio.play(), 500)
}

function carregarLetra(caminho) {
    fetch(caminho)
        .then(r => {
            if (!r.ok) throw new Error("Letra não encontrada")
            return r.text()
        })
        .then(texto => {
            document.getElementById("letra").textContent = texto
        })
        .catch(() => {
            document.getElementById("letra").textContent = "Letra não disponível."
        })
}

// ─── PLAY / PAUSE ──────────────────────────────────────────
btnPlay.addEventListener("click", () => {
    if (audio.paused) {
        audio.play()
        icone.src = "icons/pausado.png"
    } else {
        audio.pause()
        icone.src = "icons/tocando.png"
    }
})

document.getElementById("anterior").addEventListener("click", () => {
    if (fila.length === 0) return
    indiceFila = (indiceFila - 1 + fila.length) % fila.length
    tocarMusica(fila[indiceFila])
})

document.getElementById("proximo").addEventListener("click", () => {
    if (fila.length === 0) return
    indiceFila = (indiceFila + 1) % fila.length
    tocarMusica(fila[indiceFila])
})

// ─── PROGRESSO ─────────────────────────────────────────────
progresso.addEventListener("mousedown", () => {
    estavaTocando = !audio.paused
    arrastando = true
    audio.pause()
})
progresso.addEventListener("mouseup", () => {
    if (estavaTocando) audio.play()
    arrastando = false
})
audio.addEventListener("timeupdate", () => {
    if (arrastando) return
    progresso.value = (audio.currentTime / audio.duration) * 100
})
progresso.addEventListener("input", () => {
    audio.currentTime = (progresso.value / 100) * audio.duration
})

// ─── TEMPO ─────────────────────────────────────────────────
const tempo_atual = document.getElementById("tempo-atual")
const duracao = document.getElementById("duracao")

audio.addEventListener("timeupdate", () => {
    const m = Math.floor(audio.currentTime / 60)
    const s = Math.floor(audio.currentTime % 60).toString().padStart(2, "0")
    tempo_atual.textContent = `${m}:${s}`
})
audio.addEventListener("loadedmetadata", () => {
    const m = Math.floor(audio.duration / 60)
    const s = Math.floor(audio.duration % 60).toString().padStart(2, "0")
    duracao.textContent = `${m}:${s}`
})

// ─── VOLUME ────────────────────────────────────────────────
volume.addEventListener("input", () => {
    audio.volume = volume.value / 100
    if (audio.volume === 0) iconVolume.src = volumes[0]
    else if (audio.volume <= 0.5) iconVolume.src = volumes[1]
    else if (audio.volume <= 0.75) iconVolume.src = volumes[2]
})
setInterval(() => {
    if (audio.volume > 0.75) {
        iconVolume.src = volumes[trocado ? 3 : 4]
        trocado = !trocado
    }
}, 1000)