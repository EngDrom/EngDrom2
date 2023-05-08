
const MATERIAL_ARRAY = {};

class Material {
    constructor (context, file) {
        if (MATERIAL_ARRAY[file]) return MATERIAL_ARRAY[file];
        MATERIAL_ARRAY[file] = this;

        this.context = context;
        this.graph   = undefined;

        this.file = file;
        
        fetch( '/api/fs/read/' + file ).then((b) => b.json().then((json) => {
            this.graph_data = json;
            this.graph      = new MGraph(undefined, undefined);
            this.graph.deserialize(this.graph_data, MATERIAL_CATEGORY.library);

            this.update(this.graph.nodes);
        }))
    }

    update (nodes) {
        let validator = new MaterialGraphValidation ();
        let compiler  = new MaterialGraphCompilation();

        let [status, options, context] = validator.isValid( nodes );
        
        if (!status) {
            this.shader = undefined;
            return ;
        }

        let [vertex, fragment] = compiler.compile( nodes, context );

        this.shader = this.context.loadProgram(vertex, fragment);
        this.shader.addTarget("vertexPosition", 0);
        this.shader.addTarget("textureCoordinates", 1);
    }
}
