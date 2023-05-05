
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

class Texture {
    constructor (web_gl, url) {
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
        this.image.src    = "/api/fs/read/" + url;
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
                this.web_gl.TEXTURE_MIN_FILTER, this.web_gl.LINEAR);
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
