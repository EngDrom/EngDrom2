
class GraphValidation {
    isValid (nodes) {  }
}

class GraphCompilerComponent extends Component {
    constructor (parent, graph) {
        super(parent);
        this.graph = graph;

        this._first_render();
    }
    _first_render () {
        this.element = createElement("div", {}, "", [
            createElement("div", {}, "p-6", [
                createElement("div", {
                    onclick: () => this.compile()
                }, "bg-Vwebdrom-editor-blue-button hover:bg-Vwebdrom-editor-blue text-center text-white font-500 text-lg py-2 select-none cursor-pointer", [ "Compile" ])
            ])
        ]);
    }
    compile () {
        let graph = this.graph;
        let nodes = graph.nodes;
        let validater = new MaterialGraphValidation();
        console.log(validater.isValid(nodes));
    }

    _render () {
        return this.element;
    }
}
