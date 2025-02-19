
class Scalar {
    constructor (sc) {
        this.sc = sc;
    }
    compute (v) {
        return this.sc * v;
    }
    modify (v) {
        this.sc = v;
    }
}

function append_drag_listener (scalar, element, callback, end_callback = undefined) {
    let integralX = 0;
    let integralY = 0;
    element.setAttribute("useDrag", "true");

    element.addEventListener("mousedown", (event) => {
        let target = event.target;
        if (target.hasAttribute("nodrag")) return ;

        while (target && (!target.hasAttribute("useDrag"))) target = target.parentNode;
        if (target != element) return ;

        let sx = event.clientX; let sy = event.clientY;
        
        document.onmousemove = (event) => {
            let x = event.clientX; let y = event.clientY;
            integralX += scalar.compute(x - sx);
            integralY += scalar.compute(y - sy);

            callback(scalar.compute(x - sx), scalar.compute(y - sy), integralX, integralY, (ix, iy) => {
                integralX = ix;
                integralY = iy;
            });
            
            sx = x; sy = y;
        }

        document.onmouseup = (event) => {
            document.onmousemove = undefined;
    
            if (end_callback)
                end_callback(integralX, integralY);
        };
    });
}
function neg_mod (h, mod) {
    if (h >= 0) return h % mod;

    return (mod - (- h) % mod);
}
function cap (x, min_x, max_x) {
    if (x < min_x) return min_x;
    if (x > max_x) return max_x;

    return x;
}

const GRAPH_BACKGROUND_TILING = 45;

/**
 * Molyb Graph-Based Editor
 */
