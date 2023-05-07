
class Level {
    constructor (context, path) {
        this.context   = context;
        this.instances = [];
        this.scripts   = [];

        this.world = new RiceWorld();

        fetch ('/api/fs/read/' + path).then((b) => b.json().then((json) => {
            this.scripts = json.scripts;
            // TODO use scripts

            for (let mesh of json.instances) {
                let inst = this.create_mesh(mesh);

                if (inst === undefined) {
                    console.log("[WARNING] Mesh \"" + mesh.name + "\" could not be loaded")
                    continue ;
                }

                this.instances.push(inst);
            }
            
            this.context.engine.render_level_tree();
        }))
    }

    extract_transform (json) {
        return new Transform(
            json.position.x, json.position.y, json.position.z,
            json.rotation.x, json.rotation.y, json.rotation.z,
            json.scale   .x, json.scale   .y, json.scale   .z,
        );
    }

    create_mesh (json) {
        if (json.type === "grid") return this.create_grid (json);
        if (json.type === "atlas.mesh")
            return this.create_atlas_mesh(json);
        if (json.type === "mesh")
            return this.create_simple_mesh(json);
    }
    create_grid (json) {
        let transform = new Transform(0, 0, json.pos_z, 0, 0, 0, 1, 1, 1);

        let grid = new GridMesh( 
            this.context, 
            transform, 
            json.target
        );
        this.world.append( new Grid_HitBox(grid) );

        return [ json.name, "grid", grid, {  } ];
    }
    create_simple_mesh (json) {
        let transform = this.extract_transform(json);

        let mesh = new SavedMesh(this.context, json.mesh);
        let mat  = new Material (this.context, json.material);

        let inst = new MeshInstance( this.context, mesh, transform );

        inst.textures = {};

        return [ json.name, "mesh", inst, { material: mat } ];
    }
    create_atlas_mesh (json) {
        let transform = this.extract_transform(json);
        let instance  = new MeshInstance(this.context, undefined, transform);
        let atlas     = new AtlasTexture(this.context, json.atlas);

        atlas.wait().then(() => {
            if (json.texture_mask)
                instance.texture_mask = json.texture_mask;

            let [mu00, mu01, mu10, mu11] = atlas.coordinates(json.coordinates, json.texture_mask);
            
            let vbos = [ 
                [ [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0] ],
                [ mu10, mu11, mu01, mu00 ]
            ];
            let indices = [0, 1, 2, 1, 2, 3];

            instance.mesh     = new Mesh(this.context, vbos, indices);;
            instance.textures = { uTexture: atlas }
        });

        return [ json.name, "atlas.mesh", instance, {  } ];
    }

    render (default_shader, camera) {
        for (let [ name, type, instance, options ] of this.instances) {
            if (options.material && options.material.shader) {
                instance.render(options.material.shader, camera);
            } else instance.render(default_shader, camera);
        }
    }
}
