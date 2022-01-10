class GameText {
    name = undefined
    //relative level in parent GameElement
    level = undefined;

    //deviation from center of parent GameElement
    dx = undefined;
    dy = undefined;

    color = undefined;
    text = undefined;
    font = undefined;

    constructor(text='sample text',attrs={}) {
        this.name = attrs.name
        this.text = text;
        this.dx = (attrs.dx === undefined) ? 0 : Number(attrs.dx);
        this.dy = (attrs.dy === undefined) ? 0 : Number(attrs.dy);
        this.color = (attrs.color === undefined) ? 'black' : attrs.color;
        this.font = (attrs.font === undefined) ? '20px arial' : attrs.font;
        this.level = (attrs.level === undefined) ? 1 : Number(attrs.level);
    }

    draw(ctx,centerX,centerY) {
        ctx.font = this.font;
        ctx.color = this.color
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.text,(centerX+this.dx),(centerY+this.dy))
    }

    isInside(centeredMouse) {
        return false
    }
}

// module.exports = GameText

export { GameText }