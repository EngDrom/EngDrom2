
class MaterialGraphCompilation extends GraphCompilation {
    _make (node_id, context) {
        if (this.visited[node_id]) return;
        this.visited[node_id] = true;

        for (let prev_id of this.t_roads[node_id])
            this._make(prev_id, context);
        
        let node = this.nodes[node_id];

        let inputs = node.inputs.map((x) => x.parent.__compiler_variable)
        
        if (node.library_function.uniform) {
            let uniform_name = node.uniform_name ?? "uni0";
            
            for (let output of node.outputs)
                output.__compiler_variable = uniform_name
            
            let type = node.library_function.out_space.vector_spaces[node.__validation_variant_id].types[0];
            context.uniforms.push({ type: type.name, name: uniform_name });
        } else if (node.library_function.shortcuts) {
            for (let iS = 0; iS < node.library_function.shortcuts.length; iS ++) {
                let variable = node.library_function.shortcuts[iS](inputs);
                
                node.outputs[iS].__compiler_variable = variable;
            }
        } else if (node.library_function.compile) {
            for (let iL = 0; iL < node.library_function.compile.length; iL ++) {
                let _var = "var" + (context.var_count ++);
                let type = node.library_function.out_space.vector_spaces[node.__validation_variant_id].types[iL];
                
                let line = node.library_function.compile[iL](type?.name, _var, node, inputs)

                context.result.push(line);
                if (iL < node.outputs.length)
                    node.outputs[iL].__compiler_variable = _var;
            }
        } else if (node.library_function.in_loc) {
            for (let iL = 0; iL < node.library_function.in_loc.length; iL ++) {
                node.outputs[iL].__compiler_variable
                 = node.library_function.in_loc[iL];
            }
        }
    }
    make (node_id) {
        let ctx = {
            result: [],
            var_count: 0,
            uniforms: []
        };

        this.visited = {}
        this._make(node_id, ctx)

        return ctx;
    }

    render_vertex (context) {
        const TEMPLATE = [
            `attribute vec3 vertexPosition;`,
            `attribute vec2 textureCoordinates;`,
            `varying lowp vec2 out_textCoord;`,
            `precision highp float;`
        ]

        for (let uniform_data of context.uniforms)
            TEMPLATE.push( `uniform ${uniform_data.type} ${uniform_data.name};` )
        
        TEMPLATE.push("void main(void) {")
        for (let line of context.result)
            TEMPLATE.push("\t" + line);
        TEMPLATE.push("}")

        return TEMPLATE.join("\n")
    }
    render_fragment (context) {
        const TEMPLATE = [ 
            `varying lowp vec2 out_textCoord;`,
            `precision highp float;`
        ]
        for (let uniform_data of context.uniforms)
            TEMPLATE.push( `uniform ${uniform_data.type} ${uniform_data.name};` )
        TEMPLATE.push("void main(void) {")
        for (let line of context.result)
            TEMPLATE.push("\t" + line);
        TEMPLATE.push("}")
    
        return TEMPLATE.join("\n")
    }
    compile (nodes, context) {
        this.roads   = context.roads;
        this.t_roads = context.t_roads;
        this.nodes   = nodes;
        
        let context_fg = this.make(context.pos_fg_out)
        let context_vt = this.make(context.pos_vt_out)

        console.log(this.render_vertex(context_vt))
        console.log(this.render_fragment(context_fg))
    }
}
