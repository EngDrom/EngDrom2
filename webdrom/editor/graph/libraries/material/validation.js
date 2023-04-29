
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
    isValid (nodes) {
        let N = nodes.length;
        this.roads   = [];
        this.t_roads = [];
        
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
                    return false; // An input cannot be undefined
                
                this.roads  [target.__validation_idx].push(node  .__validation_idx);
                this.t_roads[node  .__validation_idx].push(target.__validation_idx);
            }
        }
        
        for (let i = 0; i < N; i ++)
            if (this.cycle_dfs(i))
                return false; // No cycle is allowed inside the graph
        
        for (let i = 0; i < N; i ++)
            this.visited[i] = false;
        
        this.topological_sort = [];
        for (let i = 0; i < N; i ++)
            this.topological_sort_dfs(i);

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
                return false;
            node.__validation_variant_id = variant_id;
        }

        return true;
    }
}
