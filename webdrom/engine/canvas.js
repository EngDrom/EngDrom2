
class WebGLCanvas extends Component {
    constructor (parent, engine) {
        super(parent);

        this._first_render();
        this.engine = engine;
    }

    _first_render () {
        this.canvas = createElement("canvas", { onclick: (ev) => this.onClick(ev) }, "w-full h-full", []);
        this.keys   = {}

        document.addEventListener("keyup", (event) => {
            if (!this.keys[event.key]) return ;
            this.keys[event.key] = undefined;
            
            this.pc.onkeyend(this.camera, event.key, this.keys);
        })
        document.addEventListener("keydown", (event) => {
            if (!this.canvas.classList.contains("active")
             || !this.canvas.checkVisibility()) return ;
            if (this.keys[event.key]) return ;

            this.keys[event.key] = true;
            this.pc.onkeystart(this.camera, event.key, this.keys);
        })
        append_drag_listener(new Scalar(1), this.canvas, (dx, dy, ix, iy) => {
            this.pc.ondrag(this.camera, dx, dy);
        })

        this.component = createElement("div", {}, "w-full", [
            createElement("div", {}, "w-full h-full overflow-none", [
                this.canvas
            ])
        ]);

        this.make_gl();

        this.observer = new ResizeObserver( (event) => this.onResize(event) )
        this.observer.observe(this.canvas);
    }
    make_projection () {
        const fov = 45 * Math.PI / 180;
        const asp = this.canvas.clientWidth / this.canvas.clientHeight;
        const zNr = 0.1;
        const zFr = 100.0;
        
        this.web_gl.projection = new PerspectiveTransform(fov, asp, zNr, zFr);
    }
    make_gl () {
        this.web_gl = new ExtendedWebGLContext(this.canvas.getContext("webgl"))
        this.make_projection();

        this.web_gl.default_shader = this.web_gl.loadProgram(`attribute vec3 aVertexPosition;
        attribute vec2 aTextCoord;
        uniform mat4 mModel;
        uniform mat4 mProj;
        uniform mat4 mCamera;
        varying lowp vec2 textCoord;
        
        void main(void) {
          gl_Position = mProj * mCamera * mModel * vec4(aVertexPosition, 1.0);
          textCoord = aTextCoord;
        }`, `varying lowp vec2 textCoord;
        uniform sampler2D uTexture;
        
        void main(void) {
            gl_FragColor = texture2D(uTexture, textCoord);
            if (gl_FragColor.w <= 0.1) discard;
          }`);
        this.web_gl.default_shader.addTarget("aVertexPosition", 0);
        this.web_gl.default_shader.addTarget("aTextCoord", 1);
        this.shader = this.web_gl.loadProgram(`attribute vec3 aVertexPosition;
        attribute vec2 aTextCoord;
        uniform mat4 mModel;
        uniform mat4 mProj;
        uniform mat4 mCamera;
        varying lowp vec2 textCoord;
        
        void main(void) {
          gl_Position = mProj * mCamera * mModel * vec4(aVertexPosition, 1.0);
          textCoord = aTextCoord;
        }`, `varying lowp vec2 textCoord;
        uniform sampler2D text;
        uniform sampler2D text2;
        
        void main(void) {
            gl_FragColor = texture2D(text, textCoord) * texture2D(text2, textCoord);
          }`);
        this.shader.addTarget("aVertexPosition", 0);
        this.shader.addTarget("aTextCoord", 1);

        const mu_z = -7;

        this.mesh = new SavedMesh(this.web_gl, "index.mesh");
        this.cube1 = new MeshInstance(this.web_gl, this.mesh, new Transform(8, 7, -7, 0, 0, 0, 0.5, 0.5, 1))
        this.world = new RiceWorld();
        this.world.append( new PRectBox(-100, - 3, -100, 1000, 1, 1000) )
        this.cube1.use_collisions(this.world);
        this.cube1.reset();
        this.cube1.sri.position.acc.y = - 5;

        this.grid = new GridMesh( this.web_gl, new Transform(0, 0, -7, 0, 0, 0, 1, 1, 1), "index.grid" );
        this.world.append( new Grid_HitBox(this.grid) );

        this.camera = new Camera();

        this.pc = new PlanePlayerController();
    }
    clear () {
        this.web_gl.clearColor(0.0, 0.0, 0.0, 1.0)
        this.web_gl.clearDepth(1.0)
        this.web_gl.enable(this.web_gl.DEPTH_TEST);
        this.web_gl.depthFunc(this.web_gl.LEQUAL);
        this.web_gl.clear(this.web_gl.COLOR_BUFFER_BIT | this.web_gl.DEPTH_BUFFER_BIT);
    }
    drawCallback (delta_interval) {
        this._runComputations();

        this.pc.ontick(this.camera, delta_interval / 1000.0)

        this.clear();
        this.grid .render(this.web_gl.default_shader, this.camera);
        this.cube1.render(this.shader, this.camera);
    }

