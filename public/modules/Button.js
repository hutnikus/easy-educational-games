import GameObject from "./GameObject.js";

export default class Button extends GameObject{
    constructor(x,y,width,height,text,color='lightgrey',font='20px arial') {
        super(x,y,width,height,'button');
        super.clickable = true
        super.color = color
        super.text = text
        super.stroke = 'black'
        super.textFont = font

        super.level = 2;
    }
}