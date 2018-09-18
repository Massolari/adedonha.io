const Criacao = {
    name: 'criacao',
    template: `
    <div>
        <form @submit.prevent="criarJogo">
            <div class="input-group" v-for="a in assuntos" :key="a.id">
                <div class="input-group-prepend">
                    <span class="input-group-text">Nome</span>
                </div>
                <input type="text" class="form-control" v-model="a.nome" required>
                <button :disabled="assuntos.length === 1" @click="removerAssunto(a.id)" type="button" class="btn btn-danger">Remover</button>
            </div>
            <button @click="adicionarAssunto" type="button" class="btn btn-primary">Adicionar</button>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Tempo</span>
                </div>
                <input type="text" class="form-control" v-model.number="tempo" required>
            </div>
            <div class="card">
                <div class="card-body">
                    <div style="font-weight: bold">Ao terminar:</div>
                    <div class="form-check">
                        <input type="checkbox" id="criarTempo" class="form-check-input" v-model="tempoMetade" />
                        <label for="criarTempo" class="form-check-label">Tempo cair pela metade</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="pontosBonus" class="form-check-input" v-model="pontosBonus" />
                        <label for="pontosBonus" class="form-check-label">Ganhar pontos bônus (10% do tempo atual, em segundos)</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="assuntosAleatorios" class="form-check-input" v-model="assuntosAleatorios" />
                        <label for="assuntosAleatorios" class="form-check-label">Gerar assuntos aleatórios a cada rodada</label>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary">Criar</button>
        </form>
    </div>
    `,
    props: ['socket', 'nome'],
    data() {
        return {
            assuntos: [{ id: 1, nome: ""}],
            tempo: 0,
            tempoMetade: false,
            pontosBonus: false,
            assuntosAleatorios: false
        }
    },
    methods: {
		criarJogo() {
			socket.emit("criar", {
				assuntos: this.assuntos,
				nome: this.nome,
				tempo: this.tempo,
				tempoMetade: this.tempoMetade,
				pontosBonus: this.pontosBonus,
				assuntosAleatorios: this.assuntosAleatorios
			})
            this.$emit("criar", this.tempo)
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
    }
}
