
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
    isValid (nodes) {
        let N = nodes.length;
        this.roads = [];
        
        this.visited  = [];
        this.visiting = [];
        for (let i = 0; i < N; i ++) {
            this.roads.push([]);

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
                
                this.roads[target.__validation_idx].push(node.__validation_idx);
            }
        }
        console.log(this.roads)
        for (let i = 0; i < N; i ++)
            if (this.cycle_dfs(i))
                return false; // No cycle is allowed inside the graph
        
        return true;
    }
}
