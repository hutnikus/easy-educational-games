# Easy educational games

# How to install:

1) Create package.json:
`npm init -y`

2) Install this package:
`npm install easy-educational-games --save`


Your file tree now looks like this:
```
dir_name/
    node_modules/
        ...
        easy-educational-games/
            public/
                modules/
                    ...
            package.json
            server.mjs
        ...
    package.json
    package-lock.json
```

3) Create a directory: `dir_name/public/`
   - your client side will be in here (.html, .css, .js files)
   - image resources also

4) `dir_name/public/index.html` is your test page. Feel free to copy this code:
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            #game {
                border: 1px solid;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%,-50%);
            }
        </style>
    </head>
    <body>
        <canvas id="game"></canvas>
    </body>

    <script type="module" src="./game.js"></script>
</html>
```

5) `dir_name/public/game.js` is your test game. Feel free to test on this:
```javascript
import {Game, GameElement, GameText, GameShape, GameImage, GameGif} from "../modules/index.js"

const canvas = document.getElementById('game');
canvas.width = 600;
canvas.height = 600;

const game = new Game(canvas);

const text1 = new GameElement(300,300,
        [
           new GameText('text',{level:1}),
           new GameShape('rectangle',{width:100,height:50,fill:'red',level:0}),
           // new GameShape('rectangle',{width:100,height:100,stroke:'black',lineWidth:2,level:1}),
           // new GameText('level1',{level:1}),
           // new GameShape('oval',{rX:100,rY:100,fill:'red',level:1,rotation:0.2,stroke:'black',lineWidth:20}),
           // new GameShape('oval',{rX:50,rY:20,dx:200,fill:'red',level:1,rotation:0.4}),
           // new GameShape('polygon',{name:'poly center',level:6, coords:[-100,-5,10,-10,30,30],fill:'red',rotation:0.3}),
           // new GameShape('polygon',{name:'poly right',level:6,dx:200, coords:[-100,-5,10,-10,30,30],fill:'red',rotation:0.3}),
           // new GameShape('line',{level:6, coords:[-100,-5,10,-10,30,30,200,-200],stroke:'black',lineWidth:50,}),
           // new GameShape('line',{level:7, coords:[-100,-5,10,-10,30,30,200,-200],stroke:'red',lineWidth:2,}),
           // new GameImage('frog','png',{level:0,width:100,height:100,rotation:0.8}),
           // new GameImage('frog','png',{level:0,dx:200,width:200,height:100,rotation:-0.8}),
           // new GameGif('jump',{level:0,width:200,height:200}),
           // new GameGif('colors',{level:-1,stagger:10,width:300,height:300}),
        ],
        {clickable:true}
)
game.addElement(text1)

game.animate();
```

6) To show images, you need to create a new folder: `dir_name/public/resources`.
Every image or gif goes there.