    _runComputations () {
        if (this.pixel_computations === undefined) return ;

        let buffer = this._make_tracer();

        for (let [ pa, c ] of this.pixel_computations)
            this._runPixelComputations(buffer, pa, c);
        
        this.pixel_computations = undefined;
    }
    _make_tracer () {
        this.raytracer = new RayTracer();
        
        this.clear();
        this.cube1.renderRTS(this.raytracer, this.camera);

        return this.getBuffer();
    }
    _runPixelComputations (buffer, pixel_array, callback) {
        let res = [];
        for (let pixel of pixel_array) {
            let pixel_color = buffer(pixel[1], pixel[0]);
            let mesh_instance = this.raytracer.getMeshInstance(pixel_color)
            
            res.push(mesh_instance);
        }

        callback(res);

        return res;
    }
    runPixelComputations (pixel_array, callback) {
        if (!this.hasPixelComputations()) this.pixel_computations = [];

        this.pixel_computations.push([pixel_array, callback])
    }
    hasPixelComputations () {
        return this.pixel_computations !== undefined;
    }

    getBuffer (use_alpha = false) {
        let coef_alpha = use_alpha ? 1 : 0;

        const pixels = new Uint8Array(
            this.web_gl.drawingBufferWidth * this.web_gl.drawingBufferHeight * 4
        );
        
        this.web_gl.readPixels(
            0,
            0,
            this.web_gl.drawingBufferWidth,
            this.web_gl.drawingBufferHeight,
            this.web_gl.RGBA,
            this.web_gl.UNSIGNED_BYTE,
            pixels
        );
        
        let width  = this.web_gl.drawingBufferWidth;
        let height = this.web_gl.drawingBufferHeight;
        let table = (x, y) => {
            x = height - 1 - x;
            let start = 4 * ( width * x + y );

            let res = pixels[start] + pixels[start + 1] * 256
            + pixels[start + 2] * 256 * 256
            + (pixels[start + 3] * 256 * 256 * 256) * coef_alpha;
            return res;
        };

        return table;
    }
    onClick (event) {
        this.runPixelComputations([ [ event.layerX, event.layerY ] ], (mesh_array) => {
            let mesh_instance = mesh_array[0];    
        
            let c_event = new CustomEvent( "WebDrom.MeshInstance.Clicked", {} );
            c_event.meshInstance = mesh_instance;

            document.dispatchEvent(c_event);
        });
    }

    onResize (event_array) {
        for (let event of event_array) {
            if (event.target !== this.canvas) continue ;

            this.canvas.setAttribute( "width",  event.contentRect.width  );
            this.canvas.setAttribute( "height", event.contentRect.height );

            this.make_projection();
            
            this.web_gl.viewport( 0, 0, event.contentRect.width, event.contentRect.height );
            this.engine.drawCallback();
        }
    }
    _render () {
        return this.component;
    }
}
