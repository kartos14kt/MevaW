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
const btnCurtir = document.getElementById("btnCurtir")
const iconeCurtir = document.getElementById("iconeCurtir")
const btnLoop = document.getElementById("btnLoop")
const iconeLoop = document.getElementById("iconeLoop")

let musicas = {}       // { "Artista": [ {titulo, src, capa, artista} ] }
let trocado = false
let arrastando = false
let estavaTocando = false
let fila = []
let indiceFila = 0
let modoLoop = 0       // 0 = off | 1 = repetir playlist | 2 = repetir uma
let curtido = false

function trocarAba(aba) {
    document.querySelectorAll(".aba-btn").forEach(b => b.classList.remove("ativo"))
    document.getElementById(`aba-${aba}`).classList.add("ativo")

    document.querySelectorAll(".painel-aba").forEach(p => p.style.display = "none")
    document.getElementById(`painel-${aba}`).style.display = "block"

    if (aba === "playlists") renderAbaPlaylists()
}

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
                        const artista = (t.artist || "Desconhecido").trim()
                        const titulo = (t.title || arquivo.replace(".mp3", "")).trim()
                        const album = (t.album || "Álbum desconhecido").trim()

                        let capaUrl = "Capas_music/RapPreto.avif"
                        if (t.picture) {
                            const { data, format } = t.picture
                            const blob = new Blob([new Uint8Array(data)], { type: format })
                            capaUrl = URL.createObjectURL(blob)
                        }

                        const musica = { titulo, artista, album, src: `audios/${arquivo}`, capa: capaUrl }
                        if (!musicas[artista]) musicas[artista] = []
                        musicas[artista].push(musica)
                        resolve()
                    },
                    onError(err) {
                        console.warn(`Erro ao ler metadados de ${arquivo}:`, err)
                        const titulo = arquivo.replace(".mp3", "")
                        if (!musicas["Desconhecido"]) musicas["Desconhecido"] = []
                        musicas["Desconhecido"].push({ titulo, artista: "Desconhecido", album: "Álbum desconhecido", src: `audios/${arquivo}`, capa: "capa.avif" })
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

function formatarDuracao(segundos) {
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = Math.floor(segundos % 60).toString().padStart(2, "0")
    return `${minutos}:${segundosRestantes}`
}

function selecionarArtista(elemento) {
    trocarAba("musicas")
    
    document.querySelectorAll(".nomes").forEach(a => a.classList.remove("ativo"))
    elemento.classList.add("ativo")

    const chave = elemento.dataset.artista
    fila = musicas[chave]
    indiceFila = 0

    listM.innerHTML = ""
    fila.forEach((musica, index) => {
        const div = document.createElement("div")
        div.className = "musica"
        div.dataset.titulo = musica.titulo

        const numero = document.createElement("div")
        numero.className = "coluna-musica numero-musica"
        numero.textContent = String(index + 1).padStart(2, "0")

        const titulo = document.createElement("div")
        titulo.className = "coluna-musica titulo-musica"

        const tituloTexto = document.createElement("span")
        tituloTexto.textContent = musica.titulo
        titulo.appendChild(tituloTexto)

        const album = document.createElement("div")
        album.className = "coluna-musica album-musica"
        album.textContent = musica.album

        const tempo = document.createElement("div")
        tempo.className = "coluna-musica tempo-musica"
        tempo.textContent = "0:00"

        const acaoLetra = document.createElement("div")
        acaoLetra.className = "coluna-musica acao-letra"

        const btnLetra = document.createElement("span")
        btnLetra.className = "btn-letra"
        btnLetra.textContent = "Letra"
        btnLetra.onclick = (e) => {
            e.stopPropagation()
            const nomeArquivo = musica.src.split("/").pop().replace(".mp3", "")
            carregarLetra(nomeArquivo)
            trocarAba("letras")
        }
        acaoLetra.appendChild(btnLetra)

        const audioTemporario = new Audio(musica.src)
        audioTemporario.preload = "metadata"
        audioTemporario.addEventListener("loadedmetadata", () => {
            tempo.textContent = formatarDuracao(audioTemporario.duration)
        }, { once: true })

        div.append(numero, titulo, album, tempo, acaoLetra)
        listM.appendChild(div)
    })
}

// ─── SELECIONAR MÚSICA ─────────────────────────────────────
listM.addEventListener("click", (e) => {
    const musicaDiv = e.target.closest(".musica")
    if (!musicaDiv) return
    if (e.target.closest(".btn-letra")) return

    const titulo = musicaDiv.dataset.titulo
    indiceFila = fila.findIndex(m => m.titulo === titulo)
    tocarMusica(fila[indiceFila])
})

function tocarMusica(musica) {
    const musicaAtualizada = Object.values(musicas).flat().find(m => m.src === musica.src)
    if (musicaAtualizada) musica = musicaAtualizada

    tituloEl.textContent = musica.titulo
    artistaEl.textContent = musica.artista
    audio.src = musica.src
    capa.src = musica.capa

    const nomeArquivo = musica.src.split("/").pop().replace(".mp3", "")
    carregarLetra(nomeArquivo)

    document.querySelectorAll(".musica").forEach(m => {
        const titulo = m.dataset.titulo
        m.classList.toggle("ativo", titulo === musica.titulo)
    })

    setTimeout(() => audio.play(), 500)
}

const API_KEY = "AIzaSyC37cLfumTTSwed1lJJQKXZ3ifugxaPzj0"
const PASTA_LETRAS = "16dJYO5S_KVdnh-QEnwZKwb1XdBZLIyP3"

function carregarLetra(nomeArquivo) {
    const query = encodeURIComponent(`'${PASTA_LETRAS}' in parents and name='${nomeArquivo}.txt' and trashed=false`)
    const letra = document.getElementById("letra")
    
    fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,mimeType)&key=${API_KEY}`)
        .then(r => r.json())
        .then(dados => {
            if (!dados.files || dados.files.length === 0) {
                throw new Error("Letra não encontrada")
            }
            const arquivo = dados.files[0]
            const url = arquivo.mimeType === "application/vnd.google-apps.document"
                ? `https://www.googleapis.com/drive/v3/files/${arquivo.id}/export?mimeType=text/plain&key=${API_KEY}`
                : `https://www.googleapis.com/drive/v3/files/${arquivo.id}?alt=media&key=${API_KEY}`
            return fetch(url)
        })
        .then(r => {
            if (!r.ok) throw new Error("Falha ao carregar a letra")
            return r.text()
        })
        .then(texto => {
            letra.textContent = texto
        })
        .catch(() => {
            letra.textContent = "Letra não disponível."
        })
}

