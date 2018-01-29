const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const path = require("path")

app.use(express.static(path.join(__dirname, "node_modules")))

const jogo = {
    letra: "",
    jogadores: [],
    rodadas: 0,
    tempo: 0,
    assuntos: [],
    confirmados: 0
}
let criando = false
const adedonha = {
    letras: [],
    retornarLetras(){
        return [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "X",
            "Y",
            "Z"
        ]
    },
    sortear() {
        if (this.letras.length === 0) {
            this.letras = this.retornarLetras()
            console.log(`Iniciando o jogo com ${this.letras.length} letras...`)
        }
        const n = Math.floor(Math.random() * this.letras.length)
        const letra = this.letras[n]
        console.log(`Letra sorteada: ${letra}`)
        this.letras.splice(n, 1)
        console.log(`Letras restantes: ${this.letras.length}`)
        return letra
    },
    recomecar() {
        this.letras = this.retornarLetras()
    }
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

io.on("connection", socket => {
    console.log("A user connected...")
    socket.emit("jogo", {
        criado: jogo.assuntos.length > 0,
        criando
    })

    socket.on("criando", val => {
        socket.nome = val
        criando = val
        socket.broadcast.emit("criando", true)
    })

    socket.on("criar", criacao => {
        jogo.assuntos = criacao.assuntos
        jogo.jogadores.push({
            nome: criacao.nome,
            pontos: 0
        })
        jogo.tempo = 1000 * criacao.tempo
        criando = false
        socket.broadcast.emit("jogo", {
            criado: jogo.assuntos.length > 0,
            criando
        })
    })

    socket.on("entrar", nome => {
        socket.nome = nome
        jogo.jogadores.push({
            nome,
            pontos: 0
        })
        socket.broadcast.emit("novoJogador", jogo.jogadores)
        if (jogo.rodadas === 0) {
            adedonha.recomecar()
            jogo.letra = adedonha.sortear()
            jogo.rodadas++
            const dados = {
                letra: jogo.letra,
                assuntos: jogo.assuntos,
                jogadores: jogo.jogadores,
                rodadas: jogo.rodadas
            }
            socket.broadcast.emit("novaRodada", dados)
            socket.emit("novaRodada", dados)
            setTimeout(() => {
                socket.broadcast.emit("fim", true)
                socket.emit("fim", true)
            }, jogo.tempo)
            return
        }
    })

    socket.on("confirmados", () => {
        jogo.confirmados++
        console.log(`Confirmados: ${jogo.confirmados}
Jogadores: ${jogo.jogadores.length}`)
        if (jogo.confirmados === jogo.jogadores.length) {
            jogo.confirmados = 0
            const letra = adedonha.sortear()
            jogo.rodadas++
            const dados = {
                letra,
                assuntos: jogo.assuntos,
                jogadores: jogo.jogadores,
                rodadas: jogo.rodadas
            }
            socket.broadcast.emit("novaRodada", dados)
            socket.emit("novaRodada", dados)
            setTimeout(() => {
                socket.broadcast.emit("fim", true)
                socket.emit("fim", true)
            }, jogo.tempo)
        }
    })

    socket.on("disconnect", () => {
        if (criando === socket.nome) {
            criando = false
        }
        socket.broadcast.emit("jogo", {
            criado: jogo.assuntos.length > 0,
            criando
        })
        jogo.jogadores = jogo.jogadores.filter(j => j.nome !== socket.nome)
        if (jogo.jogadores.length === 0) {
            jogo.assuntos = []
            jogo.rodadas = 0
        }
    })
})

http.listen(3000, () => {
    console.log("Listening on port 3000...")
})
