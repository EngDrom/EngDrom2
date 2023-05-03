

class Camera {
    constructor () {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;

        this.__transform = undefined;
    }
    _transform () {
        this.__transform = new Transform(-this.x, -this.y, this.z, -this.rx, -this.ry, -this.rz);
    }
    transform () {
        if (this.__transform === undefined)
            this. _transform();
        return this.__transform;
    }

    setX(x) {
        this.x = x;
        this.__transform = undefined;
    }
    setY(y) {
        this.y = y;
        this.__transform = undefined;
    }
    setZ(z) {
        this.z = z;
        this.__transform = undefined;
    }
    translate (dx, dy, dz) {
        this.x += dx;
        this.y += dy;
        this.z += dz;

        this.__transform = undefined;
    }
    rotate (dx, dy, dz) {
        this.rx += dx;
        this.ry += dy;
        this.rz += dz;

        this.__transform = undefined;
    }
}

