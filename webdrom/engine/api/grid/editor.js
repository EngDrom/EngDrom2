
function create_grid_editor_shader (context) {
    context.grid_editor_shader = context.loadProgram(`attribute vec3 aVertexPosition;
    uniform mat4 mModel;
    uniform mat4 mProj;
    uniform mat4 mCamera;
    varying lowp vec2 textCoord;
    precision highp float;
    
    void main(void) {
      gl_Position = mProj * mModel * vec4(aVertexPosition, 1.0);
      textCoord = (mCamera * mModel * vec4(aVertexPosition, 1.0)).xy;
    }`, `varying lowp vec2 textCoord;
    precision highp float;
    
    void main(void) {
        float x = (textCoord.x - floor(textCoord.x)) * 24.0;
        float y = (textCoord.y - floor(textCoord.y)) * 24.0;
        
        if (x > 1.0 && y > 1.0) discard;

        gl_FragColor = vec4(0.22265625, 0.22265625, 0.22265625, 1);
      }`)
    context.grid_editor_shader.addTarget("aVertexPosition", 0);
}

class GridEditor {
    constructor (player_controller, grid, layer) {
        this.player_controller = player_controller;

        this.grid  = grid;
        this.layer = layer;

        this.context = player_controller.get_context();

        if (!this.context.grid_editor_shader)
            create_grid_editor_shader(this.context);
        
        this.create_mesh();
    }
    create_mesh () {
        let vbos = [ 
            [ [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0] ]
        ];
        let indices = [0, 1, 2, 1, 2, 3];

        this.mesh = new Mesh( this.context, vbos, indices );

        this.instance = new MeshInstance(
            this.context, this.mesh, new Transform(0, 0, -7, 0, 0, 0, 1000, 1000, 1)
        );
    }

    render (camera) {
        this.instance.render(this.context.grid_editor_shader, camera, true);
    }
}

