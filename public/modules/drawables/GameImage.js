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
        if (this.width === undefined) {
            this.width = this.img.width
        }
        if (this.height === undefined) {
            this.height = this.img.height
        }
        ctx.drawImage(
            this.img,
            -(this.width / 2), -(this.height / 2),this.width,this.height
        );
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