function abrirLetra(src) {
    const nomeArquivo = src.split("/").pop().replace(".mp3", "")
    carregarLetra(nomeArquivo)
    trocarAba("letras")
}

// ─── PLAY / PAUSE ──────────────────────────────────────────
audio.addEventListener("play", () => {
    icone.src = "icons/pausado.png"
    btnPlay.classList.add("ativo")
})

audio.addEventListener("pause", () => {
    icone.src = "icons/tocando.png"
    btnPlay.classList.remove("ativo")
})

btnPlay.addEventListener("click", () => {
    if (audio.paused) {
        audio.play()
    } else {
        audio.pause()
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
    if (!arrastando) {
        progresso.value = (audio.currentTime / audio.duration) * 100
    }
    const m = Math.floor(audio.currentTime / 60)
    const s = Math.floor(audio.currentTime % 60).toString().padStart(2, "0")
    tempo_atual.textContent = `${m}:${s}`
})
progresso.addEventListener("input", () => {
    audio.currentTime = (progresso.value / 100) * audio.duration
})

// ─── TEMPO ─────────────────────────────────────────────────
const tempo_atual = document.getElementById("tempo-atual")
const duracao = document.getElementById("duracao")

audio.addEventListener("loadedmetadata", () => {
    duracao.textContent = formatarDuracao(audio.duration)
})

// ─── FIM DA MÚSICA ─────────────────────────────────────────
audio.addEventListener("ended", () => {
    if (modoLoop === 2) {
        // repetir a música atual
        audio.currentTime = 0
        audio.play()
    } else if (modoLoop === 1) {
        // repetir playlist
        indiceFila = (indiceFila + 1) % fila.length
        tocarMusica(fila[indiceFila])
    } else {
        // sem loop, avança se não for a última
        if (indiceFila < fila.length - 1) {
            indiceFila++
            tocarMusica(fila[indiceFila])
        } else {
            icone.src = "icons/tocando.png"
            btnPlay.classList.remove("ativo")
        }
    }
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

// ─── CURTIR ────────────────────────────────────────────────
btnCurtir.addEventListener("click", () => {
    curtido = !curtido
    iconeCurtir.src = curtido ? "icons/comCurtir.png" : "icons/semCurtir.png"
})

// ─── LOOP ──────────────────────────────────────────────────
btnLoop.addEventListener("click", () => {
    modoLoop = (modoLoop + 1) % 3
    if (modoLoop === 0) iconeLoop.src = "icons/repetirOFF.png"
    if (modoLoop === 1) iconeLoop.src = "icons/repetirON.png"
    if (modoLoop === 2) iconeLoop.src = "icons/repetirONE.png"
})

// ─── PESQUISA ─────────────────────────────────────────────
function buscar(termo) {
    const dropdown = document.getElementById("dropdownResultados")
    
    if (!termo.trim()) {
        dropdown.style.display = "none"
        return
    }

    const t = normalizar(termo)
    let html = ""

    const artistasEncontrados = Object.keys(musicas).filter(a => normalizar(a).includes(t))
    const musicasEncontradas = []
    Object.entries(musicas).forEach(([artista, lista]) => {
        lista.filter(m => normalizar(m.titulo).includes(t)).forEach(m => {
            musicasEncontradas.push({ ...m, artistaChave: artista })
        })
    })

    if (artistasEncontrados.length > 0) {
        html += `<p class="resultado-secao">Artistas</p>`
        artistasEncontrados.forEach(a => {
            html += `<div class="resultado-item" onclick="irParaArtista('${a}')">${a}</div>`
        })
    }

    if (musicasEncontradas.length > 0) {
        html += `<p class="resultado-secao">Músicas</p>`
        musicasEncontradas.forEach(m => {
            html += `<div class="resultado-item" onclick="tocarDaBusca('${m.titulo}', '${m.artistaChave}')">${m.titulo} <span style="color:#aaa; font-size:12px;">— ${m.artista}</span></div>`
        })
    }

    if (!html) html = `<p style="color:#666; padding:8px;">Nenhum resultado.</p>`

    dropdown.innerHTML = html
    dropdown.style.display = "block"
}

function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function irParaArtista(chave) {
    const el = document.querySelector(`.nomes[data-artista="${chave}"]`)
    if (el) selecionarArtista(el)
    document.getElementById("dropdownResultados").style.display = "none"
    document.getElementById("campoBusca").value = ""
}

function tocarDaBusca(titulo, artistaChave) {
    const el = document.querySelector(`.nomes[data-artista="${artistaChave}"]`)
    if (el) selecionarArtista(el)

    fila = musicas[artistaChave]
    indiceFila = fila.findIndex(m => m.titulo === titulo)
    if (indiceFila === -1) return
    tocarMusica(fila[indiceFila])
    document.getElementById("dropdownResultados").style.display = "none"
    document.getElementById("campoBusca").value = ""
}


let apelidoAtual = ""

function verificarLogin() {
    const apelido = localStorage.getItem("mevaw_apelido")
    if (apelido) {
        apelidoAtual = apelido
        document.getElementById("modalLogin").style.display = "none"
    }
}

function entrar() {
    const input = document.getElementById("inputApelido").value.trim()
    if (!input) return

    apelidoAtual = input
    localStorage.setItem("mevaw_apelido", input)
    document.getElementById("modalLogin").style.display = "none"
}

// chama quando o site carrega
verificarLogin()
document.getElementById("inputApelido").addEventListener("keydown", (e) => {
    if (e.key === "Enter") entrar()
})

// abre o modal ao clicar no btnPlaylist
document.getElementById("btnPlaylist").addEventListener("click", () => {
    if (!fila[indiceFila]) return
    const musica = fila[indiceFila]
    document.getElementById("modalTituloMusica").textContent = musica.titulo

    const capaMini = document.querySelector(".modal-capa-mini")
    capaMini.innerHTML = ""
    const img = document.createElement("img")
    img.src = musica.capa
    img.style.cssText = "width:100%; height:100%; object-fit:cover; border-radius:8px;"
    img.onerror = () => capaMini.innerHTML = '<i class="ti ti-music"></i>'
    capaMini.appendChild(img)

    atualizarListaPlaylists()
    document.getElementById("modalPlaylist").style.display = "flex"
})

function fecharModalPlaylist() {
    document.getElementById("modalPlaylist").style.display = "none"
    document.getElementById("inputNovaPlaylist").value = ""
}

async function getPlaylists() {
    return await window.fbGetPlaylists(apelidoAtual)
}

async function savePlaylists(playlists) {
    await window.fbSavePlaylists(apelidoAtual, playlists)
}

async function criarPlaylist() {
    const input = document.getElementById("inputNovaPlaylist")
    const nome = input.value.trim()
    if (!nome) return

    const playlists = await getPlaylists()
    playlists.push({ nome, musicas: [] })
    await savePlaylists(playlists)

    input.value = ""
    input.placeholder = "Playlist criada!"
    setTimeout(() => input.placeholder = "Nova playlist...", 2000)

    atualizarListaPlaylists()
    renderAbaPlaylists()
}

async function atualizarListaPlaylists() {
    const container = document.getElementById("listaPlaylists")
    const playlists = await getPlaylists()
    const musicaAtual = fila[indiceFila]

    container.innerHTML = `<p class="modal-secao">Suas playlists</p>`

    if (playlists.length === 0) {
        container.innerHTML += `<p style="color:#555; font-size:13px; padding: 8px 0;">Nenhuma playlist ainda.</p>`
        return
    }

    playlists.forEach((pl, i) => {
        const jaAdicionada = musicaAtual && pl.musicas.some(m => m.src === musicaAtual.src)
        const div = document.createElement("div")
        div.className = `playlist-item${jaAdicionada ? " adicionada" : ""}`
        div.innerHTML = `
            <i class="ti ti-playlist" style="font-size:16px; color:${jaAdicionada ? "rgb(57,242,248)" : "#aaa"};" aria-hidden="true"></i>
            <span class="playlist-item-nome" style="color:${jaAdicionada ? "rgb(57,242,248)" : "#fff"}">${pl.nome}</span>
            <span class="playlist-item-count">${pl.musicas.length} músicas</span>
            ${jaAdicionada ? '<i class="ti ti-check" style="font-size:16px; color:rgb(57,242,248);" aria-hidden="true"></i>' : ""}
        `
        if (!jaAdicionada) {
            div.onclick = () => adicionarNaPlaylist(i)
        }
        container.appendChild(div)
    })
}

async function adicionarNaPlaylist(index) {
    const playlists = await getPlaylists()
    const musica = fila[indiceFila]
    if (!musica) return

    playlists[index].musicas.push(musica)
    await savePlaylists(playlists)
    atualizarListaPlaylists()
    renderAbaPlaylists()
}
document.getElementById("modalPlaylist").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalPlaylist")) {
        fecharModalPlaylist()
    }
})

