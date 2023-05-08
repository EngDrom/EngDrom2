
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
const left_onglet = 60;

class HomeProjectPage extends ProjectPage {
    constructor (parent, engine) {
        super(parent, engine);

        this._first_render();
    }

    _first_render () {
        let transform_editor = new TransformEditorComponent(this);
        document.addEventListener("WebDrom.MeshInstance.Clicked", (event) => {
            transform_editor.setTarget(event.meshInstance);
        });

        let tree = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Project", "component": (parent) => {
                let action = (e, n, p) => {};

                return new FileTree(parent, action).render()
            }, "icons": []  },
            { "text": "Level", "component": (parent) => {
                let lt = new LevelTree(parent, this.engine);

                return lt.render();
            }, "icons": []  }
        ] });

        let property_tree = new MExplorer(this, {
            "text": "Properties",
            "components": [
                { "text": "Transform", "component": (parent) => transform_editor.render() },
                { "text": "Material", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render() },
            ]
        }, false)

        let fillable_component = new FillableComponent(this);
        this.engine.canvas.set_fillable_component(fillable_component);
        
        let splitter1 = new MSplitter(this, "vertical", undefined, true, 
            this.engine.render(),
            fillable_component.render()
        );
        let splitter = new MSplitter (this, "horizontal", undefined, true,
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                tree.render()
            ]),
            splitter1.render(),
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                property_tree.render()
            ])
        )

        let splitter_viewport = new ViewportComponent(
            this, splitter, left_onglet, 21
        )
        
        splitter.sizes     = [ 300, 800, 300 ];
        splitter1.sizes    = [ 300, 300 ];
        splitter.min_sizes = [ 200, 400, 200 ];
        splitter.collapse  = [ true, false, true ];
        splitter1.collapse = [ false, false ];
        var splitter_=splitter_viewport.render()
        this.element = createElement("div", {}, "h-full flex", [
            splitter_
        ])
    }

    _render () {
        return this.element;
    }
}

class ProjectComponent extends Component {
    constructor (parent, project_page, engine) {
        super(parent);
        this.engine = engine;

        this.project_pages = {  }
    
        this.setPage(project_page, false);
        this.prompt = new MPromptManager();
    }
    setPage (project_type, render = true) {
        if (this.project_main === project_type) return ;

        if (this.project_pages[project_type] === undefined)
            this.project_pages[project_type] = (new project_type(this, this.engine)).render();

        this.project_main = project_type;
        this.project_page = this.project_pages[project_type];

        if (render) this.render(false);
    }

    createColorElement (condition) {
        if (condition) return [ createElement("div", [], "absolute left-0 top-0 w-[2px] bg-Vwebdrom-editor-text h-full") ]
        return [ ]
    }
    createIcon (project_type, icon) {
        let element = createElement("div", [], "cursor-pointer p-[14px] h-15 relative", [
            ...this.createColorElement(this.project_main === project_type),
            createIcon(icon, "select-none icon-32")
        ])

        element.onclick = (ev) => {
            this.setPage( project_type );
        }

        return element;
    }
    _render () {
        return createElement("div", {}, "flex-1 flex", [
            createElement("div", {}, `w-[${left_onglet}px]`, [
                this.createIcon( HomeProjectPage, "desktop_windows" ),
                this.createIcon( TextEditor, "content_copy" ),
                this.createIcon( GraphEditor, "schema" ),
            ]),
            this.project_page,
            this.prompt.render()
        ]);
    }
}

class Project {
    constructor (body, page = HomeProjectPage) {
        let customEvent = new CustomEvent( "WebDrom.CreateProject" )
        customEvent.project = this;
        this.body = body;

        this.page = page;
        this.component = new ProjectComponent(undefined, page, new WebEngine(this.component, this));
        this.component.is_dom_root = true;
        this.component.dom_body = this.body;
        this.contextmenu = new ContextMenu(this);
        this.body.appendChild(this.component.render());
        
        document.dispatchEvent( customEvent )
    }

    prompt (config) {
        this.component.prompt.addPrompt(config)
    }
}

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
})


class TextEditor extends ProjectPage{
    constructor (parent, engine) {
        super(parent, engine);

        this._first_render();
    }

