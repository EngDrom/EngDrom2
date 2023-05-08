

class LevelTree extends Component {
    constructor (parent, engine) {
        super(parent);

        this.engine = engine;

        engine.level_tree = this;

        this.element = createElement("div", {}, "", []);

        this._make_component();
    }

    onclick (node) {
        if (this.cur_config)
            this.cur_config.bubble = undefined;

        this.cur_config = node.config;
        this.cur_config.bubble = {
            "opacity": "20%",
            "color": "bg-blue-300"
        }

        this.tree._update();
    }

    _make_component () {
        document.addEventListener("WebDrom.MeshInstance.Clicked", (event) => {
            let instance = event.meshInstance;

            let node = instance.tree_node
            this.onclick(node);
        })

        for (let child of this.element.childNodes)
            this.element.removeChild(child);
        
        let action = (event, node) => {
            let mesh_instance = node.config.instance;

            let c_event = new CustomEvent( "WebDrom.MeshInstance.Clicked", {} );
            c_event.meshInstance = mesh_instance;

            document.dispatchEvent(c_event);

            this.onclick(node)
        }

        this.config = []
        let level   = this.engine.canvas.level;
        if (level !== undefined) {

            for (let [ name, type, instance, options ] of level.instances) {
                if (type === "grid") {
                    this.config.push( {
                        "type": "folder",
                        "text": name,
                        "icon": "grid_4x4",
                        "instance": instance,
                        "files": instance.layers.map((x) => {
                            return {
                                "type": "file",
                                "text": x.name,
                                "icon": "grid_on",
                                "instance": x,
                                action
                            }  
                        }),
                        action
                    } );
                } else {
                    this.config.push( {
                        "type": "file",
                        "text": name,
                        "icon": "view_in_ar",
                        "instance": instance,
                        action
                    } );
                }
            }

        }

        this.tree = new MTree( this, this.config )

        this.element.appendChild(this.tree.render());
    }
    _render () {
        return this.element;
    }
}

