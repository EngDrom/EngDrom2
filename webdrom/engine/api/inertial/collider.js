
class ColliderSRI extends SRI {
    constructor (world, lx, ly, lz, rx, ry, rz) {
        super();

        this.world = world;

        let [sx, sy, sz] = [ rx - lx, ry - ly, rz - lz ];

        this.sx = sx;
        this.sy = sy;
        this.sz = sz;

        this.lx = lx;
        this.ly = ly;
        this.lz = lz;
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
    }

    check_collision () {
        let lx = this.scale.pos.x * this.lx + this.position.pos.x;
        let ly = this.scale.pos.y * this.ly + this.position.pos.y;
        let lz = this.scale.pos.z * this.lz + this.position.pos.z;
        let rx = this.scale.pos.x * this.rx + this.position.pos.x;
        let ry = this.scale.pos.y * this.ry + this.position.pos.y;
        let rz = this.scale.pos.z * this.rz + this.position.pos.z;

        let x = Math.min(lx, rx);
        let y = Math.min(ly, ry);
        let z = Math.min(lz, rz);
        let sx = Math.abs(this.sx * this.scale.pos.x);
        let sy = Math.abs(this.sy * this.scale.pos.y);
        let sz = Math.abs(this.sz * this.scale.pos.z);

        let box = new PRectBox(x, y, z, sx, sy, sz);
        this.box = box;

        return !this.world.collide(box);
    }

    __integrate (speed, delta_t, axis) {
        let _spe = [ speed.x, speed.y, speed.z ];
        if (axis == 0) { speed.y = 0; speed.z = 0; }
        if (axis == 1) { speed.x = 0; speed.z = 0; }
        if (axis == 2) { speed.x = 0; speed.y = 0; }

        speed.integrate(this.position.pos, delta_t);
        speed.x = _spe[0];
        speed.y = _spe[1];
        speed.z = _spe[2];
    }
    try_integration (speed, delta_t, axis = 0) {
        this.__integrate(speed, delta_t, axis)

        let result = this.check_collision();

        this.__integrate(speed, - delta_t, axis)

        return result;
    }
    integrate_pos (speed, axis, delta_t, reset = true) {
        let a = 0;
        let b = delta_t;

        if (this.try_integration(speed, b, axis)) a = b;

        while (b - a > 1e-6) {
            let c = (a + b) / 2.0;

            if (this.try_integration(speed, c, axis)) a = c;
            else b = c;
        }
        
        this.__integrate(speed, a, axis);
        if (b !== delta_t && reset) {
            if (axis == 0) speed.x = 0;
            if (axis == 1) speed.y = 0;
            if (axis == 2) speed.z = 0;
        }
    }
    integrate (delta_t) {    
        this.rotation.integrate(delta_t);
        this.scale   .integrate(delta_t);
    
        this.position.acc.integrate(this.position.spe, delta_t);

        this.integrate_pos(this.position.spe, 0, delta_t);
        this.integrate_pos(this.position.spe, 1, delta_t);
        this.integrate_pos(this.position.spe, 2, delta_t);
        this.integrate_pos(this.position.ssp, 0, delta_t);
        this.integrate_pos(this.position.ssp, 1, delta_t);
        this.integrate_pos(this.position.ssp, 2, delta_t);
    }
}
