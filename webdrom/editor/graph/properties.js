
class Parameter {
    constructor (name) { this.name = name; }

    create (parent, node) {
        throw 'Parameter.create is an abstract function'
    }
    serialize (node) { throw 'Parameter.serialize is an abstract function' }
    deserialize (node, property) { throw 'Parameter.serialize is an abstract function' }
}

class VecNParameter extends Parameter {
    constructor (name, target_array, dimension) {
        super(name);

        this.tar = target_array;
        this.dim = dimension;
    }

    create (parent, node) {
        let input_manager = new VecNInput(parent, (...values) => {
            for (let i = 0; i < this.dim; i ++)
                node[this.tar[i]] = values[i];
        }, this.tar.map((name) => 0));

        input_manager.setValue(...(this.tar.map((x) => node[x] ?? 0)));

        return input_manager.render();
    }
    serialize (node) {
        let properties = {}
        for (let i = 0; i < this.dim; i ++)
            properties[this.tar[i]] = node[this.tar[i]]
        
        return properties
    }
    deserialize (node, properties) {
        for (let i = 0; i < this.dim; i ++)
            node[this.tar[i]] = properties[this.tar[i]] ? properties[this.tar[i]] : 0;
    }
};


class NodePropertiesComponent extends Component {
    constructor (parent) {
        super(parent);

        this._first_render();
    }

    set_target (node) {
        this.node = node;
        
        while (this.element.childNodes.length !== 0) {
            this.element.removeChild(this.element.childNodes[0]);
        }
        
        if (this.node) {
            for (let param of this.node.params) {
                this.element.appendChild(createElement("div", {}, "px-4 text-lg font-200 pt-2", [ param.name ]))
                this.element.appendChild(param.create(this, this.node));
            }
        }
    }

    _first_render () {
        this.element = createElement("div", {}, "px-4", [
            
        ]);
    }
    _render () { return this.element; }
}
