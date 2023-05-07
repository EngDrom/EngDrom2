
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
        }))
    }

    create_mesh (json) {
        if (json.type === "grid") return this.create_grid(json);
    }
    create_grid (json) {
        let transform = new Transform(0, 0, json.pos_z, 0, 0, 0, 1, 1, 1);

        let grid = new GridMesh( 
            this.context, 
            transform, 
            json.target
        );
        this.world.append( new Grid_HitBox(grid) );

        return [ json.name, "grid", grid ];
    }

    render (default_shader, camera) {
        for (let [ name, type, instance ] of this.instances)
            instance.render(default_shader, camera);
    }
}
