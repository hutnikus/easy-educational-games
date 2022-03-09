import {GameElement} from "./GameElement.js";
import {Point} from "../Misc.js";
import {GameShape} from "../drawables/GameShape.js";
import {GameText} from "../drawables/GameText.js";
import {GameDrawable} from "../drawables/GameDrawable.js";

/**
 * GameButton class. Handles drawing and clicking for the button.
 * @extends GameElement
 *
 * @property {number} width Width of the button todo maxwidth of text inside
 * @property {number} height Height of the button
 * @property {string} color CSS color string. Color of the button
 * @property {string} text Text displayed on the button
 * @property {boolean} selected Is true while holding the button todo remove or make it do something
 * @property {Array<callbackValue>} onPress Array of callbacks and their passed attributes to be triggered on button press
 * @property {GameDrawable} highlight Rectangle that highlights the button while pressed
 */
class GameButton extends GameElement {
    /**
     * Constructor for GameButton
     * @param {Point} center Center point of the element
     * @param {Object} attrs Attribute object
     */
    constructor(center,attrs={}) {
        super(center,[],attrs)
        this.selected = false
        this.onPress = []

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

        this.addOnClickListener(GameButton.#selectButton,this)
        this.addOnFinishDraggingListener(GameButton.#deselectButton,this)
    }

    /**
     * Adds a listener to be called on button press
     * @param {function} callback Function to be called
     * @param {Object} attrs Attribute object that will get passed to the function
     */
    addOnButtonPressListener(callback,attrs) {
        this.onPress.push([callback,attrs])
    }

    /**
     * Highlights the button on click
     * @param {GameButton} self Instance of the button passed on construction
     * @static
     * @private
     */
    static #selectButton(self) {
        self.highlight.visible = true
        self.selected = true
    }

    /**
     * Undos highlight of the button and calls the onPress listeners if mouse is inside
     * @param {GameButton} self Instance of the button passed on construction
     * @returns {Promise<void>}
     * @static
     * @private
     */
    static async #deselectButton(self) {
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