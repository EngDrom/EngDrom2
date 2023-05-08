
class GridEngineMode extends EditEngineMode {
    constructor (engine) {
        super(engine);

        this.editor = new GridEditor(this, undefined, undefined); // TODO find both
    }
    onrender () {
        this.editor.render(this.get_camera());
    }
    multiply (matrix, vector) {
        return [
            matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8]  * vector[2] + matrix[12] * vector[3],
            matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9]  * vector[2] + matrix[13] * vector[3],
            matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14] * vector[3],
            matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15] * vector[3],
        ]
    }
    cast_vector_to_pixels (trModel, x, y, z, w) {
        let mModel  = trModel.matrix();
        let mProj   = this.get_context().projection.matrix();
        let mCamera = this.get_camera().transform(false).matrix();

        let vec = [ x, y, z, w ];
        vec = this.multiply(mModel,  vec);
        vec = this.multiply(mCamera, vec);
        vec = this.multiply(mProj,   vec);

        let [ ix, iy, iz, iw ] = vec;

        ix /= iw; iy /= iw; iz /= iw;

        return [
            (ix + 1) / 2 * this.width (), 
            (iy + 1) / 2 * this.height() 
        ];
    }

    find_pos (instance, event) {
        let [ox, oy] = this.cast_vector_to_pixels( instance.transform, 0, 0, 0, 1 );
        let [rx, ry] = this.cast_vector_to_pixels( instance.transform, 1, 0, 0, 1 );
        let [tx, ty] = this.cast_vector_to_pixels( instance.transform, 0, 1, 0, 1 );

        let dx = rx - ox;
        let dy = ty - oy;

        let px = event.layerX - ox;
        let py = (this.height() - event.layerY) - oy;
        let bx = Math.floor( px / dx );
        let by = Math.floor( py / dy );

        return [bx, by];
    }

    place_tile (event, type) {
        let instance = this.engine.canvas.clicked_mesh_instance
        if (instance === undefined || !(instance instanceof GridLayer)) {
            this.engine.project.alert_manager.addAlert([ "danger", "No layer selected for click event" ])
            return ;
        }

        let [bx, by] = this.find_pos(instance, event);

        //instance.setTile(bx, by, type);
    }

    onclick (event) {
        this.place_tile(event, 0);

        return false;
    }
    oncontextmenu (event) {
        this.place_tile(event, -1);
    }
}
