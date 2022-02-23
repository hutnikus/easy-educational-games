import {GameElement} from "./GameElement.js";
import {Point} from "./Misc.js";
import {GameShape} from "./drawables/GameShape.js";
import {GameText} from "./drawables/GameText.js";

class GameButton extends GameElement {
    width = undefined
    height = undefined

    color = undefined
    text = undefined

    selected = false

    onPress = []

    constructor(center,attrs={}) {
        super(center,[],attrs)

        this.width = (attrs.width === undefined) ? 100 : attrs.width
        this.height = (attrs.height === undefined) ? 50 : attrs.height
        this.color = (attrs.color === undefined) ? 'lightgrey' : attrs.color;
        this.text = attrs.text;

        const rectangle = new GameShape('rectangle',{
                width:this.width,
                height:this.height,
                fill:this.color,
                level:-1,
                stroke: 'black',
                lineWidth: 5
            }
        )
        this.addChild(rectangle)

        const text = new GameText(this.text,{level:0,})
        this.addChild(text)

        this.highlight =  new GameShape('rectangle',{
                width:this.width+4,
                height:this.height+4,
                level:-1,
                stroke: 'lightblue',
                lineWidth: 5,
                visible:false
            }
        )
        this.addChild(this.highlight)

        this.clickable = true
        this.draggable = true
        this.stationary = true

        this.addOnClickListener(this.selectButton,this)
        this.addOnFinishDraggingListener(this.deselectButton,this)
    }

    addOnButtonPressListener(callback,attrs) {
        this.onPress.push([callback,attrs])
    }

    selectButton(self) {
        self.highlight.visible = true
        self.selected = true
    }
    async deselectButton(self) {
        const mouse = self.shared.mousePos

        self.highlight.visible = false

        if (await self.isInside(mouse)) {
            for (const onPressElement of self.onPress) {
                onPressElement[0](onPressElement[1])
            }
        }
    }
}

export {GameButton}