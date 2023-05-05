

class Camera {
    constructor () {
        this.sri = new SRI();
    }
    transform () {
        let comp = this.sri.get_components();

        let [ x,  y,  z] = comp.position;
        let [rx, ry, rz] = comp.rotation;
        let [sx, sy, sz] = comp.scale;

        return new Transform(- x, - y, z, - rx, - ry, rz, 1, 1, 1);
    }
    integrate (delta_t) {
        this.sri.integrate(delta_t);
    }
    
    accelerate (dx, dy, dz) {
        this.sri.position.acc.x += dx;
        this.sri.position.acc.y += dy;
        this.sri.position.acc.z += dz;
    }
    velocity (dx, dy, dz) {
        this.sri.position.ssp.x += dx;
        this.sri.position.ssp.y += dy;
        this.sri.position.ssp.z += dz;
    }
}

