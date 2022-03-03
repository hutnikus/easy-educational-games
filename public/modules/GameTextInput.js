import {GameElement} from "./GameElement.js";
import {Point, randomColor} from "./Misc.js";
import {GameShape} from "./drawables/GameShape.js";
import {GameText} from "./drawables/GameText.js";

class GameTextInput extends GameElement {
    #widthValue = undefined
    set width(newWidth) {
        if (newWidth === undefined) {
            this.#widthValue = 150
        }
        else if (isNaN(newWidth)) {
            throw new Error("Entered width value is not a number!")
        } else {
            this.#widthValue = newWidth
        }
        //set text width
        const text = this.getChildByName("text")
        text.maxWidth = this.#widthValue
        //set rect width
        const rect = this.getChildByName("rect")
        rect.width = this.#widthValue
    }
    get width() {
        return this.#widthValue
    }

    #heightValue = undefined
    set height(newHeight) {
        if (newHeight === undefined) {
            this.#heightValue = 30
        }
        else if (isNaN(newHeight)) {
            throw new Error("Entered height value is not a number!")
        }
        else {
            this.#heightValue = newHeight
        }
        //set rect height
        const rect = this.getChildByName("rect")
        rect.height = this.#heightValue
    }
    get height() {
        return this.#heightValue
    }

    #colorValue = undefined
    set color(newColor) {
        if (newColor === undefined) {
            this.#colorValue = 'aliceblue'
        }
        else if (newColor === "random") {
            this.#colorValue = randomColor()
        }
        else {
            this.#colorValue = newColor
        }
        //set rect color
        const rect = this.getChildByName("rect")
        rect.fill = this.#colorValue
    }
    get color() {
        return this.#colorValue
    }

    #textValue = undefined
    set text(newText) {
        this.#textValue = (newText === undefined) ? this.defaultText : newText;
        //pass text to element
        const text = this.getChildByName("text")
        text.text = this.#textValue
    }
    get text() {
        return this.#textValue
    }

    #defaultTextValue = undefined       // text that shows up in the popup
    set defaultText(newDefaultText) {
        this.#defaultTextValue = (newDefaultText === undefined) ? "Enter text" : newDefaultText;
    }
    get defaultText() {
        return this.#defaultTextValue
    }

    message = ""

    onEnter = []

    constructor(center,attrs={}) {
        super(center,[],attrs)
        // init elements
        const text = new GameText("",{level:0,name:"text"})
        this.addChild(text)
        const rectangle = new GameShape('rectangle',{
                width:0,
                height:0,
                level:-1,
                stroke: 'black',
                lineWidth: 1,
                name: "rect"
            }
        )
        this.addChild(rectangle)

        //init attributes
        this.defaultText = attrs.defaultText
        this.text = attrs.text;
        this.width = attrs.width
        this.height = attrs.height
        this.color = attrs.color;
        this.message = (attrs.message === undefined) ? 'Enter text' : attrs.message;

        this.clickable = true

        this.addOnClickListener(this.clickOnInput,this)
    }

    addOnEnterTextListener(callback,attrs) {
        this.onEnter.push([callback,attrs])
    }

    async clickOnInput(self) {
        const entered = window.prompt(self.message, self.defaultText);
        if (entered === null) {
            return
        }
        self.text = entered
        self.defaultText = self.text

        const mouse = self.shared.mousePos

        if (await self.isInside(mouse)) {
            for (const onEnter of self.onEnter) {
                onEnter[0](onEnter[1])
            }
        }
    }
}

export {GameTextInput}