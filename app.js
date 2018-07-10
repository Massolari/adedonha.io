const app = new Vue({
    el: "#app",
    data: {
        socket,
    	id: 0,
		nome: "",
		assuntos: [{ id: 1, nome: "", resposta: "" }],
		jogadores: [],
		barraTempo: 100,
		barraTempoMax: 100,
		status: "deslogado" // criando, inciando, 
    },
    methods: {
		novaRodada(dados) {
			this.barraTempo = this.barraTempoMax = dados.tempo
			this.assuntos = dados.assuntos.map(a => ({
				id: a.id,
				nome: a.nome,
				pontos: 0,
				resposta: ""
			}))
			this.jogadores = dados.jogadores
            this.$refs.partida.novaRodada(dados)
		},
		fimRodada(dados) {
			this.barraTempo = dados.tempo
			this.jogadores = dados.jogadores
		},
		criado(jogadores) {
			this.jogadores = jogadores
		},
	},
	computed: {
		corBarraTempo() {
			if (this.barraTempo <= Math.floor(this.barraTempoMax / 10)) {
				return "danger"
			}
			if (this.barraTempo <= Math.floor(this.barraTempoMax / 2)) {
				return "warning"
			}
			return "success"
		}
    },
    components: {
        Login,
        Criacao,
        Partida,
        Pontos
    }
})
socket.on("id", i => {
	app.id = i
})
socket.on("atualizarJogadores", jogadores => {
	console.log(jogadores)
    app.jogadores = jogadores
})
socket.on("tempo", tempo => {
    app.barraTempo = tempo
})

socket.on("status", s => {
	console.log(JSON.stringify(s, null, 2))
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