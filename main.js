window.onload = function(){

    let main = document.getElementById('main');
    const app = new PIXI.Application({ antialias: true,width: main.offsetWidth,height:main.offsetWidth,transparent:true });
    main.appendChild(app.view);
    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);

    let Fireworks = function(_main, _startPoint , _height,_radius , _color ){
        let self = this;
        self.main = _main;
        self.radius     = _radius || self.getRandom(150,300); 
        self.startPoint = _startPoint || self.getRandom(self.main.offsetWidth/3,self.main.offsetWidth/3*2);
        self.height     = _height || self.getRandom(300, parseFloat(self.main.offsetHeight - self.radius)); 
        self.nowHeight  = 0;
        self.gridRadius = 2;
        self.upSpeed    = 800;
        self.upCount    = 5;
        self.downSpeed  = 50;
        self.bombCount  = 20;
        self.bombProgress = 0;
        self.bombListEndPoint   = [];
        self.bombListPoint      = [];
        self.bombListOffset     = [];
        self.bombListControl    = [];
        self.bombCpList         = [];
        self.bombTimeOut        = 30;
        self.offsetList = [-0.5,0,0.5];
        self.bombEnd = false;
        self.type = 'liftOff';
        self.colorList = [  {r:255,g:  0,b:  0,o:1},
                            {r:  0,g:255,b:  0,o:1},
                            {r:  0,g:  0,b:255,o:1},
                            {r:255,g:255,b:  0,o:1},
                            {r:  0,g:255,b:255,o:1},
                            {r:255,g:  0,b:255,o:1}];
        self.color = _color || self.colorList[self.getRandom(0,6)];
        
        // self.canvas.width  = self.radius * 2;
        // self.canvas.height = parseFloat(self.height + self.radius);

        self.bombOrigin = { x : self.radius ,
                            y : parseFloat(parseFloat(self.height + self.radius) - self.height)};
        for(let item = 0 ;item< self.bombCount;item++){
            let distance = self.getRandom( self.radius/10 , self.radius );
            let angle    = self.getRandom( 0 , 360 );
            Math.sin( angle * Math.PI / 180 ) * distance;
            self.bombListEndPoint.push({x : Math.cos( angle * Math.PI / 180 ) * distance,
                                        y : Math.sin( angle * Math.PI / 180 ) * distance});
            self.bombListPoint.push({   x : self.bombOrigin.x,
                                        y : self.bombOrigin.y});

            self.bombListControl.push({ x : self.bombOrigin.x + (self.bombListEndPoint[item].x/2),
                                        y : self.bombOrigin.y + (self.bombListEndPoint[item].y/2) - (self.radius/4) });
            self.bombListOffset.push({  x : self.bombListEndPoint[item].x / self.bombTimeOut,
                                        y : self.bombListEndPoint[item].y / self.bombTimeOut});
            self.bombCpList.push([self.bombOrigin,
                                  self.bombListControl[item],
                                 {  x: self.bombOrigin.x +self.bombListEndPoint[item].x,
                                    y: self.bombOrigin.y +self.bombListEndPoint[item].y
                                }]);
        }

        const graphics = new PIXI.Graphics();
        graphics.x = parseFloat(self.startPoint - self.radius);
        graphics.y = parseFloat(self.main.offsetHeight -self.height - self.radius);
        
        app.stage.addChild(graphics);
        //清空
        self.clearRect = ()=>{
            // ctx.clearRect(0,0,self.canvas.offsetWidth,self.canvas.offsetHeight);
            graphics.clear();
        }
        //昇空
        self.liftOff = ()=>{
            if(self.height <= self.nowHeight){
                self.type = 'bomb';
                if(self.color.r !== 255){self.color.r = 150};
                if(self.color.g !== 255){self.color.g = 150};
                if(self.color.b !== 255){self.color.b = 150};
            }
            for(let item = 0;item < self.upCount ;item++){
                // graphics.beginFill('0x' + self.color.r.toString(16) + self.color.g.toString(16) + self.color.b.toString(16),self.color.o * (( self.upCount-item)/self.upCount));
                graphics.beginFill('0xCCCCCC',0.5 / (1+item*6));
                

                graphics.drawCircle(self.radius - (self.gridRadius/2) + (self.offsetList[self.getRandom(0,3)] * item / 2 ),
                                    parseFloat(self.height + self.radius) - (self.nowHeight - (self.gridRadius/2)) + item * (self.upSpeed / 60) ,
                                    self.gridRadius * ((1+item/2)/1));
                graphics.endFill();
            }
            self.nowHeight += (self.upSpeed / 60);
        }
        //爆炸
        self.bomb = ()=>{
            // console.log(self.bombProgress);
            
            for(let item = 0;item < self.bombCount ;item++){
                // let BezierData = self.quadraticCurvePoint(self.bombCpList[item], self.bombProgress/self.bombTimeOut);
                // graphics.lineStyle(3, '0x' + self.color.r.toString(16) + self.color.g.toString(16) + self.color.b.toString(16), 1);
                // graphics.moveTo(self.bombOrigin.x,self.bombOrigin.y);
                // graphics.bezierCurveTo(self.bombOrigin.x,self.bombOrigin.y,
                //                         BezierData[1].x,BezierData[1].y,
                //                         BezierData[0].x,BezierData[0].y);
                    for(let item2 = 0 ; item2 < 40;item2++){
                        if(self.bombProgress-item2 <= 0 ){break;}
                        let radius;
                        let BezierData = self.quadraticCurvePoint(self.bombCpList[item], (self.bombProgress-item2)/self.bombTimeOut);
                        graphics.beginFill('0x' + self.color.r.toString(16) + self.color.g.toString(16) + self.color.b.toString(16),
                                            self.color.o *((self.bombTimeOut - item2)/self.bombTimeOut)/3 );
                        
                        if(item2 !== 0 ){
                            radius = self.gridRadius * ((self.bombTimeOut - item2)/self.bombTimeOut);
                        }else{
                            graphics.drawCircle(BezierData[0].x,
                                BezierData[0].y,
                                self.gridRadius * 1.5);
                            graphics.endFill();
                            graphics.beginFill('0xFFFFFF',1);
                            radius = self.gridRadius;
                        }
                        graphics.drawCircle(BezierData[0].x,
                                            BezierData[0].y,
                                            radius);
                        graphics.endFill();
                    }

                if( parseInt(self.bombListPoint[item].x) == parseInt(self.bombOrigin.x + self.bombListEndPoint[item].x) &&
                    parseInt(self.bombListPoint[item].y) == parseInt(self.bombOrigin.y + self.bombListEndPoint[item].y)){
                    self.type = 'comeDown';
                    self.color.o = 0.1;
                    break;
                }
                self.bombListPoint[item].x += self.bombListOffset[item].x;
                self.bombListPoint[item].y += self.bombListOffset[item].y;
            }
            self.bombProgress++;
        }
        //墜落
        self.comeDown = ()=>{
            if(self.color.o <= 0){
                self.type = 'delete';
            }
            for(let item = 0;item < self.bombCount ;item++){
                let opennessList = [1/self.downSpeed,self.color.o];
                let openness = opennessList[self.getRandom(0,2)];
                graphics.lineStyle(3,'0x' + self.color.r.toString(16) + self.color.g.toString(16) + self.color.b.toString(16),openness);
                graphics.drawCircle(self.bombListPoint[item].x,
                                    self.bombListPoint[item].y,
                                    self.gridRadius/2);
                graphics.endFill();
                self.bombListPoint[item].y += (self.downSpeed / 60);
                self.bombListPoint[item].x += self.offsetList[self.getRandom(0,3)];
                self.color.o-=0.00004;
            }
        }
        self.delete =()=>{
            app.ticker.remove(() => {
                self.draw();
            })
        }
        self.draw = ()=>{
            self.clearRect();
            switch(self.type){
                case 'liftOff':
                    self.liftOff();    
                    break;
                case 'bomb':
                    self.bomb();
                    break;
                case 'comeDown':
                    self.comeDown();
                    break;
                case 'delete':
                    self.delete();
                    // self.main.removeChild(self.canvas);
                    return;
                    break;
                default:
                    break;
            }
        }
        app.ticker.add(() => {
            self.draw();
        })
    }

    Fireworks.prototype.getRandom =(min,max)=>{//隨機
        let disparity = max - min;
        return Math.floor(Math.random() * disparity)+min;
    };
    Fireworks.prototype.quadraticCurvePoint = (cp,t)=>{
        let ax,ay,bx,by,b,result = {x:0,y:0};
        ax = cp[0].x + (cp[1].x - cp[0].x) * t;
        ay = cp[0].y + (cp[1].y - cp[0].y) * t;
        bx = cp[1].x + (cp[2].x - cp[1].x) * t;
        by = cp[1].y + (cp[2].y - cp[1].y) * t;
        
        result.x = ax + (bx - ax) * t;
        result.y = ay + (by - ay) * t;
        // return [result,{x:ax,y:ay}];
        return [result];
    }

    let getRandom =(min,max)=>{//隨機
        let disparity = max - min;
        return Math.floor(Math.random() * disparity)+min;
    };
    let timestamp = 0 , progress = 0;
    app.ticker.add(() => {
        timestamp += 1;
        if(progress > timestamp)return;
        let colorList = [
            {r:255,g:  0,b:  0,o:1},
            {r:  0,g:255,b:  0,o:1},
            {r:  0,g:  0,b:255,o:1},
            {r:255,g:255,b:  0,o:1},
            {r:  0,g:255,b:255,o:1},
            {r:255,g:  0,b:255,o:1}
        ];
        let startPoint = getRandom(main.offsetWidth/3,main.offsetWidth/3*2);
        let height     = getRandom(300, parseFloat(main.offsetHeight - 300)); 
        let radius     = getRandom(200,300);
        let randowmColor = getRandom(0,colorList.length);
        new Fireworks(main,startPoint,height,radius,colorList[randowmColor]);
        colorList.splice(randowmColor, 1);
        new Fireworks(main,startPoint,height,radius,colorList[getRandom(0,colorList.length)]);
        progress += getRandom(1,2) * 30;
    });
}