    _first_render () {
        this.name=undefined;
        this.line=0;
        function treeclick(e,node,path){
            console.log(path);
            fetch('/api/fs/read/'+path)
                .then(response => response.text())
                .then(text => newonglet(text,path))
        }
        this.texteditor = createElement("div",{},"w-full min-h-8 p-4 absolute top-8 right-0 z-10 select-none text-base",[])
        function createTextArea (value) {
            let area   = createElement("textarea", {}, "w-full bg-Vwebdrom-background p-4 text-white absolute top-8 right-0", []);
            area.value = value  
          
            let resize = () => {
              area.style.height = "5px";
              area.style.height = (area.scrollHeight + 30) + "px";
            }
            area.addEventListener("input", resize)
            area.addEventListener("change", resize)
            resize()
          
            return area
          }
          
        this.textarea=createTextArea("")

        let tree2 = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Project", "component": (parent) => new FileTree(parent,treeclick).render(), "icons": []  }
        ] });

        let config={
            "name" : "New File",
            "content" : ""
        }

        this.tabs = createElement("div", {}, "h-8 w-full flex",[
            new Onglet(this,config).render(),
        ])
        const newonglet = (text,path) => {
            this.tabs.appendChild(new Onglet(this,{"name":path,"content":text}).render())
        }


        let update_line = (line_number,e) => {
            let pos = 0;
            for(let i=0;i<line_number;i++){
                pos+=4+this.texteditor.innerHTML.split("<br>")[i].length
            }
            /*if(line_number>0){
                pos-=4
            }*/
            let pos0=pos;
            //console.log(pos0)
            if(pos>4 && e.key != "Enter"){
                pos0=pos-5
            }
            //console.log(this.textarea.value)
            //console.log(this.texteditor.innerHTML)
            //console.log(pos0)
            while(this.texteditor.innerHTML.substr(pos0,4)!="<br>" && pos0!=0){
                //console.log(this.texteditor.innerHTML.substr(pos0,pos0+4))
                pos0--;
            }
            pos0+=4
            let fin=pos-4;
            //console.log(pos0)
            while(this.texteditor.innerHTML.substr(fin,4)!="<br>" && fin<this.texteditor.innerHTML.length){
                fin++;
            }
            //fin+=4
            //console.log(fin)
            let line = this.textarea.value.split("\n")[line_number-1]
            let lexer = new Dromadaire.Lexer(new Dromadaire.File(line,"index.dmd")).build()[0]
            let color={
                1:"#ff0000",
                2:"#00ff00",
                3:"#0000ff",
                4:"#ffff00"
            }
            let content=this.texteditor.innerHTML
            this.texteditor.innerHTML=content.substring(0,pos0)
            let contenu=""
            let j=0
            let col=lexer[0].col
            let max=col+lexer[0].size
            let b=false
            //let b=false
            for(let i=1;i<=line.length;i++){
                if(i>=max){
                    j++
                }
                col=lexer[j].col
                max=col+lexer[j].size
                /*if(lexer[j].__type==17){
                    this.texteditor.innerHTML+="<br>"
                }*/
                //else{
                if(i==col){
                    //console.log("deb")
                    b=true
                    contenu+="<span style='display:inline-block;line-height:20px;color:"+color[lexer[j].__type]+"'>"
                }
                if(b){
                    //console.log("add")
                    contenu+=line[i-1]
                }
                else{
                    if(line[i-1]==" "){
                        contenu+="<span style='display:inline-block;min-width:4.5px;line-height:20px;color:#ffffff'>"+line[i-1]+"</span>"
                        }
                        else{
                            contenu+="<span style='display:inline-block;line-height:20px;color:#ffffff'>"+line[i-1]+"</span>"
                        }
                }
                if(i==max-1){
                    b=false
                    contenu+="</span>"       
                }
            //}
            }
            //console.log(contenu)
            if(contenu.length+this.texteditor.innerHTML!=0){
            this.texteditor.innerHTML+=contenu+"<br>"+content.substring(fin+4);
            }
            else{
                this.texteditor.innerHTML+=contenu+content.substring(fin+4);
            }
            //console.log(lexer)

        }

        this.textarea.addEventListener("keydown",(e) => {

            if (e.ctrlKey && e.key === 's') {
                if(this.name != undefined){
                const response = fetch("/api/fs/save/"+this.name, {
                    method: 'PUT',
                    headers: {
                      'Content-length' : this.textarea.value.length
                    },
                    body: this.textarea.value
                  });
                }
                e.preventDefault()
                console.log("salut")
                return;
            }
            //console.log(e,textarea.value)
            if (e.key == 'Tab') {
                e.preventDefault();
                var start = this.textarea.selectionStart;
                var end = this.textarea.selectionEnd;
            
                // set this.textarea value to: text before caret + tab + text after caret
                this.textarea.value = this.textarea.value.substring(0, start) +
                  "    " + this.textarea.value.substring(end);
            
                // put caret at right position again
                this.textarea.selectionStart =
                  this.textarea.selectionEnd = start + 4;
            }
            if(e.key=="Backspace" && this.texteditor.innerHTML.substr(-8)=="<br><br>"){
                //alert("remove line")
                this.texteditor.innerHTML=this.texteditor.innerHTML.substr(0,this.texteditor.innerHTML.length-4)
                //console.log(this.texteditor.innerHTML)
            }
            setTimeout(() => {let line_number = this.textarea.value.substr(0, this.textarea.selectionStart).split("\n").length
            //console.log(this.textarea.value.split("\n").length,this.line)
            if((this.line!=this.textarea.value.split("\n").length) && this.textarea.value.split("\n").length!=line_number){
                //console.log("bouh")
                this.reload()
            }
            else{
                update_line(line_number,e)
            }
            this.line=this.textarea.value.split("\n").length},0)
            //e.preventDefault();
            //console.log("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890=+}{[]()-_:;., ".search(e.key))
            /*if("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890=\+}{[]()-_:;.,/ \n".search(e.key) >=0){
            this.textarea.value += e.key
            }*/
        })
 
        let onglets= createElement("div", {}, "w-full h-full relative", [
            this.tabs,
            this.texteditor,
            this.textarea
        ])

        let ongletssplitter = new MSplitter (this, "horizontal", undefined, true,
        createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
            tree2.render()
        ]),
        onglets)


        let splitter_onglets_viewport = new ViewportComponent(
            this, ongletssplitter, left_onglet, 21
        )
        ongletssplitter.sizes = [300,800]
        ongletssplitter.min_sizes=[200,400]
        ongletssplitter.collapse=[false,false]
        var onglets_view=splitter_onglets_viewport.render()
        this.element = createElement("div", {}, "h-full flex", [
            onglets_view
        ])
        //file_tree
        }
    reload(){
        this.textarea.style.height = "5px";
        this.textarea.style.height = (this.textarea.scrollHeight + 30) + "px";
        this.texteditor.innerHTML=""
        let line = this.textarea.value.split("\n")
        
        let color={
            1:"#ff0000",
            2:"#00ff00",
            3:"#0000ff",
            4:"#ffff00"
        }
        for(let k=0;k<line.length;k++){
            let ligne=line[k]
            let lexer=new Dromadaire.Lexer(new Dromadaire.File(ligne,"index.dmd")).build()[0];
            let j=0
            let col=lexer[0].col
            let max=col+lexer[0].size
            let contenu=""
            let b=false
            for(let i=1;i<=ligne.length;i++){
                if(i>=max){
                    j++
                }
                col=lexer[j].col
                max=col+lexer[j].size
                /*if(lexer[j].__type==17){
                    this.texteditor.innerHTML+="<br>"
                }*/
                //else{
                if(i==col){
                    //console.log("deb")
                    b=true
                    contenu+="<span style='display:inline-block;line-height:20px;color:"+color[lexer[j].__type]+"'>"
                }
                if(b){
                    //console.log("add")
                    contenu+=ligne[i-1]
                }
                else{
                    if(ligne[i-1]==" "){
                        contenu+="<span style='display:inline-block;min-width:4.5px;line-height:20px;color:#ffffff'>"+ligne[i-1]+"</span>"
                        }
                        else{
                            contenu+="<span style='display:inline-block;line-height:20px;color:#ffffff'>"+ligne[i-1]+"</span>"
                        }
                }
                if(i==max-1){
                    b=false
                    contenu+="</span>"       
                }
            //}
            }
            this.texteditor.innerHTML+=contenu+"<br>"
        }
        //this.texteditor.innerHTML+="<br>"
        if(this.texteditor.innerHTML=="<br>"){
            this.texteditor.innerHTML=""
        }
        this.line= this.textarea.value.split("\n").length

    }
    _render () {
        return this.element;
    }
}