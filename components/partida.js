const Partida = {
    name: 'partida',
    template: `
    <div>
        <hr />
        <h3>{{ this.nome }} - Pontos: {{ pontos }}</h3>
        <p>Jogadores: {{ jogadores.length }}</p>
        <h2>Letra: {{ letra }}</h2>
        <span>Rodada: {{ rodadas }}</span>
        <div class="input-group" v-for="a in assuntos" :key="a.id">
            <div class="input-group-prepend">
                <span class="input-group-text">{{ a.nome }}</span>
            </div>
            <input type="text" class="form-control" :disabled="status === 'fim' || terminei" v-model="a.resposta" />
            <div v-show="status === 'fim'" class="input-group-prepend">
                <span class="input-group-text">Pontos</span>
            </div>
            <select v-show="status === 'fim'" :disabled="pontosConfirmados || a.resposta.trim().length === 0" class="form-control" v-model="a.pontos">
                <option value="0">0</option>
                <option value="5">5</option>
                <option value="10">10</option>
            </select>
        </div>
        <button @click="confirmarPontos" :disabled="pontosConfirmados" class="btn btn-success" v-show="status === 'fim'">Confirmar pontos</button>
        <button class="btn btn-success" v-show="status === 'rodada' || status === 'criado' && jogadores.length > 1" :disabled="terminei" @click="terminar">{{ terminei ? "Aguardando os outros jogadores..." : "Terminei" }}</button>
        <hr />
        <ranking :jogadores="jogadores" />
    </div>
    `,
    props: ['socket', 'nome', 'jogadores', 'assuntos'],
    data() {
        return {
            letra: '',
            rodadas: 0,
            pontosConfirmados: false,
        }
    },
    methods: {
		iniciando(contador) {
			this.letra = `${contador}...`
		},
        novaRodada(dados) {
			this.letra = dados.letra
			this.rodadas = dados.rodadas
            this.pontosConfirmados = false
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
			if (!jogador) {
				return false
			}
			return jogador.terminou
		}
    },
    components: {
        Ranking
    }
}
