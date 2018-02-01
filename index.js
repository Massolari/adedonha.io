const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const path = require("path")

app.use(express.static(path.join(__dirname, "node_modules")))

let timer
let idSocket = 0

const jogo = {
    letra: "",
    jogadores: [],
    rodadas: 0,
    tempo: 0,
    assuntos: [],
    confirmados: 0,
    tempoAtual: 0,
    novaRodada() {
	this.terminados = 0
	this.jogadores.forEach(j => {
	    j.terminou = false
	})
        if (this.rodadas === 0) {
            adedonha.recomecar()
        }
        this.letra = adedonha.sortear()
        this.rodadas++
        io.emit("novaRodada", this)
        this.tempoAtual = 100
        timer = setInterval(() => {
            if (this.tempoAtual <= 0) {
		this.terminarRodada()
            }
            io.emit("tempo", --this.tempoAtual)
        }, this.tempo/100)
    },
    parar() {
        clearInterval(timer)
    },
    terminarRodada() {
	clearInterval(timer)
	this.tempoAtual = 100
	io.emit("tempo", this.tempoAtual)
	io.emit("fim", true)
    }
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
            "K",
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
    socket.id = idSocket++
    console.log("A user connected...")
    socket.emit("jogo", {
        criado: jogo.assuntos.length > 0,
        criando
    })

    socket.on("criando", val => {
        criando = socket.id
        socket.broadcast.emit("criando", true)
    })

    socket.on("criar", criacao => {
        jogo.assuntos = criacao.assuntos
        jogo.jogadores.push({
            id: socket.id,
            nome: criacao.nome,
            pontos: 0,
	    terminou: false
        })
        jogo.tempo = 1000 * criacao.tempo
        criando = false
        socket.broadcast.emit("jogo", {
            criado: jogo.assuntos.length > 0,
            criando
        })
        io.emit("atualizarJogadores", jogo.jogadores)
    })

    socket.on("entrar", nome => {
        jogo.jogadores.push({
            id: socket.id,
            nome,
            pontos: 0,
	    terminou: false
        })
        io.emit("atualizarJogadores", jogo.jogadores)
        if (jogo.rodadas === 0) {
            jogo.novaRodada()
            return
        }
        socket.emit("novaRodada", jogo)
    })

    socket.on("comecar", () => {
        jogo.confirmados++
        if (jogo.jogadores.length === jogo.confirmados) {
            jogo.confirmados = 0
            jogo.novaRodada()
        }
    })

    socket.on("terminei", () => {
        jogo.terminados++
	if (jogo.terminados === jogo.jogadores.length) {
	    jogo.terminarRodada()
	}
	jogo.jogadores.forEach(j => {
	    if (j.id === socket.id) {
		j.terminou = true
	    }
	})
	io.emit("atualizarJogadores", jogo.jogadores)
    })

    socket.on("confirmados", pontos => {
        jogo.confirmados++
	jogo.jogadores.forEach(j => {
            if (j.id === socket.id) {
                j.pontos = pontos
            }
        })
        console.log(`Confirmados: ${jogo.confirmados}
Jogadores: ${jogo.jogadores.length}
Jogador: ${socket.nome}
Pontos: ${pontos}`)
        if (jogo.confirmados === jogo.jogadores.length) {
            jogo.confirmados = 0
            jogo.novaRodada()
        }
    })

    socket.on("disconnect", () => {
        if (criando === socket.id) {
            criando = false
        }
        jogo.jogadores = jogo.jogadores.filter(j => j.id !== socket.id)
        socket.broadcast.emit("jogo", {
            criado: jogo.assuntos.length > 0,
            criando
        })
        socket.broadcast.emit("atualizarJogadores", jogo.jogadores)
        if (jogo.jogadores.length === 0) {
            jogo.assuntos = []
            jogo.rodadas = 0
            return
        }
        if (jogo.jogadores.length === 1) {
            jogo.rodadas = 0
            jogo.letra = "Aguardando..."
            jogo.jogadores[0].pontos = 0
            jogo.parar()
            io.emit("novaRodada", jogo)
            return
        }
	if (jogo.terminados === jogo.jogadores.length) {
	    jogo.terminarRodada()
	}
        if (jogo.confirmados === jogo.jogadores.length) {
            jogo.confirmados = 0
            jogo.novaRodada()
        }
    })
})

http.listen(3000, () => {
    console.log("Listening on port 3000...")
})
