
/**
 * MGraph_Library is an object containing potential nodes of an MGraph
 */

class MGraph_Type {
    constructor (name, color) {
        this.name  = name;
        this.color = color;
    }

    as_vector_space () {
        return new MGraph_VectorSpace( [ this ]);
    }
    as_variant_vector_space (name) {
        return new MGraph_VariantVectorSpace(
            [ name ],
            [ this.as_vector_space() ]
        )
    }
};
class MGraph_VectorSpace {
    constructor (types) {
        this.types = types;

        for (let type of this.types)
            if (!(type instanceof MGraph_Type))
                throw '[ImproperlyConfigured] VectorSpace type is invalid';
    }

    validate (types) {
        if (types.length != this.types.length) return false;

        for (let idx = 0; idx < types.length; idx ++)
            if (types[idx] !== this.types[idx])
                return false;
        
        return true;
    }
}
class MGraph_VariantVectorSpace {
    constructor (names, vector_spaces) {
        let invariant_length = names.length;

        for (let vector_space of vector_spaces)
            if (vector_space.types.length !== invariant_length)
                throw '[ImproperlyConfigured] VariantVectorSpace has incoherent vectorspace sizes'
        
        let colors = []
        for (let vector_space of vector_spaces) {
            for (let iType = 0; iType < invariant_length; iType ++) {
                if (iType >= colors.length)
                    colors.push(vector_space.types[iType].color);
                
                if (vector_space.types[iType].color != colors[iType])
                    throw '[ImproperlyConfigured] Inconsistent color array for VectorSpace';
            }
        }

        this.colors = colors;
        this.names  = names;

        this.vector_spaces = vector_spaces;
    }

    validate (types) {
        for (let vector_space of this.vector_spaces)
            if (vector_space.validate(types))
                return true;
        
        return false;
    }
    as_ressource_array (parent, graph, is_output) {
        let result = [];
        
        for (let idx = 0; idx < this.names.length; idx ++)
            result.push( new MNode_Ressource( parent, graph, this.names[idx], this.colors[idx], this.colors[idx], idx, is_output ) );
        
        return result;
    }
}
class MGraph_Function {
    constructor (name, input_space, output_space) {
        this.name      = name;
        this.inp_space = input_space;
        this.out_space = output_space;
        this.par_space = []
    }
    modify (name, value) {
        this[name] = value;
        return this;
    }
    add_parameter (parameter) {
        this.par_space.push(parameter);

        return this;
    }
    serialize () {
        return this.name;
    }
    serialize_properties (node) {
        let properties = [];
        for (let param of this.par_space)
            properties.push(param.serialize(node))

        return properties;
    }
    deserialize_properties(node, properties) {
        if (properties === undefined) return ;

        for (let iP = 0; iP < this.par_space.length; iP ++)
            this.par_space[iP].deserialize(node, properties[iP]);
    }

    as_node (parent, graph, x, y) {
        let input  = this.inp_space.as_ressource_array(parent, graph, false);
        let output = this.out_space.as_ressource_array(parent, graph, true);

        let node = new MNode(parent, graph, this.name, x, y, input, output, this.par_space);
        node.library_function = this;

        return node;
    }
    as_ctxmenu_config (callback) {
        return {
            "type": "action",
            "name": this.name,
            "action": () => callback(this)
        }
    }
};

class MGraph_Category {
    constructor (name, sub_categories, functions) {
        this.name           = name;
        this.sub_categories = sub_categories;
        this.functions      = functions;
    }
    get (name) {
        for (let func of this.functions)
            if (name === func.name)
                return func;
        
        for (let cat of this.sub_categories) {
            let res = cat.get(name);
            if (res)
                return res;
        }

        return undefined;
    }
    as_ctxmenu_config (callback) {
        return {
            "type": "category",
            "name": this.name,
            "childs": [
                ...(this.sub_categories.map((x) => x.as_ctxmenu_config(callback))),
                ...(this.functions     .map((x) => x.as_ctxmenu_config(callback)))
            ]
        }
    }
}
class MGraph_Library {
    constructor (root_category, update_function) {
        this.category = root_category;

        this.update_function = update_function
    }
    update (mgraph) {
        this.update_function(mgraph);
    }
    as_ctxmenu_config (callback) {
        return this.category.as_ctxmenu_config(callback).childs;
    }
    get (name) {
        return this.category.get(name);
    }
}
