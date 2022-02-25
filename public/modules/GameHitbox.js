import {Point} from "./Misc.js";

class GameHitbox {
    delta = undefined       //point dx dy
    r = undefined           //radius from center + delta

    constructor(r,dx=0,dy=0, ) {
        if (r <= 0) {
            throw "Hitbox needs a valid radius"
        }
        this.r = r
        this.delta = Point(
            (dx === undefined) ? 0 : Number(dx),
            (dy === undefined) ? 0 : Number(dy),
        )
    }

    draw(ctx, center) {
        ctx.strokeStyle = 'red'
        ctx.lineWidth = 5
        ctx.beginPath();
        const p = this.delta.copy()
        ctx.ellipse(p.x,p.y,this.r,this.r,0,0,2*Math.PI);

        ctx.strokeStyle = 'red'
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.strokeStyle = 'green'
        ctx.lineWidth = 2
        ctx.stroke()
    }
}

export {GameHitbox}