const Login = {
    name: 'login',
    template:`
    <div>
        <form @submit.prevent="logar">
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text">Nome</span>
                </div>
                <input type="text" class="form-control" v-model="nome">
                <button :disabled="alguemCriando" class="btn btn-primary">{{ botaoEntrar }}</button>
            </div>
        </form>
    </div>
    `,
    props: ['socket'],
    mounted() {
        this.socket.on("criando", v => {
            this.alguemCriando = v
        })
        this.socket.on("jogo", jogo => {
            this.jogoCriado = jogo.criado
            this.alguemCriando = jogo.criando
        })
    },
    data() {
        return {
            nome: '',
            jogoCriado: false,
            alguemCriando: false
        }
    },
    methods: {
        logar() {
			if (this.jogoCriado) {
				this.socket.emit("entrar", this.nome)
				return
			}
			this.socket.emit("criando")
            this.$emit("login", this.nome)
		}
    },
	computed: {
		botaoEntrar() {
			if (this.alguemCriando) {
				return "Alguém está criando o jogo..."
			}
			return (this.jogoCriado) ? "Entrar" : "Criar"
		}
    }
}
