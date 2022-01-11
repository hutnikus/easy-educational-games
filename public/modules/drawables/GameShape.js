import {GameDrawable} from "./GameDrawable.js";
import {Point} from "../index.js"

// const Misc = require("../Misc.js")
// const Point = Misc.Point

class GameShape extends GameDrawable {
    type = undefined;       // TYPES = ['rectangle','polygon','oval','line']
    fill = undefined;       // color
    stroke = undefined;     // color
    lineWidth = undefined;  // width of stroke/outline

    // sizes in oval
    rY = undefined;
    rX = undefined;

    coords = undefined;     // points in line / polygon in format [x1,y1,...,xn,yn]

    constructor(type='rectangle',attrs={}) {
        super(attrs)

        function randomColor() {
            return "#"+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)
        }

        this.fill = (attrs.fill === 'random') ? randomColor() : attrs.fill;
        this.stroke = (attrs.stroke === 'random') ? randomColor() : attrs.stroke;
        this.lineWidth = (attrs.lineWidth === undefined) ? 0 : Number(attrs.lineWidth);
        this.type = type;

        if (type === 'rectangle') {
            if (this.width === undefined) {
                console.error('rectangle needs a defined width!');
            }
            if (this.height === undefined) {
                console.error('rectangle needs a defined height!');
            }
        }
        else if (type === 'oval') {
            if (attrs.rX === undefined) {
                console.error('oval needs a defined rX!');
            } else {
                this.rX = Number(attrs.rX);
            }
            if (attrs.rY === undefined) {
                console.error('oval needs a defined rY!');
            } else {
                this.rY = Number(attrs.rY);
            }
        }
        else if (type === 'polygon' || type === 'line') {
            if (attrs.coords === undefined) {
                console.error(type, 'needs a defined array of coords!');
            } else {
                if (!Array.isArray(attrs.coords) || attrs.coords.length % 2 !== 0) {
                    console.error('wrong format, it needs to be an array (of Numbers) of even size!');
                } else {
                    if (type === 'polygon' && attrs.coords.length < 6) {
                        console.error('array of coords must be at least 3 points (6 items) long!');
                    } else {
                        if (type === 'line' && attrs.coords.length < 4) {
                            console.error('array of coords must be at least 2 points (4 items) long!');
                        } else {
                            this.coords = attrs.coords;
                        }
                    }
                }
            }
        }
    }

    addPoint(point) {
        if (this.coords === undefined) {
            throw "Undefined coords!"
        }
        this.coords.push(point.x,point.y)
    }

    draw(ctx,center) {
        ctx.color = this.fill

        if (this.type === 'rectangle') {
            ctx.save()
            ctx.translate(center.x+this.dx,center.y+this.dy)
            ctx.rotate(this.rotation)
            if (this.fill !== undefined) {
                ctx.fillStyle = this.fill;
                ctx.fillRect(- (this.width / 2), - (this.height / 2), this.width, this.height)
            }
            if (this.stroke !== undefined) {
                ctx.strokeStyle = this.stroke
                ctx.lineWidth = this.lineWidth
                ctx.strokeRect((this.dx) - (this.width / 2), (this.dy) - (this.height / 2), this.width, this.height)
            }
            ctx.restore()
        }
        else if (this.type === 'oval') {
            if (this.fill !== undefined) {
                ctx.fillStyle = this.fill;
                ctx.beginPath();
                ctx.ellipse(center.x+this.dx,center.y+this.dy,this.rX,this.rY,this.rotation,0,2*Math.PI);
                ctx.fill();
            }
            if (this.stroke !== undefined) {
                ctx.strokeStyle = this.stroke
                ctx.lineWidth = this.lineWidth
                ctx.beginPath();
                ctx.ellipse(center.x+this.dx,center.y+this.dy,this.rX,this.rY,this.rotation,0,2*Math.PI);
                ctx.stroke();
            }
        }
        else if (this.type === 'polygon' || this.type === 'line') {
            ctx.save()
            ctx.translate(center.x+this.dx,center.y+this.dy)
            ctx.rotate(this.rotation)
            if (this.fill !== undefined && this.type === 'polygon') {
                ctx.fillStyle = this.fill;
                ctx.beginPath();
                ctx.moveTo(this.coords[0],this.coords[1])
                for (let i = 2; i < this.coords.length-1; i+=2) {
                    ctx.lineTo(this.coords[i],this.coords[i+1])
                }
                ctx.closePath()
                ctx.fill();
            }
            if (this.stroke !== undefined) {
                ctx.strokeStyle = this.stroke
                ctx.lineWidth = this.lineWidth
                ctx.beginPath();
                ctx.moveTo(this.coords[0],this.coords[1])
                for (let i = 2; i < this.coords.length-1; i+=2) {
                    ctx.lineTo(this.coords[i],this.coords[i+1])
                }
                if (this.type === 'polygon') {
                    ctx.closePath()
                }
                ctx.stroke()
            }
            ctx.restore()
        }
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

    // I'll just leave this here so I can ponder my pain

    // isInside(centeredMouse) {
    //     centeredMouse.x -= this.dx
    //     centeredMouse.y -= this.dy
    //
    //     if (this.type === 'rectangle') {
    //         let topleft = new Point(- (this.width / 2) - (this.lineWidth/2),- (this.height/ 2) - (this.lineWidth/2))
    //
    //         let rotatedX = centeredMouse.x * Math.cos(-this.rotation) - centeredMouse.y * Math.sin(-this.rotation);
    //         let rotatedY = centeredMouse.y * Math.cos(-this.rotation) + centeredMouse.x * Math.sin(-this.rotation);
    //
    //         let horizontal = topleft.x <= rotatedX && rotatedX <= topleft.x + this.width + this.lineWidth
    //         let vertical = topleft.y <= rotatedY && rotatedY <= topleft.y + this.height + this.lineWidth
    //
    //         return horizontal && vertical
    //     }
    //     else if (this.type === 'oval') {
    //         let a,b,f1,f2
    //         if (this.rX > this.rY) {
    //             // console.log('na sirku')
    //             //na sirku
    //             a = this.rX + this.lineWidth/2
    //             b = this.rY + this.lineWidth/2
    //             let f = Math.sqrt(Math.pow(a,2)-Math.pow(b,2))
    //
    //             f1 = new Point(-f * Math.cos(this.rotation), -f * Math.sin(this.rotation))
    //             f2 = new Point(f * Math.cos(this.rotation), f * Math.sin(this.rotation))
    //         }
    //         else {
    //             // console.log('na vysku')
    //             a = this.rY + this.lineWidth/2
    //             b = this.rX + this.lineWidth/2
    //             let f = Math.sqrt(Math.pow(a,2)-Math.pow(b,2))
    //
    //             f1 = {
    //                 x: 0 - -f * Math.sin(this.rotation),
    //                 y: -f * Math.cos(this.rotation)
    //             }
    //             f2 = {
    //                 x: 0 - f * Math.sin(this.rotation),
    //                 y: f * Math.cos(this.rotation)
    //             }
    //             f1 = new Point(0 - -f * Math.sin(this.rotation), -f * Math.cos(this.rotation))
    //             f2 = new Point(0 - f * Math.sin(this.rotation), f * Math.cos(this.rotation))
    //         }
    //
    //         let d1 = centeredMouse.distanceTo(f1);
    //         let d2 = centeredMouse.distanceTo(f2);
    //
    //         return d1 + d2 < 2 * a;
    //
    //     }
    //     else if (this.type === 'polygon') {
    //         //this doesn't work with line width
    //         const vs = []
    //         for (let i = 0; i < this.coords.length-1; i+=2) {
    //             vs.push([this.coords[i],this.coords[i+1]])
    //         }
    //         let rotatedX = centeredMouse.x * Math.cos(-this.rotation) - centeredMouse.y * Math.sin(-this.rotation);
    //         let rotatedY = centeredMouse.y * Math.cos(-this.rotation) + centeredMouse.x * Math.sin(-this.rotation);
    //
    //         return insidePolygon(new Point(rotatedX,rotatedY),vs)
    //     }
    //     else if (this.type === 'line') {
    //         //this doesn't work for sharp edges but close enough
    //         for (let i = 0; i < this.coords.length-3; i+=2) {
    //             const lp1 = new Point(this.coords[i], this.coords[i+1])
    //             const lp2 = new Point(this.coords[i+2], this.coords[i+3])
    //             const angle = getLineAngle(lp1,lp2)
    //             const lineLength = lp1.distanceTo(lp2)
    //
    //             let topleft = new Point(lp1.x,lp1.y-this.lineWidth/2)
    //
    //             let rotatedX = (centeredMouse.x - lp1.x) * Math.cos(-angle) - (centeredMouse.y - lp1.y) * Math.sin(-angle);
    //             let rotatedY = (centeredMouse.y - lp1.y) * Math.cos(-angle) + (centeredMouse.x - lp1.x) * Math.sin(-angle);
    //
    //             rotatedX += lp1.x
    //             rotatedY += lp1.y
    //
    //             let horizontal = topleft.x <= rotatedX && rotatedX <= topleft.x + lineLength
    //             let vertical = topleft.y <= rotatedY && rotatedY <= topleft.y + this.lineWidth
    //
    //
    //             if (horizontal && vertical) {
    //                 return true
    //             }
    //         }
    //         return false
    //     }
    // }
}

function getDistanceLinePoint(lp1, lp2, p) {
    return ((Math.abs((lp2.y - lp1.y) * p.x - (lp2.x - lp1.x) * p.y + lp2.x * lp1.y - lp2.y * lp1.x)) / lp1.distanceTo(lp2))
}

function getLineAngle(lp1, lp2) {
    const x = lp2.x - lp1.x
    const y = lp2.y - lp1.y

    return Math.atan2(y,x)
}

function triangleArea(p1, p2, p3) {
    return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y)+ p3.x * (p1.y - p2.y))/2);
}

function insidePolygon(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    const x = point.x, y = point.y;

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

// module.exports = GameShape

export {GameShape}