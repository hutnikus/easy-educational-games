import {GameDrawable, loadImage} from "./GameDrawable.js";

/**
 * Image drawable class
 * @extends GameDrawable
 *
 * @property {Image} img Image to be drawn.
 */
class GameImage extends GameDrawable {
    #img = undefined
    get img() {return this.#img}

    /**
     * Setter for images
     * @param {string} imageName Name of image in the resource folder
     */
    setImg(imageName) {
        this.#img = undefined
        const url = `resources/${imageName}`

        loadImage(url).then(value => {
            this.#img = value
        })
    }

    /**
     * Constructor of Image drawable
     * @param {string} imageName Name of the image in resources
     * @param {Object} attrs Attribute object
     */
    constructor(imageName,attrs={}) {
        super(attrs)

        if (imageName === undefined) {
            this.#img = attrs.img
            return
        }

        this.setImg(imageName)
    }

    /**
     * Called when drawing
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     */
    drawFunction(ctx) {
        if (!this.img) {
            return
        }
        ctx.drawImage(
            this.img,
            -(this.width / 2), -(this.height / 2),this.width,this.height
        );
    }

    /**
     * Checks parameters and calls parent draw() method
     * @param {CanvasRenderingContext2D} ctx Rendering context on which the method draws
     * @param {Point} center Center Point of parent Element
     */
    draw(ctx,center) {
        if (this.width !== undefined && this.height !== undefined) {
            super.draw(ctx,center,this)
        } else {
            if (!this.img) {
                return
            }
            this.width = this.img.width
            this.height = this.img.height
            this.draw(ctx, center)
        }
    }

    /**
     * Returns true when mouse is inside drawable.
     * @param {Point} mouse Mouse position on canvas.
     * @param {CanvasRenderingContext2D} tempContext Hidden rendering context to check pixel state.
     * @param {Point} center Center Point of parent Element
     * @returns {boolean} True when mouse is inside drawable, false otherwise.
     */
    isInside(mouse, tempContext, center) {
        const drawFunction = function (ctx, attrs) {
            attrs.obj.draw(ctx,attrs.center.x,attrs.center.y)
        }
        const drawAttrs = {
            obj: this,
            center: center.copy()
        }
        return super.isInside(mouse, tempContext, drawFunction, drawAttrs)
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

export { GameImage }