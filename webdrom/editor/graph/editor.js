

class GraphEditor extends Component {
    constructor (parent, engine) {
        super(parent);

        this.engine = engine;

        this._first_render();
    }

    set_properties_node (node) {
        this.active_node = node;
        this.properties_manager.set_target(node);
    }
    _first_render () {
        this.graph = new MGraph(this, "color.mat");

        let tree = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Project", "component": (parent) => new FileTree(parent).render(), "icons": []  },
            { "text": "Properties", "component": (parent) => {
                this.properties_manager = new NodePropertiesComponent(parent);
                return this.properties_manager.render()
            }, "icons": [] },
            { "text": "Compilation", "component": (parent) => {
                this.compiler_component = new GraphCompilerComponent(parent, this.graph);
                return this.compiler_component.render()
            } }
        ] });

        let splitter = new MSplitter (this, "horizontal", undefined, true,
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                tree.render()
            ]),
            createElement("div", {}, "", [
                this.graph.render()
            ])
        )
        splitter.sizes = [ 300, 800 ];

        let splitter_viewport = new ViewportComponent(
            this, splitter, left_onglet, 21
        )
        this.element = createElement("div", {}, "h-full", [
            splitter_viewport.render()
        ]);
    }
    _render () { return this.element; }
}

