
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

const TEXTURE_ARRAYS = {};

class Texture {
    constructor (web_gl, url) {
        if (!TEXTURE_ARRAYS[this.constructor])
            TEXTURE_ARRAYS[this.constructor] = {};
        if (TEXTURE_ARRAYS[this.constructor][url])
            return TEXTURE_ARRAYS[this.constructor][url];
        TEXTURE_ARRAYS[this.constructor][url] = this;

        this.web_gl = web_gl;
        this.image   = new Image();

        this.__gl_id = web_gl.createTexture();
        web_gl.bindTexture(web_gl.TEXTURE_2D, this.__gl_id);

        const internalFormat = web_gl.RGBA;
        const srcFormat = web_gl.RGBA;
        const srcType = web_gl.UNSIGNED_BYTE;
        web_gl.texImage2D(web_gl.TEXTURE_2D, 0, internalFormat,
                        1, 1, 0, srcFormat, srcType,
                        new Uint8Array([0, 0, 100, 255])); // default color

        this.image.onload = () => this.create();
        if (url)
            this.image.src = "/api/fs/read/" + url;
    }

    create () {
        const internalFormat = this.web_gl.RGBA;
        const srcFormat = this.web_gl.RGBA;
        const srcType = this.web_gl.UNSIGNED_BYTE;

        this.web_gl.bindTexture(this.web_gl.TEXTURE_2D, this.__gl_id);
        this.web_gl.texImage2D (this.web_gl.TEXTURE_2D, 0, internalFormat,
                  srcFormat, srcType, this.image);
        
        if (isPowerOf2(this.image.width) && isPowerOf2(this.image.height)) {
            this.web_gl.generateMipmap(this.web_gl.TEXTURE_2D);
        } else {
            this.web_gl.texParameteri(this.web_gl.TEXTURE_2D, 
                this.web_gl.TEXTURE_WRAP_S, this.web_gl.CLAMP_TO_EDGE);
            this.web_gl.texParameteri(this.web_gl.TEXTURE_2D, 
                this.web_gl.TEXTURE_WRAP_T, this.web_gl.CLAMP_TO_EDGE);
            this.web_gl.texParameteri(this.web_gl.TEXTURE_2D, 
                this.web_gl.TEXTURE_MIN_FILTER, this.web_gl.NEAREST);
            this.web_gl.texParameteri(this.web_gl.TEXTURE_2D, 
                this.web_gl.TEXTURE_MAG_FILTER, this.web_gl.NEAREST);
        }
    }

    activate (target, uuid) {
        this.web_gl.activeTexture(this.web_gl.TEXTURE0 + uuid);
        this.web_gl.bindTexture(this.web_gl.TEXTURE_2D, this.__gl_id);

        this.web_gl.uniform1i( target, uuid );
    }
    use_in_uniform (shader, buffer) {
        this.activate(buffer.location, shader.textureAllocated ++);
    }
}

class AtlasTexture extends Texture {
    constructor (web_gl, url) {
        super(web_gl, undefined);

        this.atlas = [];

        let promise = new Promise((rs, rj) => {
            this.resolve = rs;
            this.reject  = rj;
        })

        fetch("/api/fs/read/" + url).then((blob) => blob.text().then((text) => {
            let lines = text.split("\n");
            this.image.src = "/api/fs/read/" + lines[0];

            for (let lI = 1; lI < lines.length; lI ++) {
                let [ w, h, x, y, cx, cy ] = lines[lI].split(" ").map((x) => (+x))
                
                for (let dx = 0; dx < cx; dx ++)
                    for (let dy = 0; dy < cy; dy ++)
                        this.atlas.push( [ x + dx * w, y + dy * h, w, h ] );
            }
        }))

        this.promise = promise;
    }

    create () {
        super.create();
        this.resolve()
    }

    async wait () {
        await this.promise;
    }
    coordinates (index) {
        let [x, y, w, h] = this.atlas[index];

        x += 0.1
        y += 0.1
        w -= 0.2
        h -= 0.2

        let x0 = x;
        let y0 = y;
        let x1 = x + w;
        let y1 = y + h;

        return [
            [ x0 / this.image.width, y1 / this.image.height ],
            [ x1 / this.image.width, y1 / this.image.height ],
            [ x1 / this.image.width, y0 / this.image.height ],
            [ x0 / this.image.width, y0 / this.image.height ],
        ]
    }
}
