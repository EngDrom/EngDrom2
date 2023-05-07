

class Camera {
    constructor () {
        this.sri      = new SRI();
        this.override = {}
    }
    transform () {
        let comp = this.sri.get_components();

        let [ x,  y,  z] = comp.position;
        let [rx, ry, rz] = comp.rotation;
        let [sx, sy, sz] = comp.scale;

        if (this.override?. x !== undefined)  x = this.override?. x;
        if (this.override?. y !== undefined)  y = this.override?. y;
        if (this.override?. z !== undefined)  z = this.override?. z;
        if (this.override?.rx !== undefined) rx = this.override?.rx;
        if (this.override?.ry !== undefined) ry = this.override?.ry;
        if (this.override?.rz !== undefined) rz = this.override?.rz;

        return new Transform(- x, - y, z, - rx, - ry, rz, 1, 1, 1);
    }
    set_override (override = {}) {
        this.override = override;
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

