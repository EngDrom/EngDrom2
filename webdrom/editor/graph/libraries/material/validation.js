
class MaterialGraphValidation extends GraphValidation {
    cycle_dfs (node) {
        if (this.visiting[node]) return true;
        if (this.visited [node]) return false;

        this.visited [node] = true;
        this.visiting[node] = true;

        for (let next of this.roads[node])
            if (this.cycle_dfs(next))
                return true;
        
        this.visiting[node] = false;
        return false;
    }
    topological_sort_dfs (node) {
        if (this.visited[node]) return ;

        for (let prev of this.t_roads[node])
            this.topological_sort_dfs(prev);
        
        if (this.visited[node]) return ;

        this.visited[node] = true;
        this.topological_sort.push(node);
    }
    search_dfs (node, func) {
        if (this.nodes[node].library_function === func) return true;
        if (this.visited[node]) return false;
        this.visited[node] = true;

        for (let prev of this.t_roads[node])
            if (this.search_dfs(prev, func))
                return true;
        
        return false;
    }
    r_visited () {
        for (let i = 0; i < this.visited.length; i ++)
            this.visited[i] = false;
    }
    isValid (nodes) {
        let N = nodes.length;
        this.roads   = [];
        this.t_roads = [];
        this.nodes   = nodes;
        
        this.visited  = [];
        this.visiting = [];
        for (let i = 0; i < N; i ++) {
            this.roads.push([]);
            this.t_roads.push([]);

            this.visited .push(false);
            this.visiting.push(false);
        }
        
        let i = 0;
        for (let node of nodes)
            node.__validation_idx = i ++;
    
        for (let node of nodes) {
            for (let input of node.inputs) {
                let target = input.parent?.node;
                if (target === undefined)
                    return [ false, "All inputs must be linked", undefined ]; // An input cannot be undefined
                
                this.roads  [target.__validation_idx].push(node  .__validation_idx);
                this.t_roads[node  .__validation_idx].push(target.__validation_idx);
            }
        }
        
        for (let i = 0; i < N; i ++)
            if (this.cycle_dfs(i))
                return [ false, "There exists a cycle in the material", undefined ]; // No cycle is allowed inside the graph
        
        for (let i = 0; i < N; i ++)
            this.visited[i] = false;
        
        this.topological_sort = [];
        for (let i = 0; i < N; i ++)
            this.topological_sort_dfs(i);

        let count_fg_in  = 0;
        let count_fg_out = 0;
        let count_vt_in  = 0;
        let count_vt_out = 0;
        let pos_fg_out;
        let pos_vt_out;
        for (let i = 0; i < N; i ++) {
            let node = nodes[i];
            let func = node.library_function;

            if (MATERIAL_CATEGORY.functions.fragment_input  === func) count_fg_in  ++;
            if (MATERIAL_CATEGORY.functions.fragment_output === func) {
                count_fg_out ++;
                pos_fg_out = i;
            }
            if (MATERIAL_CATEGORY.functions.vertex_input  === func) count_vt_in  ++;
            if (MATERIAL_CATEGORY.functions.vertex_output === func) {
                count_vt_out ++;
                pos_vt_out = i;
            }
        }

        if (count_vt_out != 1) return [ false, "Missing output vertex", undefined ];
        if (count_fg_out != 1) return [ false, "Missing output fragment", undefined ];
        if (count_fg_in  != 1) return [ false, "Missing input fragment", undefined ];
        if (count_vt_in  != 1) return [ false, "Missing input vertex", undefined ];

        this.r_visited();
        if (this.search_dfs( pos_fg_out, MATERIAL_CATEGORY.functions.vertex_input ))
            return [ false, "Vertex input cannot have an effect on fragment output", undefined ];
        this.r_visited();
        if (this.search_dfs( pos_vt_out, MATERIAL_CATEGORY.functions.fragment_input ))
            return [ false, "Fragment input cannot have an effect on vertex output", undefined ];

        for (let i = 0; i < N; i ++) {
            let node_id = this.topological_sort[i];

            let node = nodes[node_id];
            let type_array = [];
            for (let input of node.inputs) {
                let target_res  = input.parent;
                if (target_res === undefined) return false;
                let target_node = target_res.node;
            
                let type_id = target_node.outputs.indexOf(target_res);
                let variant = target_node.library_function.out_space.vector_spaces[
                    target_node.__validation_variant_id
                ];

                type_array.push(variant.types[type_id]);
            }

            let variant_id   = -1;
            let proposal_vid = 0;
            for (let vector_space of node.library_function.inp_space.vector_spaces) {
                let found = true;
                for (let iT = 0; iT < vector_space.types.length; iT ++) {
                    if (vector_space.types[iT] != type_array[iT]) {
                        found = false;
                        break ;
                    }
                }

                if (found) variant_id = proposal_vid;
                proposal_vid ++;
            }

            if (variant_id == -1)
                return [ false, "Type validation could not be performed on node " + node_id, undefined ];
            node.__validation_variant_id = variant_id;
        }

        return [ true, "Validation OK", {
            pos_fg_out,
            pos_vt_out,
            roads: this.roads,
            t_roads: this.t_roads
        } ];
    }
}
