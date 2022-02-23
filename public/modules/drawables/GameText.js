import {GameDrawable} from "./GameDrawable.js";

//todo add rotation and isinside

class GameText extends GameDrawable {
    color = undefined;
    text = undefined;
    font = undefined;

    constructor(text='sample text',attrs={}) {
        super(attrs)
        this.text = text;
        this.color = (attrs.color === undefined) ? 'black' : attrs.color;
        this.font = (attrs.font === undefined) ? '20px arial' : attrs.font;
    }

    drawFunction(ctx) {
        ctx.font = this.font;
        ctx.color = this.color
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.text,0,0)
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
}

// module.exports = GameText

export { GameText }