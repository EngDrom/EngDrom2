
class GridChunk_HitBox extends HitBox {
    constructor (chunk) {
        super();

        this.chunk = chunk;

        this.dx = 16 * chunk.x + chunk.layer.dx;
        this.dy = 16 * chunk.y + chunk.layer.dy;

        this.m_box = new PRectBox( this.dx, this.dy, - Infinity, 16, 16, Infinity );

        this.boxes = [];

        for (let px = 0; px < 16; px ++) {
            for (let py = 0; py < 16; py ++) {
                let type = chunk.grid_data[py][px];
                if (type === -1) continue;

                this.boxes.push( new PRectBox(this.dx + px, this.dy + py, -Infinity, 1, 1, Infinity) );
            }
        }

        console.log(this.boxes)
    }
}

class GridLayer_HitBox extends HitBox {
    constructor (layer) {
        super();

        this.layer  = layer;
        this.chunks = []
    }
}

class Grid_HitBox extends HitBox {
    constructor (grid) {
        super();

        this.grid   = grid;
        this.layers = []
    }
}

RICE_HITBOX_ARRAYS.add(GridChunk_HitBox, HitBox, ( c_box, box) => {
    if (!c_box.m_box.collide(box)) return false;

    for (let t_box of c_box.boxes)
        if (t_box.collide(box))
            return true;
    
    return false;
})

RICE_HITBOX_ARRAYS.add( GridLayer_HitBox, HitBox, ( layer_box, box ) => {
    if (!layer_box.layer.collider) return false;

    if (layer_box.chunks.length !== layer_box.layer.chunks.length) {
        layer_box.chunks = [];

        for (let m_chunk of layer_box.layer.m_chunks)
            layer_box.chunks.push( new GridChunk_HitBox(m_chunk) );
    }

    for (let m_chunk of layer_box.chunks)
        if (m_chunk.collide( box ))
            return true;
    
    return false;
} )

RICE_HITBOX_ARRAYS.add( Grid_HitBox, HitBox, (grid_box, box) => {
    if (grid_box.layers.length !== grid_box.grid.layers.length) {
        grid_box.layers = [];

        for (let m_layer in grid_box.grid.layers)
            grid_box.layers.push( new GridLayer_HitBox( grid_box.grid.layers[m_layer] ) );
    }
    
    for (let m_layer of grid_box.layers)
        if (m_layer.collide(box))
            return true;

    return false;
})
