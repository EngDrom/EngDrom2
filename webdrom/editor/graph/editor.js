

class GraphOnglet extends Component {
    constructor (parent, name, path, icon, config = {}, enabled = false) {
        super(parent);

        this.config = config;

        this.name = name;
        this.path = path;
        this.icon = icon;

        this.enabled = enabled;

        this._first_render();
    }

    _first_render () {
        this.close_icon = createIcon("close", "icon-24 select-none");
        this.element = createElement("div", {
            onclick: (event) => this.parent._enable(this)
        }, `h-12 p-2 px-4 flex text-base gap-4 border-Vwebdrom-background border-0 border-r-1
                                                bg-Vwebdrom-light-background hover:bg-Vwebdrom-mean-light-background cursor-pointer`, [
            createIcon(this.icon, "icon-32 select-none"),
            createElement("div", {}, "", [
                createElement("div", {}, "center-h select-none", [this.name])
            ]),

            createElement("div", { onclick: (event) => this.parent._remove(this) }, "py-1", [
                this.close_icon
            ])
        ])

        this._update();
    }
    _update () {
        if (this.enabled)
            this.element.style.backgroundColor = "var(--webdrom-background)";
        else this.element.style.backgroundColor = "";
    }
    _render () {
        return this.element;
    }
}

class GraphOngletManager extends Component {
    constructor (parent, enable_callback, disable_callback) {
        super(parent);

        this.onglets = new Set([  ]);
        this.enabled_onglet = undefined;

        this.disable_callback = disable_callback;
        this.enable_callback  = enable_callback

        this._first_render ();
    }

    _disable () {
        if (this.enabled_onglet === undefined) return ;

        this.disable_callback(this.enabled_onglet.config.graph);
        this.enabled_onglet.enabled = false;
        this.enabled_onglet._update();
        this.enabled_onglet = undefined;
    }
    _enable (onglet) {
        if (!this.onglets.has(onglet)) return ;

        this._disable();
        this.enable_callback(onglet.config.graph);
        onglet.enabled = true;
        onglet._update();
        this.enabled_onglet = onglet;
    }
    _append (mgraph, file_path) {
        let path = file_path.split("/")
        if (path.length == 0) return ;

        for (let onglet of this.onglets) {
            if (onglet.path !== file_path) continue ;

            this._enable(onglet);
            return ;
        }

        let name = path[path.length - 1];
        let icon = "description";
        if (file_path.endsWith(".mat")) icon = "insights";

        let onglet = new GraphOnglet( this, name, file_path, icon, { graph: mgraph });
        this.onglets.add(onglet);
        this.element.appendChild(onglet.render());

        this._enable (onglet);
        this._update();
    }
    _remove (onglet) {
        if (this.enabled_onglet === onglet)
            this._disable(onglet);
        
        this.element.removeChild(onglet._render());
        this.onglets.delete(onglet);
        this._update();
    }

    _first_render () {
        this.element = createElement("div", {}, "top-0 flex absolute h-12 bg-Vwebdrom-lighter-background w-full overflow-scroll", [  ])
    
        this._update();
    }
    _render () { return this.element; }
    _update () {
        if (this.onglets.size == 0)
            this.element.style.backgroundColor = "var(--webdrom-contrast)";
        else this.element.style.backgroundColor = "";
    }
}

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
        this.manager = new GraphOngletManager(this, (enable_graph) => {
            editor_area.insertBefore(enable_graph._render(), editor_area.childNodes[0]);
        }, (disable_graph) => {
            editor_area.removeChild(disable_graph._render());
        });
        
        let editor_area = createElement("div", {}, "flex flex-row", [
            //this.graph.render(),
            this.manager.render()
        ]);

        let tree = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Project", "component": (parent) => new FileTree(parent, (event, node, path) => {
                this.manager._append( new MGraph(this, path), path );
            }).render(), "icons": []  },
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
            createElement("div", {}, "w-full h-full relative", [
                editor_area
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

