

class SavedMesh extends Mesh {
    constructor (context, file) {
        super(context, undefined, undefined);

        this.pending = [];

        fetch ('/api/fs/read/' + file).then((b) => b.json().then((json) => {
            this.indices   = json.indices;
            this.vbos_data = json.vbo;
            this.make(json.vbo, json.indices);

            for (let f of this.pending) f();
            this.pending = undefined;
        }))
    }

    await (f) {
        if (this.indices)
            f();
        else this.pending.push(f);
    }
}

class TextureAtlasMeshInstance extends MeshInstance {
    constructor (context, mesh, transform, atlas) {
        super(context, mesh, transform);
        this.atlas = atlas;
    }

    setCoordinates (coordinates) {
        let [mu00, mu01, mu10, mu11] = this.atlas.coordinates(coordinates, this.texture_mask);
            
        let vbos = [ 
            [ [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0] ],
            [ mu10, mu11, mu01, mu00 ]
        ];
        let indices = [0, 1, 2, 1, 2, 3];

        this.mesh     = new Mesh(this.context, vbos, indices);;
        this.textures = { uTexture: this.atlas }
    }
}
