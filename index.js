const express = require("express")
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)
const path = require("path")

app.use(express.static(path.join(__dirname, "node_modules")))
app.use(express.static(path.join(__dirname)))

let timer
let idSocket = 0

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

const jogo = {
    letra: "",
    jogadores: [],
    rodadas: 0,
    tempo: 0,
    assuntos: [],
    confirmados: 0,
    tempoAtual: 0,
    criando: false,
    tempoMetade: false,
    pontosBonus: false,
    novaRodada() {
    	let contador = 3
    	const contagem = setInterval(() => {
    		io.emit("iniciando", contador)
    		contador--
    		if (contador >= 0) {
    			return
    		}
    		clearInterval(contagem)
        	if (this.rodadas === 0) {
            	adedonha.recomecar()
        	}
        	this.jogadores.forEach(j => {
            	j.confirmou = false
        	})
        	this.letra = adedonha.sortear()
        	this.rodadas++
        	io.emit("novaRodada", this)
        	this.tempoAtual = this.tempo
        	timer = setInterval(() => {
            	if (this.tempoAtual <= 0) {
                	this.terminarRodada()
            	}
                io.emit("tempo", this.tempoAtual--)
        	}, 1000)
        }, 1000)
    },
    parar() {
        clearInterval(timer)
        timer = null
    },
    terminarRodada() {
        this.parar()
        this.jogadores.forEach(j => {
            j.terminou = false
        })
        this.tempoAtual = this.tempo
        io.emit("tempo", this.tempoAtual)
        io.emit("fim", true)
        io.emit("atualizarJogadores", this.jogadores)
    },
    adicionarJogador(id, nome) {
        this.jogadores.push({
            id,
            nome,
            pontos: 0,
            terminou: false,
            confirmou: false
        })
    },
    removerJogador(id) {
        this.jogadores = this.jogadores.filter(j => j.id !== id)
    },
    jogadorTerminou(id) {
        if (!timer) {
            return
        }
        let index
        this.jogadores.forEach((j, i) => {
            if (j.id === id) {
                j.terminou = true
                if (this.pontosBonus) {
                    j.pontos += Math.floor(this.tempoAtual / 10)
                }
            }
        })
        if (this.jogadores.filter(j => !j.terminou).length === 0) {
            this.terminarRodada()
        }
        if (this.tempoMetade) {
            this.tempoAtual = Math.ceil(this.tempoAtual / 2)
        }
    },
    jogadorConfirmou(id, pontos) {
	    this.jogadores.forEach(j => {
            if (j.id === id) {
                j.pontos += pontos
                j.confirmou = true
            }
        })
        if (this.jogadores.filter(j => !j.confirmou).length === 0) {
            this.novaRodada()
        }
    },
    jogadorSaiu(socket) {
        if (this.criando === socket.id) {
            this.criando = false
            socket.broadcast.emit("jogo", this.dadosCriacao())
        }
        this.removerJogador(socket.id)
        socket.broadcast.emit("atualizarJogadores", this.jogadores)
        if (this.jogadores.length === 0) {
            this.assuntos = []
            this.rodadas = 0
            return
        }
        if (this.jogadores.length === 1) {
            this.rodadas = 0
            this.letra = "Aguardando..."
            this.jogadores[0].pontos = 0
            this.parar()
            io.emit("novaRodada", jogo)
            return
        }
        if (this.jogadores.filter(j => !j.terminou).length === 0) {
            this.terminarRodada()
        }
        if (this.jogadores.filter(j => !j.confirmou).length === 0) {
            this.novaRodada()
        }
    },
    dadosCriacao() {
        return {
            criando: this.criando,
            criado: this.assuntos.length > 0
        }
    },
    jogadorCriando(id) {
        this.criando = id
    },
    jogadorCriou(dados) {
        this.assuntos = dados.assuntos
        this.adicionarJogador(this.criando, dados.nome)
        this.tempo = Number(dados.tempo)
        this.criando = false
        this.tempoMetade = dados.tempoMetade
        this.pontosBonus = dados.pontosBonus
    }
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

io.on("connection", socket => {
    socket.id = idSocket++
    console.log(`A user connected with id ${socket.id}...`)
    socket.emit("jogo", jogo.dadosCriacao())
    socket.emit("id", socket.id)

    socket.on("criando", () => {
        jogo.jogadorCriando(socket.id)
        socket.broadcast.emit("criando", true)
    })

    socket.on("criar", criacao => {
        jogo.jogadorCriou(criacao)
        socket.broadcast.emit("jogo", jogo.dadosCriacao())
        io.emit("atualizarJogadores", jogo.jogadores)
    })

    socket.on("entrar", nome => {
        jogo.adicionarJogador(socket.id, nome)
        io.emit("atualizarJogadores", jogo.jogadores)
        socket.emit("novaRodada", jogo)
        if (jogo.rodadas === 0 && jogo.jogadores.length === 2) {
            jogo.novaRodada()
        }
    })

    socket.on("comecar", () => {
        jogo.confirmados++
        if (jogo.jogadores.length === jogo.confirmados) {
            jogo.confirmados = 0
            jogo.novaRodada()
        }
    })

    socket.on("terminei", () => {
        jogo.jogadorTerminou(socket.id)
	    io.emit("atualizarJogadores", jogo.jogadores)
    })

    socket.on("confirmados", pontos => {
        jogo.jogadorConfirmou(socket.id, pontos)
        io.emit("atualizarJogadores", jogo.jogadores)
    })

    socket.on("disconnect", () => {
        jogo.jogadorSaiu(socket)
    })
})

http.listen(3000, () => {
    console.log("Listening on port 3000...")
})