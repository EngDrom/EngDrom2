

class LevelTree extends Component {
    constructor (parent, engine) {
        super(parent);

        this.engine = engine;

        engine.level_tree = this;

        this.element = createElement("div", {}, "", []);

        this._make_component();
    }

    _make_component () {
        for (let child of this.element.childNodes)
            this.element.removeChild(child);

        this.config = []
        let level   = this.engine.canvas.level;
        if (level !== undefined) {

            for (let [ name, type, instance, options ] of level.instances) {
                if (type === "grid") {
                    this.config.push( {
                        "type": "folder",
                        "text": name,
                        "icon": "grid_4x4",
                        "files": instance.layers.map((x) => {
                            return {
                                "type": "file",
                                "text": x.name,
                                "icon": "grid_on"
                            }  
                        })
                    } );
                } else {
                    this.config.push( {
                        "type": "file",
                        "text": name,
                        "icon": "view_in_ar"
                    } );
                }
            }

        }

        console.log(this.config)

        this.element.appendChild(new MTree( this, this.config ).render());
    }
    _render () {
        return this.element;
    }
}