class MGraph extends Component {
    constructor (parent, serialized = undefined) {
        super(parent);

        this.editor = parent;

        this.scale = 2;
        this.scala = new Scalar(2);

        let i = 0;
        this.nodes = [];

        this.current_ressource = undefined;

        this._first_render();

        serialized = [{"node":0,"library":"Vertex Input","parameters":[],"pos":{"x":149,"y":197},"inputs":[],"outputs":[{"parent":-1,"childs":[{"node_id":8,"vect_id":0}]},{"parent":-1,"childs":[{"node_id":1,"vect_id":1}]}]},{"node":1,"library":"Vertex Output","parameters":[],"pos":{"x":2133,"y":187},"inputs":[{"parent":{"node_id":13,"vect_id":0},"childs":[]},{"parent":{"node_id":0,"vect_id":1},"childs":[]}],"outputs":[]},{"node":2,"library":"Fragment Input","parameters":[],"pos":{"x":143,"y":328},"inputs":[],"outputs":[{"parent":-1,"childs":[]},{"parent":-1,"childs":[]}]},{"node":3,"library":"4D Vector","parameters":[{"const_x":1,"const_y":0,"const_z":0,"const_w":1}],"pos":{"x":493,"y":329},"inputs":[],"outputs":[{"parent":-1,"childs":[{"node_id":5,"vect_id":0}]}]},{"node":4,"library":"Fragment Output","parameters":[],"pos":{"x":855,"y":335},"inputs":[{"parent":{"node_id":6,"vect_id":0},"childs":[]}],"outputs":[]},{"node":5,"library":"Decompose 4D Vector","parameters":[],"pos":{"x":467,"y":463},"inputs":[{"parent":{"node_id":3,"vect_id":0},"childs":[]}],"outputs":[{"parent":-1,"childs":[{"node_id":6,"vect_id":0}]},{"parent":-1,"childs":[{"node_id":6,"vect_id":1}]},{"parent":-1,"childs":[{"node_id":6,"vect_id":2}]},{"parent":-1,"childs":[{"node_id":6,"vect_id":3}]}]},{"node":6,"library":"Compose 4D Vector","parameters":[],"pos":{"x":800,"y":466},"inputs":[{"parent":{"node_id":5,"vect_id":0},"childs":[]},{"parent":{"node_id":5,"vect_id":1},"childs":[]},{"parent":{"node_id":5,"vect_id":2},"childs":[]},{"parent":{"node_id":5,"vect_id":3},"childs":[]}],"outputs":[{"parent":-1,"childs":[{"node_id":4,"vect_id":0}]}]},{"node":7,"library":"Uniform 4D Matrix","parameters":["mModel"],"pos":{"x":789,"y":-124},"inputs":[],"outputs":[{"parent":-1,"childs":[{"node_id":11,"vect_id":0}]}]},{"node":8,"library":"Decompose 3D Vector","parameters":[],"pos":{"x":463,"y":-20},"inputs":[{"parent":{"node_id":0,"vect_id":0},"childs":[]}],"outputs":[{"parent":-1,"childs":[{"node_id":9,"vect_id":0}]},{"parent":-1,"childs":[{"node_id":9,"vect_id":1}]},{"parent":-1,"childs":[{"node_id":9,"vect_id":2}]}]},{"node":9,"library":"Compose 4D Vector","parameters":[],"pos":{"x":788,"y":-20},"inputs":[{"parent":{"node_id":8,"vect_id":0},"childs":[]},{"parent":{"node_id":8,"vect_id":1},"childs":[]},{"parent":{"node_id":8,"vect_id":2},"childs":[]},{"parent":{"node_id":10,"vect_id":0},"childs":[]}],"outputs":[{"parent":-1,"childs":[{"node_id":11,"vect_id":1}]}]},{"node":10,"library":"Scalar","parameters":[{"const_x":1}],"pos":{"x":464,"y":130},"inputs":[],"outputs":[{"parent":-1,"childs":[{"node_id":9,"vect_id":3}]}]},{"node":11,"library":"Matrix-Vector Multiplication","parameters":[],"pos":{"x":1110,"y":-21},"inputs":[{"parent":{"node_id":7,"vect_id":0},"childs":[]},{"parent":{"node_id":9,"vect_id":0},"childs":[]}],"outputs":[{"parent":-1,"childs":[{"node_id":13,"vect_id":1}]}]},{"node":12,"library":"Uniform 4D Matrix","parameters":["mProj"],"pos":{"x":1433,"y":-128},"inputs":[],"outputs":[{"parent":-1,"childs":[{"node_id":13,"vect_id":0}]}]},{"node":13,"library":"Matrix-Vector Multiplication","parameters":[],"pos":{"x":1759,"y":-23},"inputs":[{"parent":{"node_id":12,"vect_id":0},"childs":[]},{"parent":{"node_id":11,"vect_id":0},"childs":[]}],"outputs":[{"parent":-1,"childs":[{"node_id":1,"vect_id":0}]}]}]
        if (serialized)
            this.deserialize(serialized, MATERIAL_CATEGORY.library);
    }
    ressource_hover (res) {
        this.current_ressource = res;
    }
    ressource_end_hover () {
        this.current_ressource = undefined;
    }
    // Should resize the canvas to a scale BUT do not use for pity
    // it does not always properly works and hasn't been tested
    use_scale (scale) {
        this.scale = scale;
        this.scala.modify(this.scale);

        this.element.style.transform = `scale(calc(1 / ${this.scale}))`;
        this.element.style.width     = `calc(${this.scale} * 100%)`
        this.element.style.height    = `calc(${this.scale} * 100%)`
        this.element.style.left      = `calc(-1 * ${this.scale - 1} * 50%)`
        this.element.style.top       = `calc(-1 * ${this.scale - 1} * 50%)`
        this.bg_element.style.width     = `calc(${this.scale} * (100% + 4 * var(--webdrom-editor-graph-grid-size)))`
        this.bg_element.style.height    = `calc(${this.scale} * (100% + 4 * var(--webdrom-editor-graph-grid-size)))`
        this.bg_element.style.left      = `calc(${this.scale} * (- 2 * var(--webdrom-editor-graph-grid-size)))`
        this.bg_element.style.top       = `calc(${this.scale} * (- 2 * var(--webdrom-editor-graph-grid-size)))`
    
        this.bg_element.style.backgroundImage = `linear-gradient(var(--webdrom-editor-graph-border) .${this.scale}em, transparent .${this.scale}em), linear-gradient(90deg, var(--webdrom-editor-graph-border) .${this.scale}em, transparent .${this.scale}em)`
        this.bg_element.style.backgroundSize  = `calc(${this.scale} * var(--webdrom-editor-graph-grid-size)) calc(${this.scale} * var(--webdrom-editor-graph-grid-size))`
    }
    remove_node (node) {
        if (this.editor.active_node === node)
            this.editor.set_properties_node(undefined);
        
        this.nodes.splice(this.nodes.indexOf(node), 1);
        this._recompute_element();
    }
    _recompute_element () {
        let to_remove = [];
        for (let child of this.element.childNodes) {
            if (child === this.bg_element) continue ;
            to_remove.push(child);
        }

        for (let child of to_remove) this.element.removeChild(child);
        for (let node of this.nodes)
            this.element.appendChild(node.render());
    }
    _first_render () {
        this.bg_element = createElement("div", {}, "w-full h-full absolute forward-grid-background", []);
        this.element    = createElement("div", {}, "w-full h-full absolute overflow-hidden", [
            this.bg_element,
            ...(this.nodes.map((x) => x.render()))
        ]);
        this.rel_element = createElement("div", {}, "w-full h-full relative", [ this.element ]);

        this.use_scale(1);

        this.ix = 0;
        this.iy = 0;

        append_drag_listener(this.scala, this.bg_element, (dx, dy, ix, iy, modify) => {
            ix = cap(ix, - 2000, 2000); // TODO dynamic left and right border
            iy = cap(iy, - 2000, 2000); // TODO dynamic left and right border

            for (let node of this.nodes) node.setBackground(ix, iy);
            modify(ix, iy);

            this.ix = ix;
            this.iy = iy;

            ix = neg_mod(ix, this.scale * GRAPH_BACKGROUND_TILING)
            iy = neg_mod(iy, this.scale * GRAPH_BACKGROUND_TILING)

            this.bg_element.style.left = `${ix - this.scale * 2 * GRAPH_BACKGROUND_TILING}px`;
            this.bg_element.style.top  = `${iy - this.scale * 2 * GRAPH_BACKGROUND_TILING}px`;
        });

        this.element.contextmenu = (event, close) => {
            if (event.target !== this.bg_element) return ;
            
            let summon_x = (event.clientX - this.rel_element.getBoundingClientRect().left ) * this.scale;
            let summon_y = (event.clientY - this.rel_element.getBoundingClientRect().top  ) * this.scale;
            
            let el = new SearchableContextMenu(undefined, MATERIAL_CATEGORY.library.as_ctxmenu_config((node) => {
                let r_node = node.as_node(this, this, summon_x - this.ix, summon_y - this.iy);
                r_node.setBackground(this.ix, this.iy)
                
                this.nodes.push(r_node);
                this._recompute_element();
                
                close();
            }), "Add Node", event.clientX, event.clientY);

            return el;
        };
        document.addEventListener("keydown", (event) => {
            if (event.key != "Delete") return ;

            let to_delete = this.editor.active_node;
            if (to_delete === undefined) return ;

            if (to_delete.element.classList.contains("active"))
                to_delete.destroy();
        })
    }
    serialize () {
        for (let iN = 0; iN < this.nodes.length; iN ++)
            this.nodes[iN].__node_id = iN;

        let result = [];
        for (let iN = 0; iN < this.nodes.length; iN ++)
            result.push(this.nodes[iN].serialize())
        
        return result;
    }
    deserialize (json, library) {
        for (let json_node of json) {
            let library_function = library.get(json_node.library);

            let node = library_function.as_node(this, this, json_node.pos.x, json_node.pos.y);
            library_function.deserialize_properties( node, json_node.parameters );
            this.nodes.push(node);
        }

        this._recompute_element();

        for (let id_node = 0; id_node < json.length; id_node ++) {
            let json_node = json[id_node];

            for (let input_id = 0; input_id < json_node.inputs.length; input_id ++) {
                let parent_data = json_node.inputs[input_id].parent;
                if (parent_data === -1) continue ;

                this.nodes[id_node].inputs[input_id].appendParent(
                    this.nodes[parent_data.node_id].outputs[parent_data.vect_id]    
                );
            }
        }

        setTimeout(() => {
            for (let node of this.nodes)
                for (let inp of node.inputs)
                    inp.computeLine();
        }, 0);
    }
    _render () {
        return this.rel_element;
    }
}

