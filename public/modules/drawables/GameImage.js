// const Misc = require("../Misc.js")
// const Point = Misc.Point

import {GameDrawable, loadImage} from "./GameDrawable.js";

/**
 * Image drawable class
 * @extends GameDrawable
 *
 * @property {Image|Promise<Image>} img Image to be drawn.
 */
class GameImage extends GameDrawable {
    /**
     * Constructor of Image drawable
     * @param {string} imageName Name of the image in resources
     * @param {Object} attrs Attribute object
     */
    constructor(imageName,attrs={}) {
        super(attrs)

        if (imageName === undefined) {
            this.img = attrs.img
            return
        }

        const url = `resources/${imageName}`
        this.img = loadImage(url)
    }

    /**
     * Called when drawing
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     * @returns {Promise<void>}
     */
    async drawFunction(ctx) {
        ctx.drawImage(
            await this.img,
            -(this.width / 2), -(this.height / 2),this.width,this.height
        );
    }

    /**
     * Checks parameters and calls parent draw() method
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     * @param {Point} center Center Point of parent Element
     * @returns {Promise<void>}
     */
    async draw(ctx,center) {
        if (this.width !== undefined && this.height !== undefined) {
            await super.draw(ctx,center,this)
        } else {
            this.width = this.img.width
            this.height = this.img.height
            await this.draw(ctx, center)
        }
    }

    /**
     * Returns true when mouse is inside drawable.
     * @param {Point} mouse Mouse position on canvas.
     * @param {CanvasRenderingContext2D} tempContext Hidden rendering context to check pixel state.
     * @param {Point} center Center Point of parent Element
     * @returns {Promise<boolean>} True when mouse is inside drawable, false otherwise.
     */
    async isInside(mouse, tempContext, center) {
        const drawFunction = async function (ctx, attrs) {
            await attrs.obj.draw(ctx,attrs.center.x,attrs.center.y)
        }
        const drawAttrs = {
            obj: this,
            center: center.copy()
        }
        return await super.isInside(mouse, tempContext, drawFunction, drawAttrs)
    }

    /**
     * Returns object of attributes of current instance.
     * @returns {Object} Attribute object.
     */
    getAttrs() {
        return Object.assign({
            img : this.img,
        },super.getAttrs())
    }

    /**
     * Returns copy of current instance.
     * @param {string} newName Name of the newly created instance. Names have to be unique.
     * @returns {GameImage} New instance of GameImage with the same attributes.
     */
    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameImage(undefined,attrs)
    }
}

// module.exports = GameImage

export { GameImage }