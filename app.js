socket.on("id", i => {
	app.id = i
})
socket.on("criando", v => {
    app.alguemCriando = v
})
socket.on("jogo", jogo => {
	app.jogoCriado = jogo.criado
    app.alguemCriando = jogo.criando
})
socket.on("atualizarJogadores", jogadores => {
    app.jogadores = jogadores
})
socket.on("tempo", tempo => {
    app.barraTempo = tempo
})
socket.on("iniciando", contagem => {
	app.iniciando = true
	app.letra = `${contagem}...`
})
socket.on("novaRodada", dados => {
	app.iniciando = false
	app.barraTempo = app.barraTempoMax = dados.tempo
	app.fimPartida = false
	app.letra = dados.letra
	app.rodadas = dados.rodadas
    app.assuntos = dados.assuntos.map(a => ({
        id: a.id,
		nome: a.nome,
		pontos: 0,
		resposta: ""
    }))
    app.jogadores = dados.jogadores
})
socket.on("fim", v => {
    // app.terminei = false
    app.fimPartida = v
    app.pontosConfirmados = false
})
const app = new Vue({
    el: "#app",
    data: {
    	id: 0,
		logado: false,
		nome: "",
		jogoCriado: false,
		alguemCriando: false,
		assuntos: [{ id: 1, nome: "", resposta: "" }],
		tempoCriacao: 0,
		fimPartida: false,
		jogadores: [],
		letra: "Aguardando...",
		pontosConfirmados: false,
		barraTempo: 100,
		barraTempoMax: 100,
		rodadas: 0,
	    // terminei: false,
	    iniciando: false,
	    criar: {
	    	tempoMetade: false,
			pontosBonus: false,
			assuntosAleatorios: false
	    }
    },
    methods: {
        logar() {
			this.logado = true
			if (this.jogoCriado) {
				socket.emit("entrar", this.nome)
				return
			}
			socket.emit("criando")
		},
		adicionarAssunto() {
			let max = 0
			this.assuntos.forEach(a => {
				if (a.id > max) {
					max = a.id
				}
			})
			this.assuntos.push({ id: max + 1, nome: "" })
		},
		removerAssunto(id) {
			this.assuntos = this.assuntos.filter(a => a.id !== id)
		},
		criarJogo() {
			socket.emit("criar", {
				assuntos: this.assuntos,
				nome: this.nome,
				tempo: this.criar.tempoCriacao,
				tempoMetade: this.criar.tempoMetade,
				pontosBonus: this.criar.pontosBonus,
				assuntosAleatorios: this.criar.assuntosAleatorios
			})
			this.barraTempo = this.barraTempoMax = this.criar.tempoCriacao
			this.assuntos = []
			this.jogoCriado = true
		},
		confirmarPontos() {
			if (confirm("Deseja confirmar seus pontos?")) {
				this.pontosConfirmados = true
				socket.emit("confirmados", this.assuntos.reduce((acc, ass) => acc + Number(ass.pontos), 0))
			}
		},
        terminar() {
		    if (confirm("Terminou de preencher as palavras?")) {
				socket.emit("terminei")
	    	}
		}
	},
	computed: {
		botaoEntrar() {
			if (this.alguemCriando) {
				return "Alguém está criando o jogo..."
			}
			return (this.jogoCriado) ? "Entrar" : "Criar"
		},
		jogadoresOrdenados() {
			return this.jogadores.sort((a, b) => - (a.pontos - b.pontos))
		},
		corBarraTempo() {
			if (this.barraTempo <= Math.floor(this.barraTempoMax / 10)) {
				return "danger"
			}
			if (this.barraTempo <= Math.floor(this.barraTempoMax / 2)) {
				return "warning"
			}
			return "success"
		},
		pontos() {
			if (this.jogadores.length === 0) {
				return 0
			}
			const jogador = this.jogadores.filter(j => j.id == this.id)[0]
			if (jogador == undefined) {
				return 0
			}
			return jogador.pontos
		},
		terminei() {
			if (this.jogadores.length === 0) {
				return false
			}
			const jogador = this.jogadores.filter(j => j.id == this.id)[0]
			if (jogador == undefined) {
				return false
			}
			return jogador.terminou
		}
    }
})