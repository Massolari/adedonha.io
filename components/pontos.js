
const Pontos = {
    name: 'pontos',
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
            <input type="text" class="form-control" disabled :value="a.resposta" />
            <div class="input-group-prepend">
                <span class="input-group-text">Pontos</span>
            </div>
            <select :disabled="pontosConfirmados || a.resposta.trim().length === 0" class="form-control" value="a.pontos">
                <option value="0">0</option>
                <option value="5">5</option>
                <option value="10">10</option>
            </select>
        </div>
        <button @click="confirmarPontos" :disabled="pontosConfirmados" class="btn btn-success">Confirmar pontos</button>
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
    },
    components: {
        Ranking
    }
}
