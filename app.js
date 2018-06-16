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
	console.log(jogadores)
    app.jogadores = jogadores
})
socket.on("tempo", tempo => {
    app.barraTempo = tempo
})
socket.on("fim", v => {
    // app.terminei = false
    app.fimPartida = v
    app.pontosConfirmados = false
})

socket.on("status", s => {
	console.log(s)
	app.status = s.desc
	switch (s.desc) {
		case "iniciando":
			app.iniciando(s.contador)
			break
		case "rodada":
			app.novaRodada(s.dados)
			break
		case "fim":
			app.fimRodada(s)
			break
		case "criado":
			app.criado(s.jogadores)
	}
})
const app = new Vue({
    el: "#app",
    data: {
    	id: 0,
		nome: "",
		jogoCriado: false,
		alguemCriando: false,
		assuntos: [{ id: 1, nome: "", resposta: "" }],
		tempoCriacao: 0,
		jogadores: [],
		letra: "Aguardando...",
		pontosConfirmados: false,
		barraTempo: 100,
		barraTempoMax: 100,
		rodadas: 0,
	    // terminei: false,
	    criar: {
	    	tempoMetade: false,
			pontosBonus: false,
			assuntosAleatorios: false
		},
		status: "deslogado" // criando, inciando, 
    },
    methods: {
		iniciando(contador) {
			this.letra = `${contador}...`
		},
		novaRodada(dados) {
			this.barraTempo = this.barraTempoMax = dados.tempo
			this.fimPartida = false
			this.letra = dados.letra
			this.rodadas = dados.rodadas
			this.assuntos = dados.assuntos.map(a => ({
				id: a.id,
				nome: a.nome,
				pontos: 0,
				resposta: ""
			}))
			this.jogadores = dados.jogadores
		},
		fimRodada(dados) {
			this.barraTempo = s.tempo
			this.jogadores = s.jogadores
		},
		criado(jogadores) {
			this.jogadores = jogadores
		},
        logar() {
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
		},
		confirmarPontos() {
			swal({
				title: 'Confirmar pontos',
				text: "Deseja confirmar seus pontos?",
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Confirmar!',
				cancelButtonText: 'Não!'
			}).then((result) => {
				if (result.value) {
					this.pontosConfirmados = true
					socket.emit("confirmados", this.assuntos.reduce((acc, ass) => acc + Number(ass.pontos), 0))	
				}	
			})
		},
        terminar() {
			swal({
				title: 'Terminar de preencher',
				text: "Terminou de preencher as palavras?",
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Terminei!',
				cancelButtonText: 'Ainda não!'
			}).then((result) => {
				if (result.value) {
					socket.emit("terminei")
				}	
			})
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