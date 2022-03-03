import {GameDrawable} from "./GameDrawable.js";

//todo add rotation and isinside

class GameText extends GameDrawable {
    color = undefined;
    text = undefined;
    font = undefined;
    maxWidth = undefined;

    constructor(text='sample text',attrs={}) {
        super(attrs)
        this.text = text;
        this.color = (attrs.color === undefined) ? 'black' : attrs.color;
        this.font = (attrs.font === undefined) ? '20px arial' : attrs.font;
        this.maxWidth = attrs.maxWidth
    }

    drawFunction(ctx) {
        ctx.font = this.font;
        ctx.color = this.color
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.text,0,0,this.maxWidth)
    }

    async draw(ctx,center) {
        await super.draw(ctx,center,this)
    }

    async isInside(mouse, tempContext, center) {
        const drawFunction = async function (ctx, attrs) {
            await attrs.obj.draw(ctx,attrs.center)
        }
        const drawAttrs = {
            obj: this,
            center: center
        }
        return await super.isInside(mouse, tempContext, drawFunction, drawAttrs)
    }

    getAttrs() {
        return Object.assign({
            color : this.color,
            text : this.text,
            font : this.font,
            maxWidth : this.maxWidth,
        },super.getAttrs())
    }

    copy(newName) {
        const attrs = this.getAttrs()
        if (newName === undefined) {
            attrs.name = (attrs.name === undefined) ? undefined : attrs.name + "_copy"
        } else {
            attrs.name = newName
        }
        return new GameText(attrs.text,attrs)
    }

    measureText(ctx) {
        ctx.font = this.font;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        return ctx.measureText(this.text)
    }
}

// module.exports = GameText

export { GameText }