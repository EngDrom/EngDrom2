class Onglet extends Component {
    constructor(parent,config){
        super(parent);
        this.config=config
        //this.parent=parent
        this._first_render()
    }
    _first_render(){
        this.element=createElement("div", {}, "px-2 flex gap-3 h-8 bg-Vwebdrom-editor-blue-light text-white text-base",[
            createElement("div", {}, "", [
                createElement("div", {}, "h-min center-h vscode-icons",[
                createUnsafeText("u","vscode-icons")
            ])]),
            createElement("div", {}, "", [
                createElement("div", {onclick: () => this.onclick()}, "h-min center-h",[
                this.config.name
            ])]),
            createElement("div", {}, "",[
                createElement("div", {}, "h-min center-h",[
            createElement("img", {"src": "webdrom/editor/text/close.png", onclick: () => this.delete()}, "w-3 h-3",[])
            ])])
        ])
    }
    _render(){
        return this.element
    }
    onclick(){
        console.log(this)
        this.parent.textarea.value=this.config.content
        this.parent.reload()
        this.parent.name=this.config.name
        console.log("qqch")
    }
    delete(){
        this.parent.tabs.removeChild(this.element)
        this.parent.textarea.value=""
        this.parent.name=undefined
        this.parent.reload()
    }
}