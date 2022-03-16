import {GameElement} from "./GameElement.js";
import {Point, randomColor} from "../Misc.js";
import {GameShape} from "../drawables/GameShape.js";
import {GameText} from "../drawables/GameText.js";
import {GameDrawable} from "../drawables/GameDrawable.js";

/**
 * GameButton class. Handles drawing and clicking for the button.
 * @extends GameElement
 *
 * @property {number} width Width of the button
 * @property {number} height Height of the button
 * @property {string} color CSS color string. Color of the button
 * @property {string} text Text displayed on the button
 * @property {Array<function>} onPress Array of callbacks to be triggered on button press
 * @property {GameDrawable} highlight Rectangle that highlights the button while pressed
 * @property {GameDrawable} rectangle Button body
 */
class GameButton extends GameElement {
    #width = undefined
    set width(newW) {
        if (newW === undefined) {
            this.#width = 100
        } else {
            this.#width = newW
        }
        if (this.textDrawable) this.textDrawable.maxWidth = this.#width - 10
        if (this.highlight) this.highlight.width = this.#width
        if (this.rectangle) this.rectangle.width = this.#width
    }
    get width() {
        return this.#width
    }
    #color = undefined
    set color(newColor) {
        if (newColor === "random") {
            this.#color = randomColor()
        } else {
            this.#color = newColor
        }
        if (this.rectangle) {
            this.rectangle.fill = this.#color
        }
    }
    get color() {
        return this.#color
    }
    #text = undefined
    set text(newText) {
        this.#text = newText
        if (this.textDrawable) {
            this.textDrawable.text = this.#text
        }
    }
    get text() {
        return this.#text
    }

    set textColor(newColor) {
        this.textDrawable.color = newColor
    }

    /**
     * Highlights the button on press
     */
    #selectButton = () => {
        this.highlight.visible = true
    }
    /**
     * Disables highlight and executes onPress callbacks when mouse is lifted on button
     * @param {Event} event
     * @returns {Promise<void>}
     */
    #deselectButton = async (event) => {
        const mouse = this.shared.mousePos

        this.highlight.visible = false

        if (await this.isInside(mouse)) {
            for (const callback of this.onPress) {
                callback.call(this,event)
                // callback(event)
            }
        }
    }

    /**
     * Constructor for GameButton
     * @param {Point} center Center point of the element
     * @param {Object} attrs Attribute object
     */
    constructor(center,attrs={}) {
        super(center,[],attrs)
        this.onPress = attrs.onPress || []

        this.text = attrs.text;

        this.textDrawable = new GameText(this.text,{level:0,})
        this.addChild(this.textDrawable)

        this.textColor = attrs.textColor

        this.width = attrs.width
        this.height = (attrs.height === undefined) ? 50 : attrs.height
        this.color = attrs.color || 'lightgrey'

        this.rectangle = new GameShape('rectangle',{
                width:this.width,
                height:this.height,
                fill:this.color,
                level:-1,
                stroke: 'black',
                lineWidth: 5
            }
        )
        this.addChild(this.rectangle)

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

        this.addOnClickListener(this.#selectButton)
        this.addOnFinishDraggingListener(this.#deselectButton)
    }

    /**
     * Adds a listener to be called on button press
     * @param {function} callback Function to be called
     */
    addOnButtonPressListener(callback) {
        this.onPress.push(callback)
    }

    /**
     * Removes listener for the onButtonPress event
     * @param {function} callback function you want to remove
     */
    removeOnButtonPressListener(callback) {
        this.onPress = this.onPress.filter(item=>item!==callback)
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
            onPress: [...this.onPress],
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameButton} New instance with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        const retButton = new GameButton(attrs.center,attrs)
        // remove selecting of this instance
        retButton.removeOnClickListener(this.#selectButton)
        retButton.removeOnFinishDraggingListener(this.#deselectButton)
        return retButton
    }
}

export {GameButton}