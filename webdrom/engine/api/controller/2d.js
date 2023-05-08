

class PlanePlayerController extends PlayerController {
    constructor (override, sx = 1, sy = 1, options = [ 'l', 'r', 'u', 'd' ]) {
        super(override);
        this.sx = sx;
        this.sy = sy;

        for (let opt of options)
            this[opt] = true;
    }
    append (camera, key) {
        if (this.r && key == "ArrowRight") camera.velocity( this.sx, 0, 0);
        if (this.l && key == "ArrowLeft")  camera.velocity(-this.sx, 0, 0);
        if (this.u && key == "ArrowUp")    camera.velocity( 0, this.sy, 0);
        if (this.d && key == "ArrowDown")  camera.velocity( 0,-this.sy, 0);
    }
    compute (camera, keys_status) {
        camera.sri.position.ssp.x = 0;
        camera.sri.position.ssp.y = 0;
        camera.sri.position.ssp.z = 0;

        for (let ckey in keys_status)
            if (keys_status[ckey])
                this.append(camera, ckey);
    } 
    onkeystart (camera, key, keys_status) {
        this.compute(camera, keys_status)
    }

    onkeyend (camera, key, keys_status) {
        this.compute(camera, keys_status)
    }

    ondrag (camera, dx, dy) {
        // Do nothing in a 2D Plane
    }
    
    get_override() {
        return this.override;
    }
    ontick (camera, delta_t) {
        if (camera instanceof Camera)
            camera.set_override(this.get_override());
        camera.integrate(delta_t);
    }
}

