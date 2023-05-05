
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
        let tree2 = new MExplorer (this, { "text": "Explorer", "components": [
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

        let texteditor = createElement("div",{},"w-full min-h-8 bg-Vwebdrom-background p-4 absolute top-8 right-0 z-10 select-none text-base opacity-.5",[])
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
          
        let textarea=createTextArea("")
        textarea.addEventListener("keydown",(e) => {
            //console.log(e,textarea.value)
            if (e.key == 'Tab') {
                e.preventDefault();
                var start = textarea.selectionStart;
                var end = textarea.selectionEnd;
            
                // set textarea value to: text before caret + tab + text after caret
                textarea.value = textarea.value.substring(0, start) +
                  "    " + textarea.value.substring(end);
            
                // put caret at right position again
                textarea.selectionStart =
                  textarea.selectionEnd = start + 4;
            }
            if(e.key=="Backspace" && texteditor.innerHTML.substr(-8)=="<br><br>"){
                //alert("remove line")
                texteditor.innerHTML=texteditor.innerHTML.substr(0,texteditor.innerHTML.length-4)
                //console.log(texteditor.innerHTML)
            }
            //e.preventDefault();
            //console.log("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890=+}{[]()-_:;., ".search(e.key))
            /*if("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890=\+}{[]()-_:;.,/ \n".search(e.key) >=0){
            textarea.value += e.key
            }*/
            setTimeout(() => {
                let line_number = textarea.value.substr(0, textarea.selectionStart).split("\n").length
                let pos = 0;
                for(let i=0;i<line_number;i++){
                    pos+=4+texteditor.innerHTML.split("<br>")[i].length
                }
                /*if(line_number>0){
                    pos-=4
                }*/
                let pos0=pos;
                //console.log(pos0)
                if(pos>4 && e.key != "Enter"){
                    pos0=pos-5
                }
                //console.log(textarea.value)
                //console.log(texteditor.innerHTML)
                //console.log(pos0)
                while(texteditor.innerHTML.substr(pos0,4)!="<br>" && pos0!=0){
                    //console.log(texteditor.innerHTML.substr(pos0,pos0+4))
                    pos0--;
                }
                pos0+=4
                let fin=pos-4;
                //console.log(pos0)
                while(texteditor.innerHTML.substr(fin,4)!="<br>" && fin<texteditor.innerHTML.length){
                    fin++;
                }
                //fin+=4
                //console.log(fin)
                let line = textarea.value.split("\n")[line_number-1]
                let lexer = new Dromadaire.Lexer(new Dromadaire.File(line,"index.dmd")).build()[0]
                let color={
                    1:"#ff0000",
                    2:"#00ff00",
                    3:"#0000ff",
                    4:"#ffff00"
                }
                let content=texteditor.innerHTML
                texteditor.innerHTML=content.substring(0,pos0)
                let j=0
                let col=lexer[0].col
                let max=col+lexer[0].size
                for(let i=1;i<=line.length;i++){
                    if(i>=max){
                        j++
                    }
                    col=lexer[j].col
                    max=col+lexer[j].size
                    /*if(lexer[j].__type==17){
                        texteditor.innerHTML+="<br>"
                    }*/
                    //else{
                    if(col<=i<max){
                        if(line[i-1]==" "){
                        texteditor.innerHTML+="<span style='display:inline-block;line-height:20px;min-width:4.5px;color:"+color[lexer[j].__type]+"'>"+line[i-1]+"</span>"
                        }
                        else{
                            texteditor.innerHTML+="<span style='display:inline-block;line-height:20px;color:"+color[lexer[j].__type]+"'>"+line[i-1]+"</span>"
                        }
                    }
                    else{
                        if(line[i-1]==" "){
                            texteditor.innerHTML+="<span style='display:inline-block;min-width:4.5px;line-height:20px;color:#ffffff'>"+line[i-1]+"</span>"
                            }
                            else{
                                texteditor.innerHTML+="<span style='display:inline-block;line-height:20px;color:#ffffff'>"+line[i-1]+"</span>"
                            }
                    }
                //}
                }
                //console.log(texteditor.innerHTML)
                if(texteditor.innerHTML.length!=0){
                texteditor.innerHTML+="<br>"+content.substring(fin+4);
                }
                else{
                    texteditor.innerHTML+=content.substring(fin+4);
                }
                //console.log(lexer)

            },0)
          })
        
 
        let onglets= createElement("div", {}, "w-full h-full relative", [
            tabs,
            texteditor,
            textarea
        ])

        let ongletssplitter = new MSplitter (this, "horizontal", undefined, true,
        createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
            tree2.render()
        ]),
        onglets)

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
        let splitter_onglets_viewport = new ViewportComponent(
            this, ongletssplitter, left_onglet, 21
        )
        splitter.sizes     = [ 300, 800, 300 ];
        splitter1.sizes    = [ 300, 300 ];
        splitter.min_sizes = [ 200, 400, 200 ];
        splitter.collapse  = [ true, false, true ];
        splitter1.collapse = [ false, false ];
        ongletssplitter.sizes = [300,800]
        ongletssplitter.min_sizes=[200,400]
        ongletssplitter.collapse=[false,false]
        var splitter_=splitter_viewport.render()
        var onglets_view=splitter_onglets_viewport.render()
        this.contenticon2=createIcon("content_copy", "icon-32")
        this.iconbar=createElement("div", [], "absolute left-0 top-0 w-[2px] bg-Vwebdrom-editor-text h-full")
        this.icon2=createElement("div", {onclick:()=>{this.element.removeChild(splitter_);this.element.appendChild(onglets_view);this.icon2.removeChild(this.contenticon2);this.icon2.appendChild(this.iconbar);this.icon2.appendChild(this.contenticon2)}}, "cursor-pointer p-[14px] h-15 relative", [
            this.contenticon2
        ])
        this.contenticon1=createIcon("desktop_windows", "icon-32")
        this.icon1=createElement("div", {onclick:()=>{this.element.appendChild(splitter_);this.element.removeChild(onglets_view);this.icon1.removeChild(this.contenticon1);this.icon1.appendChild(this.iconbar);this.icon1.appendChild(this.contenticon1)}}, "cursor-pointer p-[14px] h-15 relative", [
            this.iconbar,
            this.contenticon1
        ])
        this.element = createElement("div", {}, "h-full flex", [
            createElement("div", {}, `w-[${left_onglet}px]`, [
                this.icon1,
                this.icon2,
                createElement("div", [], "cursor-pointer p-[14px] h-15", [
                    createIcon("schema", "icon-32")
                ])
            ]),
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
