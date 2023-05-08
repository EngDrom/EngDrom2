
class Level {
    constructor (context, path) {
        this.context   = context;
        this.instances = [];
        this.scripts   = [];

        this.animations = [];

        this.drom_scripts   = [];
        this.engdrom_module = new EngDromModule();

        this.world = new RiceWorld();

        this.gravity = 0;

        this.player_controllers = {};

        this.file_path = path;

        fetch ('/api/fs/read/' + path).then((b) => b.json().then((json) => {
            // TODO use scripts
            this.scripts = json.scripts;
            this.gravity = json.gravity;

            this.drom_scripts = this.scripts.map((file) => new Script(context, file));

            this.controllers_json = json.controllers;

            for (let controller of json.controllers) {
                let cc = undefined;
                if (controller.type === "plane") cc = new PlanePlayerController( controller.override, controller.sx, controller.sy );
            
                for (let mode of controller.modes)
                    this.player_controllers[mode] = cc;
            }

            for (let mesh of json.instances) {
                let inst = this.create_mesh(mesh);

                if (inst === undefined) {
                    console.log("[WARNING] Mesh \"" + mesh.name + "\" could not be loaded")
                    continue ;
                }

                if (mesh.use_gravity) {
                    inst[3].use_gravity = true;
                    inst[2].gravity = this.gravity;
                }
                if (mesh.use_collisions) {
                    inst[2].use_collisions(this.world);
                    inst[3].use_collisions = true;
                }
                if (mesh.exempt_integration)
                    inst[3].exempt_integration = true;
                if (mesh.attach) {
                    for (let mode of mesh.attach)
                        this.player_controllers[mode] = new AttachedPlayerController( 
                            this.player_controllers[mode], inst[2]
                        );
                    inst[3].attach = mesh.attach
                }
                if (mesh.animation) {
                    this.animations.push(new Animation( mesh.animation, inst [2] ));
                    inst[3].animation = mesh.animation
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

    serialize () {
        let instances = [];

        for (let [ name, type, instance, options ] of this.instances) {
            let instance_json = {
                type,
                name
            };

            if (type !== "grid") {
                let transform = instance.transform
                instance_json.position = { x: transform. __x, y: transform. __y, z: transform. __z }
                instance_json.rotation = { x: transform.__rx, y: transform.__ry, z: transform.__rz }
                instance_json.scale    = { x: transform.__sx, y: transform.__sy, z: transform.__sz }
            }

            if (options.exempt_integration)
                instance_json.exempt_integration = true;
            if (options.use_collisions)
                instance_json.use_collisions = true;
            if (options.use_gravity)
                instance_json.use_gravity = true;
            if (options.attach)
                instance_json.attach = options.attach
            if (options.animation)
                instance_json.animation = options.animation
            
            if (type === "atlas.mesh") {
                instance_json.atlas = options.atlas
                instance_json.coordinates = options.coordinates
                if (instance.texture_mask)
                    instance_json.texture_mask = instance.texture_mask
            }
            if (type === "grid") {
                instance.save_file();
                
                let transform = instance.transform
                instance_json.pos_z  = transform.__z;
                instance_json.target = options.path;
            }
            if (type === "mesh") {
                instance_json.mesh = options.mesh_path;
                instance_json.material = options.mat_path;
                instance_json.textures = {}
                instance_json.properties = {}
            }

            instances.push(instance_json)
        }

        return {
            gravity: this.gravity,
            scripts: this.scripts,
            controllers: this.controllers_json,
            instances: instances
        }
    }
    save_file () {
        let json = this.serialize();

        let text = JSON.stringify(json, null, 2)

        fetch("/api/fs/save/"+this.file_path, {
            method: 'PUT',
            headers: {
              'Content-length' : text.length
            },
            body: text
          }).then((body) => {
            if (body.status === 201 || body.status === 200) return ;
            this.context.engine.project.alert_manager.addAlert([ "danger", "Could not save file, Status code " + body.status ])
          });
    }

    onbegin () {
        this.engdrom_module.reset();
        
        for (let script of this.drom_scripts)
            script.execute({ engdrom: this.engdrom_module })
        
        this.engdrom_module.runload();
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

        return [ json.name, "grid", grid, { path: json.target } ];
    }
    create_simple_mesh (json) {
        let transform = this.extract_transform(json);

        let mesh = new SavedMesh(this.context, json.mesh);
        let mat  = new Material (this.context, json.material);

        let inst = new MeshInstance( this.context, mesh, transform );

        inst.textures = {};

        return [ json.name, "mesh", inst, { material: mat, mesh_path: json.mesh, mat_path: json.material } ];
    }
    create_atlas_mesh (json) {
        let transform = this.extract_transform(json);
        let atlas     = new AtlasTexture(this.context, json.atlas);
        let instance  = new TextureAtlasMeshInstance(this.context, undefined, transform, atlas);
        let options   = { atlas: json.atlas }

        atlas.wait().then(() => {
            if (json.texture_mask)
                instance.texture_mask = json.texture_mask;
            options.coordinates = json.coordinates

            instance.setCoordinates(json.coordinates);
            instance.reset();
        });

        return [ json.name, "atlas.mesh", instance, options ];
    }

    tick (delta_t) {
        for (let [ name, type, instance, options ] of this.instances)
            if (!options.exempt_integration)
                instance.sri.integrate(delta_t);
        
        for (let animation of this.animations)
            animation.advance();
        this.engdrom_module.runframe(this.context.engine.canvas.camera);
    }

    render (default_shader, camera) {
        for (let [ name, type, instance, options ] of this.instances) {
            if (options.material && options.material.shader) {
                instance.render(options.material.shader, camera);
            } else instance.render(default_shader, camera);
        }
    }
    renderRTS (raytracer, camera) {
        for (let [ name, type, instance, options ] of this.instances)
            instance.renderRTS(raytracer, camera);
    }
}
