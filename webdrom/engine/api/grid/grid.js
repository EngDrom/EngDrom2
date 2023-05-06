
class GridChunk extends MeshInstance {
    constructor (context, transform, grid, layer, grid_data) {
        super(context, undefined, transform);

        this.grid      = grid;
        this.layer     = layer;
        this.grid_data = grid_data.grid;
        this.x         = grid_data.x;
        this.y         = grid_data.y;

        this.textures = grid.textures;

        this.computeMesh();
    }

    computeMesh () {
        let vertices = [];
        let texCoord = [];
        let indices  = [];

        let dx = 16 * this.x + this.layer.dx;
        let dy = 16 * this.y + this.layer.dy;

        for (let px = 0; px < 16; px ++) {
            for (let py = 0; py < 16; py ++) {
                let type = this.grid_data[py][px];
                if (type === -1) continue;

                vertices.push([ dx + px,     dy + py,     0 ]);
                vertices.push([ dx + px + 1, dy + py,     0 ]);
                vertices.push([ dx + px,     dy + py + 1, 0 ]);
                vertices.push([ dx + px + 1, dy + py + 1, 0 ]);

                indices.push(vertices.length - 4);
                indices.push(vertices.length - 3);
                indices.push(vertices.length - 2);
                indices.push(vertices.length - 3);
                indices.push(vertices.length - 2);
                indices.push(vertices.length - 1);

                let [mu00, mu01, mu10, mu11] = this.grid.atlas.coordinates(type);
                
                texCoord.push(mu00);
                texCoord.push(mu01);
                texCoord.push(mu11);
                texCoord.push(mu10);
            }
        }

        if (vertices.length == 0) return ;

        this.mesh = new Mesh(this.context, [ vertices, texCoord ], indices);
    }

    reset () {
        this.sri = this.transform.as_sri(undefined, undefined);
    }
    render (shader, camera) {
        if (this.mesh === undefined) return ;

        super.render(shader, camera);
    }
    renderRTS () {
        if (this.mesh === undefined) return ;

        super.render(shader, camera);
    }
}

class GridLayer extends MeshInstance {
    constructor (context, transform, grid, config) {
        super (context, undefined, transform);

        this.grid = grid;

        this.textures = grid.textures;

        this.name = config.name;

        this.dx = config.pos.dx;
        this.dy = config.pos.dy;

        this.chunks = config.chunks;
        this.m_chunks = this.chunks.map((x) => {
            return new GridChunk( context, transform, grid, this, x );
        })
    }

    reset () {
        this.sri = this.transform.as_sri(undefined, undefined);
    }
    render (shader, camera) {
        for (let chunk of this.m_chunks)
            chunk.render(shader, camera);
    }
    renderRTS () {
        if (this.mesh === undefined) return ;
    }
}

class GridMesh extends MeshInstance {
    constructor (context, transform, url) {
        super(context, undefined, transform);

        this.layers = [  ];

        fetch( "/api/fs/read/" + url ).then((body) => body.json().then(async (json) => {
            this.atlas = new AtlasTexture( context, json.atlas )
            await this.atlas.wait();

            this.textures = { uTexture: this.atlas };

            for (let layer of json.layers)
                this.layers.push(
                    new GridLayer(context, transform, this, layer)
                );
        }));
    }

    reset () {
        this.sri = this.transform.as_sri(undefined, undefined);
    }
    render (shader, camera) {
        for (let layer of this.layers)
            layer.render(shader, camera);
    }
    renderRTS () {
        if (this.mesh === undefined) return ;
    }
}

