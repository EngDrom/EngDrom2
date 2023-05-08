
const MATERIAL_ARRAY = {};

class Material {
    constructor (context, file) {
        if (MATERIAL_ARRAY[file]) return MATERIAL_ARRAY[file];
        MATERIAL_ARRAY[file] = this;

        this.context = context;
        this.graph   = undefined;
        
        fetch( '/api/fs/read/' + file ).then((b) => b.json().then((json) => {
            this.update(json);
        }))
    }

    update (data) {
        this.graph_data = data;
        this.graph      = new MGraph(undefined, data);

        let validator = new MaterialGraphValidation ();
        let compiler  = new MaterialGraphCompilation();

        let [status, options, context] = validator.isValid( this.graph.nodes );
        
        if (!status) {
            this.shader = undefined;
            return ;
        }

        let [vertex, fragment] = compiler.compile( this.graph.nodes, context );

        this.shader = this.context.loadProgram(vertex, fragment);
        this.shader.addTarget("vertexPosition", 0);
        this.shader.addTarget("textureCoordinates", 1);
    }
}
