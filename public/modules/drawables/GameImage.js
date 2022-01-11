// const Misc = require("../Misc.js")
// const Point = Misc.Point

import {GameDrawable, loadImage} from "./GameDrawable.js";

class GameImage extends GameDrawable {
    img = undefined;

    constructor(name='',extension='png',attrs={}) {
        super(attrs)

        const url = `resources/${name}.${extension}`
        this.img = loadImage(url)
    }

    async draw(ctx,center) {
        if (this.width !== undefined && this.height !== undefined) {
            ctx.save()
            ctx.translate(center.x+this.dx,center.y+this.dy)
            ctx.rotate(this.rotation)
            ctx.drawImage(
                await this.img,
                -(this.width / 2), -(this.height / 2),this.width,this.height
            );
            ctx.restore()
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
}

// module.exports = GameImage

export { GameImage }