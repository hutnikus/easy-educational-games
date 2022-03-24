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
 * @property {string} message Text displayed on the popup. Default 'Enter text'
 * @property {Array<function>} onEnter Array of [callback,attribute_object] called on enter text (on popup)
 *
 */
class GameTextInput extends GameElement {
    #width = undefined
    set width(newWidth) {
        if (newWidth === undefined) {
            this.#width = 150
        }
        else if (isNaN(newWidth)) {
            throw new Error("Entered width value is not a number!")
        } else {
            this.#width = newWidth
        }
        //set text width
        const text = this.getChildByName("text")
        text.maxWidth = this.#width
        //set rect width
        const rect = this.getChildByName("rect")
        rect.width = this.#width
    }
    get width() {
        return this.#width
    }
    #height = undefined
    set height(newHeight) {
        if (newHeight === undefined) {
            this.#height = 30
        }
        else if (isNaN(newHeight)) {
            throw new Error("Entered height value is not a number!")
        }
        else {
            this.#height = newHeight
        }
        //set rect height
        const rect = this.getChildByName("rect")
        rect.height = this.#height
    }
    get height() {
        return this.#height
    }
    #color = undefined
    set color(newColor) {
        if (newColor === undefined) {
            this.#color = 'aliceblue'
        }
        else if (newColor === "random") {
            this.#color = randomColor()
        }
        else {
            this.#color = newColor
        }
        //set rect color
        const rect = this.getChildByName("rect")
        rect.fill = this.#color
    }
    get color() {
        return this.#color
    }
    #text = undefined
    set text(newText) {
        this.#text = (newText === undefined) ? "" : newText;
        //pass text to element
        const text = this.getChildByName("text")
        text.text = this.#text
    }
    get text() {
        return this.#text
    }

    #clickOnInput = async (event) => {
        const entered = window.prompt(this.message, this.text);
        if (entered === null) {
            return
        }
        this.text = entered

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
        this.text = attrs.text
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
            message: this.message,
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
        return new GameTextInput(attrs.center,attrs)
    }
}

export {GameTextInput}