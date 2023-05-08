
const SCRIPTS_ARRAY = {}

class Script {
    constructor (context, file) {
        if (SCRIPTS_ARRAY[file]) return SCRIPTS_ARRAY[file]
        SCRIPTS_ARRAY[file] = this

        this.context = context;

        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject  = reject;
        })

        this.file_path = file;

        fetch('/api/fs/read/' + file).then((body) => body.text().then((text) => {
            this.content = text;

            this.compile();
            this.resolve();
        }))
    }
    async wait () {
        await this.promise;
    }

    compile () {
        this.file = new Dromadaire.File( this.content, this.file_path )

        this.block_node = Dromadaire.compile( this.file, { show_errors: true } );
    }
    update_content (content) {
        this.content = content;
        this.compile();
    }

    execute (modules) {
        if (this.block_node === undefined) {
            this.context.engine.project.alert_manager.addAlert([ "warning", "The file '" + this.file_path + "' could not load before execution" ])
            return ;
        }

        Dromadaire.execute( this.block_node, modules );
    }
}