async function renderAbaPlaylists() {
    const painel = document.getElementById("painel-playlists")
    const playlists = await getPlaylists()

    painel.innerHTML = ""

    if (playlists.length === 0) {
        painel.innerHTML = `<p style="color:#555; padding: 20px; font-size:14px;">Nenhuma playlist criada ainda.</p>`
        return
    }

    playlists.forEach((pl, i) => {
        const div = document.createElement("div")
        div.className = "playlist-aba-item"

        const numero = document.createElement("div")
        numero.className = "coluna-musica numero-musica"
        numero.textContent = String(i + 1).padStart(2, "0")

        const nome = document.createElement("div")
        nome.className = "coluna-musica titulo-musica"
        nome.textContent = pl.nome

        const count = document.createElement("div")
        count.className = "coluna-musica album-musica"
        count.textContent = `${pl.musicas.length} músicas`

        const editar = document.createElement("div")
        editar.className = "coluna-musica acao-letra"
        editar.style.position = "relative"

        const btnEditar = document.createElement("img")
        btnEditar.src = "icons/edit_playlist.svg"
        btnEditar.style.cssText = "width:20px; height:20px; cursor:pointer; opacity:0.6; transition: opacity 0.2s;"
        btnEditar.onmouseover = () => btnEditar.style.opacity = "1"
        btnEditar.onmouseout = () => btnEditar.style.opacity = "0.6"
        btnEditar.onclick = (e) => {
            e.stopPropagation()
            console.log("delloword")
            fecharTodosDropdowns()
            const dropdown = editar.querySelector(".dropdown-playlist")
            dropdown.style.display = "block"
        }

        const dropdown = document.createElement("div")
        dropdown.className = "dropdown-playlist"
        dropdown.style.display = "none"
        dropdown.innerHTML = `
            <div class="dropdown-item" onclick="abrirModalEditar(${i})">Remover música</div>
            <div class="dropdown-item vermelho" onclick="excluirPlaylist(${i})">Excluir playlist</div>
        `
        dropdown.addEventListener("click", (e) => e.stopPropagation())

        editar.appendChild(btnEditar)
        editar.appendChild(dropdown)

        div.append(numero, nome, count, editar)
        div.onclick = () => abrirPlaylist(i)
        painel.appendChild(div)
    })
}

