

class SavedMesh extends Mesh {
    constructor (context, file) {
        super(context, undefined, undefined);

        this.pending = [];

        fetch ('/api/fs/read/' + file).then((b) => b.json().then((json) => {
            this.indices   = json.indices;
            this.vbos_data = json.vbo;
            this.make(json.vbo, json.indices);

            for (let f of this.pending) f();
            this.pending = undefined;
        }))
    }

    await (f) {
        if (this.indices)
            f();
        else this.pending.push(f);
    }
}

