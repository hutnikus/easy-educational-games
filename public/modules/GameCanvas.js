import {GameElement} from "./GameElement.js";
import {Point} from "./Misc.js";
import {GameShape} from "./drawables/GameShape.js";

class GameCanvas extends GameElement {
    width = undefined
    height = undefined

    current = undefined //GameShape of type line - currently drawn line
    lineWidth = undefined
    stroke = undefined

    background = undefined

    interval = undefined

    constructor(center,attrs={}) {
        super(center,[],attrs)

        this.width = (attrs.width === undefined) ? 300 : attrs.width
        this.height = (attrs.height === undefined) ? 300 : attrs.height
        this.lineWidth = (attrs.lineWidth === undefined) ? 2 : attrs.lineWidth
        this.stroke = (attrs.stroke === undefined) ? 'random' : attrs.stroke
        this.fill = (attrs.fill === undefined) ? 'antiquewhite' : attrs.fill

        this.background = new GameShape('rectangle',{
                width:this.width,
                height:this.height,
                fill:this.fill,
                level:-1
            }
        )
        this.addChild(this.background)

        this.clickable = true
        this.draggable = true
        this.stationary = true

        this.addOnClickListener(this.startDrawing,this)
        this.addOnFinishDraggingListener(this.finishDrawing,this)
    }

    clear() {
        this.children = [this.background]
    }

    startDrawing(self) {
        const mouse = self.shared.mousePos
        const position = new Point(mouse.x-self.center.x,mouse.y-self.center.y)
        position.rotateAround(Point(0,0),-self.rotation)
        self.current = new GameShape('line',{
            level:0,
            coords:[...position.asArray(),...position.asArray()],
            stroke:self.stroke,
            lineWidth:self.lineWidth,
        })
        self.addChild(self.current,false)

        self.interval = setInterval(()=>self.continueDrawing(self),20)
    }
    async continueDrawing(self) {
        if (self.current === undefined) {
            return;
        }
        const mouse = self.shared.mousePos
        const position = new Point(mouse.x-self.center.x,mouse.y-self.center.y)
        position.rotateAround(Point(0,0),-self.rotation)

        if (!await self.isInside(mouse)) {
            self.current = undefined
            clearInterval(self.interval)
            return
        }

        self.current.addPoint(position)
    }
    finishDrawing(self) {
        if (self.current === undefined) {
            return;
        }
        const mouse = self.shared.mousePos
        const position = new Point(mouse.x-self.center.x,mouse.y-self.center.y)
        position.rotateAround(Point(0,0),-self.rotation)
        self.current.addPoint(position)
        self.current = undefined;
        clearInterval(self.interval)
    }
}

export {GameCanvas}