class MNode_Ressource extends Component {
    constructor (parent, graph, name, node_type, color, vect_id, is_output = false) {
        super(parent);

        this.graph     = graph;
        this.is_output = is_output;

        this.node_type = node_type;

        this.name  = name;
        this.color = color;

        // Graph links
        this.parent = undefined;
        this.childs = new Set();

        this.node = undefined;

        this.vect_id = vect_id;

        this._first_render();
    }
    serialize_name () {
        return {
            node_id: this.node.__node_id,
            vect_id: this.vect_id
        }
    }
    serialize () {
        let childs = []
        for (let child of this.childs)
            childs.push(child.serialize_name());
        
        return {
            parent: this.parent ? this.parent.serialize_name() : -1,
            childs
        }
    }
    setNode (node) {
        this.node = node;
    }
    removeChild (child) {
        this.childs.delete(child);
        this.computeLine();
    }
    appendChild (child) {
        this.childs.add(child);
        this.computeLine();
    }
    appendParent (parent) {
        if (parent === undefined) {
            if (this.parent) this.parent.removeChild(this);

            this.parent = undefined;
            this.computeLine();
            return ;
        }

        if (this.is_output
         || parent.node == this.node
         || this.node_type != parent.node_type) return false;
        if (this.parent) this.parent.removeChild(this);

        this.parent = parent;
        this.parent.appendChild(this);
        this.computeLine();
    }
    computeLine () {
        if (this.parent === undefined) {
            this.line.x = 0;
            this.line.y = 0;
            this.line.update_line();

            return ;
        }

        let p0 = this.get_bubble_position();
        let p1 = this.parent.get_bubble_position();

        this.line.x =    p1[0] - p0[0];
        this.line.y = - (p1[1] - p0[1]);
        this.line.update_line();
    }
    clear () {
        for (let child of this.childs) child.appendParent(undefined);
        if (this.parent) this.appendParent(undefined);
    }

