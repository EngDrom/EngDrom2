
class ProjectPage extends Component {
    constructor (parent, engine) {
        super(parent);

        this.engine = engine;

        if (this.constructor == ProjectPage)
            throw "Cannot create default project page"
    }
}

const TEST_MTREE_CONFIG = {
    "type": "folder",
    "text": "src",
    "files": [
        { "type": "file", "text": "README.md", "icon": "info" },
        { "type": "file", "text": ".gitignore", "icon": "info" },
        {
            "type": "folder",
            "text": "editor",
            "files": [
                { "type": "file", "text": "README.md", "icon": "info" },
                { "type": "file", "text": ".gitignore", "icon": "info" }
            ]
        }
    ]
}

class HomeProjectPage extends ProjectPage {
    constructor (parent, engine) {
        super(parent, engine);

        this._first_render();
    }
    clicked(onglet){
        console.log("hi")
    }

    _first_render () {
        let transform_editor = new TransformEditorComponent(this);
        document.addEventListener("WebDrom.MeshInstance.Clicked", (event) => {
            transform_editor.setTarget(event.meshInstance?.transform);
        });

        let tree = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Project", "component": (parent) => new FileTree(parent).render(), "icons": []  },
            { "text": "Webdrom", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  },
            { "text": "Level", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  }
        ] });
        let property_tree = new MExplorer(this, {
            "text": "Properties",
            "components": [
                { "text": "Transform", "component": (parent) => transform_editor.render() },
                { "text": "Material", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render() },
            ]
        }, false)
        let config   = undefined
        
        let splitter1 = new MSplitter(this, "vertical", undefined, true, 
            this.engine.render(),
            createElement("div", {}, "", [])
        )
        let tabs = createElement("div", {}, "h-8 w-full flex",[
            new Onglet().render(),
            new Onglet().render()
        ])

        let texteditor = createElement("div",{},"w-full h-full bg-Vwebdrom-light-background p-4 absolute top-8 right-0 text-white z-10 select-none text-xl",[])

        let textarea=createElement("textarea", {}, "w-full h-full bg-Vwebdrom-light-background p-4  absolute text-none top-8 right-0",[])

        textarea.addEventListener("keydown",(e) => {
            if (e.key == 'Tab') {
              e.preventDefault();
              var start = textarea.selectionStart;
              var end = textarea.selectionEnd;
          
              // set textarea value to: text before caret + tab + text after caret
              texteditor.innerHTML = texteditor.innerHTML.substring(0, start) +
                "    " + texteditor.innerHTML.substring(end);
          
              // put caret at right position again
              textarea.selectionStart =
              textarea.selectionEnd = start + 4;
            }
            texteditor.innerHTML += String.fromCharCode(e.keyCode)
            setTimeout(() => {
                let line_number = texteditor.innerHTML.substr(0, texteditor.selectionStart).split("\n").length
                let pos0 = texteditor.innerHTML.substr(0, texteditor.selectionStart).length;
                let line = texteditor.innerHTML.substr(0, texteditor.selectionStart).split("\n")[line_number-1]
                let lexer = new Dromadaire.Lexer(new Dromadaire.File(line,"index.dmd")).build()
                let color={
                    1:"#123456",
                    2:"#234567",
                    3:"#345678",
                    4:"#456789"
                }
                for(let i =0;i<lexer.length;i++){
                    if(lexer[i].__type==17){
                        continue;
                    }
                    texteditor.innerHTML = texteditor.innerHTML.substring(0, pos0+lexer[i].column) + "<span style='color:"+color[lexer[i].__type]+"'>"+line.substr(lexer[i].columnn,lexer[i].size)+"</span>"+texteditor.innerHTML.substring(pos0+lexer[i].column+lexer[i].size+35);
                    pos0+=35;
                }
                console.log(lexer)

            },0)
          })

        let onglets= createElement("div", {}, "w-full h-full relative", [
            tabs,
            texteditor,
            textarea
        ])

        let splitter = new MSplitter (this, "horizontal", undefined, true,
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                tree.render()
            ]),
            splitter1.render(),
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                property_tree.render()
            ])
        )

        const left_onglet = 60;
        let splitter_viewport = new ViewportComponent(
            this, splitter, left_onglet, 21
        )
        splitter.sizes     = [ 300, 800, 300 ];
        splitter1.sizes    = [ 300, 300 ];
        splitter.min_sizes = [ 200, 400, 200 ];
        splitter.collapse  = [ true, false, true ];
        splitter1.collapse = [ false, false ];
        this.element = createElement("div", {}, "h-full flex", [
            createElement("div", {}, `w-[${left_onglet}px]`, [
                createElement("div", [], "cursor-pointer p-[14px] h-15 relative", [
                    createElement("div", [], "absolute left-0 top-0 w-[2px] bg-Vwebdrom-editor-text h-full"),
                    createIcon("desktop_windows", "icon-32")
                ]),
                createElement("div", [], "cursor-pointer p-[14px] h-15", [
                    createIcon("content_copy", "icon-32")
                ]),
                createElement("div", [], "cursor-pointer p-[14px] h-15", [
                    createIcon("schema", "icon-32")
                ])
            ]),
            splitter_viewport.render()
        ])
    }

    _render () {
        return this.element;
    }
}

class ProjectComponent extends Component {
    constructor (parent, project_page, engine) {
        super(parent);
        this.engine = new WebEngine(this.component);

        this.project_page = (new project_page(this, this.engine)).render();
        this.prompt       = new MPromptManager();
    }

    _render () {
        return createElement("div", {}, "flex-1", [
            this.project_page,
            this.prompt.render()
        ])
    }
}

class Project {
    constructor (body, page = HomeProjectPage) {
        let customEvent = new CustomEvent( "WebDrom.CreateProject" )
        customEvent.project = this;
        this.body = body;

        this.page = page;
        this.component = new ProjectComponent(undefined, page);

        this.body.appendChild(this.component.render())
        
        document.dispatchEvent( customEvent )
    }

    prompt (config) {
        this.component.prompt.addPrompt(config)
    }
}
