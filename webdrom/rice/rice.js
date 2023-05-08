/**
 * RICE (Rotational and Inertial Collision Engine)
 * 
 * Allows the computation of inertia inside of a collision box
 */

class RiceWorld {
    constructor () {
        this.boxes = new Set();
    }
    append (box) {
        this.boxes.add(box);
    }

    collide (box) {
        for (let hitbox of this.boxes)
            if (hitbox.collide(box))
                return true;
        
        return false;
    }
}

class RiceFactoryManager {
    constructor () {
        this.factory = {}
    }
    add (type0, type1, value) {
        if (!this.factory[type0])
            this.factory[type0] = {}
        this.factory[type0][type1] = value;    
    }
    get (type0, type1) {
        if (this.factory[type0] && this.factory[type0][type1])
            return this.factory[type0][type1];
        if (this.factory[type1] && this.factory[type1][type0])
            return (x, y) => this.factory[type1][type0](y, x);
        
        if (this.factory[type0] && this.factory[type0][HitBox])
            return this.factory[type0][HitBox]
        if (this.factory[type1] && this.factory[type1][HitBox])
            return this.factory[type1][HitBox]
        
        return ;
    }
}

class HitBox {
    constructor () {  }

    collide ( other ) {
        let factory = RICE_HITBOX_ARRAYS.get(this.constructor, other.constructor);

        return factory(this, other);
    }
}

const RICE_HITBOX_ARRAYS = new RiceFactoryManager()

class PRectBox extends HitBox {
    constructor (x, y, z, sx, sy, sz) {
        super();
        
        this.x = x;
        this.y = y;
        this.z = z;
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;
    }

    is_in (x, y, z) {
        return this.x <= x && (this.sx === Infinity || x <= this.x + this.sx)
            && this.y <= y && (this.sy === Infinity || y <= this.y + this.sy)
            && this.z <= z && (this.sz === Infinity || z <= this.z + this.sz)
    }
    points () {
        let points = [];
        for (let x of [ this.x, this.x + this.sx ])
            for (let y of [ this.y, this.y + this.sy ])
                for (let z of [ this.z, this.z + this.sz ])
                    points.push([x, y, z])
        
        return points;
    }

    _collide (c1) {
        // the collision is missing a case where the points are not in the other box
        // with a vertical and a horizontal box, but this case can only be achieved
        // by violating at some point the displacement rules so we don't care
        for (let point of this.points())
            if (c1.is_in(...point))
                return true;
        for (let point of c1.points())
            if (this.is_in(...point))
                return true;
        return false;
    }
    collide (other, def=true) {
        if (other instanceof PRectBox)
            return this._collide(other)
        if (other.collide(this, false)) return true;
        if (def)
            return super.collide(other)
        return false;
    }
}