    get_bubble_position () {
        return [
            this.bubble                            ?.offsetLeft
          + this.bubble?.offsetParent              ?.offsetLeft
          + this.bubble?.offsetParent?.offsetParent?.offsetLeft,
            this.bubble                            ?.offsetTop
          + this.bubble?.offsetParent              ?.offsetTop
          + this.bubble?.offsetParent?.offsetParent?.offsetTop
        ]
    }

    _first_render () {
        this.line = new MLine(this, 0, 0, this.color);

        this.bubble  = createElement("div", {}, `acenter-h ${this.is_output ? "right" : "left"}-[-20px] rounded-200 w-2 h-2`, [
            createElement("div", {}, "relative w-[0px] h-[0px] acenter", [
                this.line.render()
            ])
        ]);
        this.bubble.style.backgroundColor = this.color;

        this.element = createElement("div", {}, "relative", [
            createElement("div", {}, "select-none text-sm font-300" + (this.is_output ? " text-right" : ""), [
                this.bubble,
                createElement("div", {}, `absolute h-[100%] w-6 ${this.is_output ? "right-[-24px]" : "left-[-24px]"}`, []),
                this.name
            ])
        ]);

        if (!this.is_output) {
            this.element.addEventListener("mouseover", (event) => this.graph.ressource_hover(this));
            this.element.addEventListener("mouseout", (event) => this.graph.ressource_end_hover());
        } else {
            let sx = 0;
            let sy = 0;
            append_drag_listener(this.graph.scala, this.element, (dx, dy, ix, iy) => {
                sx += dx; sy += dy;
                this.line.x = sx; this.line.y = - sy;
                this.line.update_line();
            }, (ix, iy) => {
                sx = 0; sy = 0;
                this.line.x = 0;
                this.line.y = 0;
                this.line.update_line();

                let output = this;
                let input  = this.graph.current_ressource;
                if (!input) return ;
                // TODO add type validation

                input.appendParent(output);
            })
        }

        this.element.addEventListener("contextmenu", (event) => {
            event.preventDefault();

            this.clear();
        })
    }
    _render () { return this.element; }
}
class MNode extends Component {
    constructor (parent, graph, name, x, y, inputs, outputs, parameters) {
        super(parent);

        this.name  = name;
        this.graph = graph;

        this.inputs  = inputs;
        this.outputs = outputs;
        this.params  = parameters;
        for (let input  of this.inputs ) input .setNode(this);
        for (let output of this.outputs) output.setNode(this);

        this.x    = x;
        this.y    = y;
        this.ix   = 0;
        this.iy   = 0;

        this._first_render();
    }

    serialize () {
        if (this.__node_id === undefined) throw '__node_id should be set before serializing';

        return {
            node:    this.__node_id,
            library: this.library_function.serialize(),
            parameters: this.library_function.serialize_properties(this),
            pos: { x: this.x, y: this.y },
            inputs:  this.inputs.map((x) => x.serialize()),
            outputs: this.outputs.map((x) => x.serialize())
        }
    }
    setBackground (ix, iy) {
        this.ix = ix;
        this.iy = iy;

        this._use_delta();
    }
    destroy () {
        for (let input of this.inputs)
            input.clear();
        for (let output of this.outputs)
            output.clear();
        
        this.graph.remove_node(this);
    }
    _first_render () {
        this.element = createElement("div", {}, "forward-grid-node", [
            createElement("div", {}, "forward-grid-title p-2 px-4 text-base font-400 select-none", [ this.name ]),
            createElement("div", {}, "flex p-4 gap-4", [
                createElement("div", {}, "flex flex-col gap-1", [
                    ...(this.inputs.map((x) => x.render()))
                ]),
                createElement("div", {}, "flex-1", []),
                createElement("div", {}, "flex flex-col gap-1", [
                    ...(this.outputs.map((x) => x.render()))
                ])
            ])
        ]);

        append_drag_listener(this.parent.scala, this.element, (dx, dy, ix, iy) => {
            this.x += dx;
            this.y += dy;

            this._use_delta();

            for (let input of this.inputs)
                input.computeLine();
            for (let output of this.outputs)
                for (let child of output.childs)
                    child.computeLine();
        })

        this.element.addEventListener("click", (event) => {
            this.graph.editor.set_properties_node(this);
        })

        this._use_delta();
    }
    _use_delta () {
        this.element.style.left = `${this.ix + this.x}px`;
        this.element.style.top  = `${this.iy + this.y}px`;
    }

    _render () {
        return this.element;
    }
}
