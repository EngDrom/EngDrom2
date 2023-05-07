
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
    }

    collide_generic (box) {
        if (!this.m_box.collide(box)) return false;
    
        for (let t_box of this.boxes)
            if (t_box.collide(box))
                return true;
        
        return false;
    }
    collide_box (box) {
        if (!this.m_box.collide(box)) return false;

        let lx = Math.floor(-(this.dx) + box.x);
        let ly = Math.floor(-(this.dy) + box.y);
        let rx = Math.ceil(-(this.dx) + box.x + box.sx + 0.1);
        let ry = Math.ceil(-(this.dy) + box.y + box.sy + 0.1);

        if (lx < 0) lx = 0;
        if (ly < 0) ly = 0;
        if (rx > 16) rx = 16;
        if (ry > 16) ry = 16;

        for (let x = lx; x < rx; x ++)
            for (let y = ly; y < ry; y ++)
                if (this.chunk.grid_data[y][x] !== -1)
                    return true;

        return false;
    }

    collide (other) {
        if (other instanceof PRectBox) return this.collide_box(other);
        return this.collide_generic(other);
    }
}

class GridLayer_HitBox extends HitBox {
    constructor (layer) {
        super();

        this.layer  = layer;
        this.chunks = []
    }

    collide (box) {
        if (!this.layer.collider) return false;
    
        if (this.chunks.length !== this.layer.chunks.length) {
            this.chunks = [];
    
            for (let m_chunk of this.layer.m_chunks)
                this.chunks.push( new GridChunk_HitBox(m_chunk) );
        }
    
        for (let m_chunk of this.chunks)
            if (m_chunk.collide( box ))
                return true;
        
        return false;
    }
}

class Grid_HitBox extends HitBox {
    constructor (grid) {
        super();

        this.grid   = grid;
        this.layers = []
    }

    collide (box, def=true) {
        if (this.layers.length !== this.grid.layers.length) {
            this.layers = [];
    
            for (let m_layer in this.grid.layers)
                this.layers.push( new GridLayer_HitBox( this.grid.layers[m_layer] ) );
        }
        
        for (let m_layer of this.layers)
            if (m_layer.collide(box))
                return true;
    
        return false;
    }
}

RICE_HITBOX_ARRAYS.add(GridChunk_HitBox, PRectBox, (c_box, box) => {
    if (!c_box.m_box.collide(box)) return false;

    let lx = Math.floor(-(c_box.dx) + box.x);
    let ly = Math.floor(-(c_box.dy) + box.y);
    let rx = Math.ceil(-(c_box.dx) + box.x + box.sx + 0.1);
    let ry = Math.ceil(-(c_box.dy) + box.y + box.sy + 0.1);

    if (lx < 0) lx = 0;
    if (ly < 0) ly = 0;
    if (rx > 16) rx = 16;
    if (ry > 16) ry = 16;

    for (let x = lx; x < rx; x ++)
        for (let y = ly; y < ry; y ++)
            if (c_box.chunk.grid_data[y][x] !== -1)
                return true;

    return false;
})
RICE_HITBOX_ARRAYS.add(GridChunk_HitBox, HitBox, (c_box, box) => {
    return c_box.collide_generic(box)
})

RICE_HITBOX_ARRAYS.add( GridLayer_HitBox, HitBox, ( layer_box, box ) => {
    return layer_box.collide(box)
} )

RICE_HITBOX_ARRAYS.add( Grid_HitBox, HitBox, (grid_box, box) => {
    return grid_box.collide(box)
})
