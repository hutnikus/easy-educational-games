// const Misc = require("../Misc.js")
// const Point = Misc.Point

import {GameDrawable, loadImage} from "./GameDrawable.js";

class GameImage extends GameDrawable {
    img = undefined;

    constructor(imageName,attrs={}) {
        super(attrs)

        if (imageName === undefined) {
            this.img = attrs.img
            return
        }

        const url = `resources/${imageName}`
        this.img = loadImage(url)
    }

    async drawFunction(ctx) {
        ctx.drawImage(
            await this.img,
            -(this.width / 2), -(this.height / 2),this.width,this.height
        );
    }

    async draw(ctx,center) {
        if (this.width !== undefined && this.height !== undefined) {
            await super.draw(ctx,center,this)
        } else {
            this.width = this.img.width
            this.height = this.img.height
            await this.draw(ctx, center)
        }
    }

    async isInside(mouse, tempContext, centerX, centerY) {
        const drawFunction = async function (ctx, attrs) {
            await attrs.obj.draw(ctx,attrs.center.x,attrs.center.y)
        }
        const drawAttrs = {
            obj: this,
            center: {
                x: centerX,
                y: centerY
            }
        }
        return await super.isInside(mouse, tempContext, drawFunction, drawAttrs)
    }

    getAttrs() {
        return Object.assign({
            img : this.img,
        },super.getAttrs())
    }

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