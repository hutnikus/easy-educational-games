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
 * @property {Array<function>} onEnter Array of [callback,attribute_object] called on enter text (on popup)
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

    #clickOnInput = async (event) => {
        const entered = window.prompt(this.message, this.defaultText);
        if (entered === null) {
            return
        }
        this.text = entered
        this.defaultText = this.text

        const mouse = this.shared.mousePos

        if (await this.isInside(mouse)) {
            for (const callback of this.onEnter) {
                // callback(event)
                callback.call(this,event)
            }
        }
    }

    /**
     * Constructor for Text Input element
     * @param {Point} center Center point of the element
     * @param {Object} attrs Attribute object
     */
    constructor(center,attrs={}) {
        super(center,[],attrs)
        // init elements
        this.onEnter = (Array.isArray(attrs.onEnter)) ? attrs.onEnter : []
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

        this.addOnClickListener(this.#clickOnInput)
    }

    /**
     * Adds a listener to the array of listeners for onEnter
     * @param {function} callback function to be called
     */
    addOnEnterTextListener(callback) {
        this.onEnter.push(callback)
    }

    /**
     * Removes listener for the onEnterText event
     * @param {function} callback function you want to remove
     */
    removeOnEnterTextListener(callback) {
        this.onEnter = this.onEnter.filter(item=>item!==callback)
    }

    /**
     * Returns object of attributes of current instance.
     * @returns {Object} Attribute object.
     */
    getAttrs() {
        return Object.assign({
            width: this.width,
            height: this.height,
            color: this.color,
            text: this.text,
            defaultText: this.defaultText,
            message: this.message,
            onEnter: [...this.onEnter],
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameTextInput} New instance with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        const retInput = new GameTextInput(attrs.center,attrs)
        // remove drawing of this instance
        retInput.removeOnClickListener(this.#clickOnInput)
        return retInput
    }
}

export {GameTextInput}