function fecharTodosDropdowns() {
    document.querySelectorAll(".dropdown-playlist").forEach(d => d.style.display = "none")
}

async function excluirPlaylist(index) {
    fecharTodosDropdowns()
    const playlists = await getPlaylists()
    playlists.splice(index, 1)
    await savePlaylists(playlists)
    renderAbaPlaylists()
}

async function abrirModalEditar(index) {
    const playlists = await getPlaylists()
    const pl = playlists[index]

    document.getElementById("modalEditarNome").textContent = pl.nome

    const lista = document.getElementById("listaEditarMusicas")
    lista.innerHTML = ""

    if (pl.musicas.length === 0) {
        lista.innerHTML = `<p style="color:#555; font-size:13px;">Nenhuma música nessa playlist.</p>`
    } else {
        pl.musicas.forEach((musica, mi) => {
            const div = document.createElement("div")
            div.className = "playlist-item"
            div.style.justifyContent = "space-between"
            div.innerHTML = `
                <span style="font-size:14px; color:#fff;">${musica.titulo}</span>
                <span style="font-size:12px; color:#aaa;">${musica.artista}</span>
                <img src="icons/deleteMusica.svg" title="Remover" style="width:18px; height:18px; cursor:pointer; opacity:0.6; margin-left:auto;"
                    onmouseover="this.style.opacity='1'"
                    onmouseout="this.style.opacity='0.6'"
                    onclick="removerDaPlaylist(${index}, ${mi})">
            `
            lista.appendChild(div)
        })
    }

    document.getElementById("modalEditar").style.display = "flex"
}

