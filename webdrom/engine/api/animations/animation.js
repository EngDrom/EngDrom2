
class Animation {
    constructor (file, target) {
        this.file   = file;
        this.target = target;

        fetch( '/api/fs/read/' + file ).then((b) => b.json().then((json) => {
            this.graph_data = json;
            this.graph      = new MGraph(undefined, undefined);
            this.graph.deserialize(this.graph_data, ANIMATION_CATEGORY.library);

            this.update(this.graph.nodes);
        }))
    }

    advance () {
        if (this.node === undefined) return ;

        let library = this.node.library_function;

        if (library.can_do && (!library.can_do(this, this.node))) return ;

        if (library.action) library.action(this, this.node);

        this.node = library.next(this, this.node);

        if (this.node && this.node.library_function?.start) {
            this.node.library_function.start(this, this.node);
        }

        this.advance();
    }
    update (nodes) {
        this.node = undefined;
        for (let node of nodes) {
            if (node.library_function !== ANIMATION_CATEGORY.functions.begin_animation)
                continue ;
            
            this.node = node;
        }

        this.advance();
    }
}
