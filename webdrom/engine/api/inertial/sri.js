
class SRI_Vector {
    constructor (x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    integrate (target, dt) {
        target.x += dt * this.x;
        target.y += dt * this.y;
        target.z += dt * this.z;
    }
}
class SRI_Density {
    constructor (dp = [ 0, 0, 0 ]) {
        this.acc = new SRI_Vector();
        this.spe = new SRI_Vector();
        this.ssp = new SRI_Vector(); // static speed
        this.pos = new SRI_Vector();
        
        this.pos.x = dp[0];
        this.pos.y = dp[1];
        this.pos.z = dp[2];

        this.dp = dp;
    }

    reset (x = undefined, y = undefined, z = undefined, sx = 0, sy = 0, sz = 0, ax = 0, ay = 0, az = 0) {
        if (x === undefined) x = this.dp[0]
        if (y === undefined) y = this.dp[1]
        if (z === undefined) z = this.dp[2]
        
        this.pos = new SRI_Vector(x, y, z);
        this.spe = new SRI_Vector(0, 0, 0);
        this.ssp = new SRI_Vector(sx, sy, sz);
        this.acc = new SRI_Vector(ax, ay, az);
    }
    integrate (delta_t) {
        this.acc.integrate(this.spe, delta_t);
        this.spe.integrate(this.pos, delta_t);
        this.ssp.integrate(this.pos, delta_t);
    }
}

class SRI {
    constructor () {
        this.position = new SRI_Density();
        this.rotation = new SRI_Density();
        this.scale    = new SRI_Density([ 1, 1, 1 ]);
    }
    integrate (delta_t) {
        this.position.integrate(delta_t);
        this.rotation.integrate(delta_t);
        this.scale   .integrate(delta_t);
    }
    get_components () {
        return {
            position: [ this.position.pos.x, this.position.pos.y, this.position.pos.z ],
            rotation: [ this.rotation.pos.x, this.rotation.pos.y, this.rotation.pos.z ],
            scale   : [ this.scale   .pos.x, this.scale   .pos.y, this.scale   .pos.z ]
        }
    }
    as_transform () {
        let comp = this.get_components();

        return new Transform(
            comp.position[0], comp.position[1], comp.position[2],
            comp.rotation[0], comp.rotation[1], comp.rotation[2],
            comp.scale   [0], comp.scale   [1], comp.scale   [2],
        )
    }
};
