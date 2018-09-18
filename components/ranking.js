const Ranking = {
    name: 'ranking',
    template: `
    <div>
        <h4>Ranking</h4>
        <ol>
            <li v-for="j in jogadoresOrdenados">{{j.nome}} - Pontos: {{j.pontos}} {{(j.terminou) ? "Terminou!" : ""}} {{(j.confirmou) ? "Confirmou!" : ""}}</li>
        </ol>
    </div>
    `,
    props: ['jogadores'],
    computed: {
		jogadoresOrdenados() {
			return this.jogadores.sort((a, b) => - (a.pontos - b.pontos))
		}
    }
}