async function removerDaPlaylist(playlistIndex, musicaIndex) {
    const playlists = await getPlaylists()
    playlists[playlistIndex].musicas.splice(musicaIndex, 1)
    await savePlaylists(playlists)
    abrirModalEditar(playlistIndex)
    renderAbaPlaylists()
}

document.getElementById("modalEditar").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalEditar")) {
        document.getElementById("modalEditar").style.display = "none"
    }
})

document.addEventListener("click", () => fecharTodosDropdowns())

async function abrirPlaylist(index) {
    const playlists = await getPlaylists()
    const pl = playlists[index]
    fila = pl.musicas
    indiceFila = 0

    trocarAba("musicas")
    listM.innerHTML = ""

    fila.forEach((musica, index) => {
        const div = document.createElement("div")
        div.className = "musica"
        div.dataset.titulo = musica.titulo

        const numero = document.createElement("div")
        numero.className = "coluna-musica numero-musica"
        numero.textContent = String(index + 1).padStart(2, "0")

        const titulo = document.createElement("div")
        titulo.className = "coluna-musica titulo-musica"
        const tituloTexto = document.createElement("span")
        tituloTexto.textContent = musica.titulo
        titulo.appendChild(tituloTexto)

        const album = document.createElement("div")
        album.className = "coluna-musica album-musica"
        album.textContent = musica.album || "—"

        const tempo = document.createElement("div")
        tempo.className = "coluna-musica tempo-musica"
        tempo.textContent = "0:00"

        const acaoLetra = document.createElement("div")
        acaoLetra.className = "coluna-musica acao-letra"
        const btnLetra = document.createElement("span")
        btnLetra.className = "btn-letra"
        btnLetra.textContent = "Letra"
        btnLetra.onclick = (e) => {
            e.stopPropagation()
            const nomeArquivo = musica.src.split("/").pop().replace(".mp3", "")
            carregarLetra(nomeArquivo)
            trocarAba("letras")
        }
        acaoLetra.appendChild(btnLetra)

        const audioTemporario = new Audio(musica.src)
        audioTemporario.preload = "metadata"
        audioTemporario.addEventListener("loadedmetadata", () => {
            tempo.textContent = formatarDuracao(audioTemporario.duration)
        }, { once: true })

        div.append(numero, titulo, album, tempo, acaoLetra)
        listM.appendChild(div)
    })
}