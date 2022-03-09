import {GameElement} from "./GameElement.js";
import {Point, randomColor} from "../Misc.js";
import {GameShape} from "../drawables/GameShape.js";
import {GameText} from "../drawables/GameText.js";

/**
 * Text Input class
 * @extends GameElement
 *
 * @property {number} width Width of the text input element
 * @property {number} height Height of the text input element
 * @property {string} color Background color of the element (default 'aliceblue')
 * @property {string} text Text displayed/entered on the element
 * @property {string} defaultText Text that shows up already pre-filled in the popup todo merge with text?
 * @property {string} message Text displayed on the popup. Default 'Enter text'
 * @property {Array<callbackValue>} onEnter Array of [callback,attribute_object] called on enter text (on popup)
 *
 */
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

    /**
     * Constructor for Text Input element
     * @param {Point} center Center point of the element
     * @param {Object} attrs Attribute object
     */
    constructor(center,attrs={}) {
        super(center,[],attrs)
        // init elements
        this.onEnter = []
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

        this.addOnClickListener(GameTextInput.#clickOnInput,this)
    }

    /**
     * Adds a listener to the array of listeners for onEnter
     * @param {function} callback function to be called
     * @param {Object} attrs Attribute object passed to the callback
     */
    addOnEnterTextListener(callback,attrs) {
        this.onEnter.push([callback,attrs])
    }

    /**
     * Called when user clicks on the element. Shows a prompt in which the user enters text. After text is entered, the onEnter callbacks are called
     * @param {GameTextInput} self Instance of Text Input
     * @returns {Promise<void>}
     * @static
     * @private
     */
    static async #clickOnInput(self) {
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