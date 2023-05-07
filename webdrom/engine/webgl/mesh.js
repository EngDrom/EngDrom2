
const RAYTRACER_SHADER = [ `attribute vec3 aVertexPosition;
uniform vec3 uniqueColor;
uniform mat4 mModel;
uniform mat4 mProj;
uniform mat4 mCamera;
varying lowp vec4 vColor;

void main(void) {
  gl_Position = mProj * mCamera * mModel * vec4(aVertexPosition, 1.0);
  vColor = vec4(uniqueColor, 1.0);
}`, `varying lowp vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
  }` ]

function create_raytracer_shader (context) {
    if (!(context.raytracer)) {
        context.raytracer = context.loadProgram(
            ...RAYTRACER_SHADER);
        context.raytracer.addTarget("aVertexPosition", 0);
    }
}

class Mesh {
    constructor (context, vao_data, ebo_data) {
        this.context = context;

        this.make(vao_data, ebo_data);
    }
    make (vao_data, ebo_data) {
        if (vao_data === undefined || ebo_data === undefined) return ;
        this.vao     = new VAO(this.context, vao_data)

        let pos_vbo = vao_data[0];
        let box     = [ 1e18, 1e18, 1e18, -1e18, -1e18, -1e18 ];
        for (let pos of pos_vbo) {
            box[0] = Math.min(box[0], pos[0]);
            box[1] = Math.min(box[1], pos[1]);
            box[2] = Math.min(box[2], pos[2]);
            box[3] = Math.max(box[3], pos[0]);
            box[4] = Math.max(box[4], pos[1]);
            box[5] = Math.max(box[5], pos[2]);
        }

        this.box = box;

        this.ebo = new EBO(this.context, ebo_data)
    }

    render (shader) {
        if (this.vao === undefined) return ;
        shader.render(this.vao, this.ebo);
    }
    renderRTS (unique_id = 1) {
        if (this.vao === undefined) return ;
        create_raytracer_shader(this.context);
        
        let r = unique_id % 256;
        let g = ((unique_id - r) / 256) % 256;
        let b = ((unique_id - r - 256 * g) / 256 / 256) % 256;
        
        this.context.raytracer.use();
        this.context.raytracer.uniqueColor = new Vec3(r / 255.0, g / 255.0, b / 255.0);
        this.context.raytracer.render(this.vao, this.ebo);
    }
};

class MeshInstance {
    constructor (context, mesh, transform) {
        this.context = context;
        this.mesh    = mesh;

        this.textures = { text: new Texture(context, "preview.png"), text2: new Texture(context, "characters.png") };

        this.transform = transform;
        this.sri       = undefined;
        this.reset();
    }
    reset () {
        if (this.mesh instanceof SavedMesh) {
            this.sri = this.transform.as_sri(undefined, undefined);
            this.sri_await = true;
            this.mesh.await( () => this._reset() );
        } else this._reset();
    }
    _reset () {
        let old  = this.sri;
        this.sri = this.transform.as_sri(this.world, this.mesh?.box);

        if (this.sri_await) {
            this.sri.position = old.position;
            this.sri.rotation = old.rotation;
            this.sri.scale    = old.scale;

            this.sri_await = false;
        }
    }
    use_collisions (world) {
        this.world = world;
    }

    render (shader, camera) {
        shader.use();
        shader.prerender();
        shader.mModel  = this.sri.as_transform();
        shader.mProj   = this.context.projection;
        shader.mCamera = camera.transform();

        for (let texture_loc in this.textures)
            shader[texture_loc] = this.textures[texture_loc];

        this.mesh.render(shader);
    }
    renderRTS (raytracer, camera) {
        create_raytracer_shader(this.context);

        this.context.raytracer.use();
        this.context.raytracer.prerender();
        this.context.raytracer.mModel  = this.sri.as_transform();
        this.context.raytracer.mProj   = this.context.projection;
        this.context.raytracer.mCamera = camera.transform();

        this.mesh.renderRTS(raytracer.append( this ));
    }
};
