window.onload = function(){

    let main = document.getElementById('main');
    const app = new PIXI.Application({ antialias: true,width: main.offsetWidth,height:main.offsetHeight,transparent:true });
    // 新增至頁面
    main.appendChild(app.view);

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
        self.bomb = {
            count           : 30,
            progress        : 0,
            listEndPoint    : [],
            listPoint       : [],
            listOffset      : [],
            listControl     : [],
            cpList          : [],
            timeOut         : 50,
            elementsList    : [],
            end             : false,
            origin : { x : self.radius ,
                       y : parseFloat(parseFloat(self.height + self.radius) - self.height)
                    }
        }
        self.offsetList = [-0.5,0,0.5];
        self.type = 'liftOff';
        self.colorList = [  {r:255,g:  0,b:  0,o:1},
                            {r:  0,g:255,b:  0,o:1},
                            {r:  0,g:  0,b:255,o:1},
                            {r:255,g:255,b:  0,o:1},
                            {r:  0,g:255,b:255,o:1},
                            {r:255,g:  0,b:255,o:1}];
        self.color = _color || self.colorList[self.getRandom(0,6)];

        let gr , texture;
        for(let item = 0 ;item< self.bomb.count;item++){
            let distance = self.getRandom( self.radius/10 , self.radius );
            let angle    = self.getRandom( 0 , 360 );
            Math.sin( angle * Math.PI / 180 ) * distance;
            self.bomb.listEndPoint.push({   x : Math.cos( angle * Math.PI / 180 ) * distance,
                                            y : Math.sin( angle * Math.PI / 180 ) * distance});
            self.bomb.listPoint.push({      x : self.bomb.origin.x,
                                            y : self.bomb.origin.y});
            self.bomb.listControl.push({    x : self.bomb.origin.x + (self.bomb.listEndPoint[item].x/2),
                                            y : self.bomb.origin.y + (self.bomb.listEndPoint[item].y/2) - (self.radius/4) });
            self.bomb.listOffset.push({     x : self.bomb.listEndPoint[item].x / self.bomb.timeOut,
                                            y : self.bomb.listEndPoint[item].y / self.bomb.timeOut});
            self.bomb.cpList.push([self.bomb.origin,
                                  self.bomb.listControl[item],
                                 {  x: self.bomb.origin.x +self.bomb.listEndPoint[item].x,
                                    y: self.bomb.origin.y +self.bomb.listEndPoint[item].y
                                }]);
        }

        const graphics = new PIXI.Graphics();
        graphics.x = parseFloat(self.startPoint - self.radius);
        graphics.y = parseFloat(self.main.offsetHeight -self.height - self.radius);
        
        app.stage.addChild(graphics);
        //清空
        self.clearRect = ()=>{
            // if(self.type !== 'bomb'){
                graphics.clear();
            // }
        }
        //昇空
        self.liftOff = ()=>{
            if(self.height <= self.nowHeight){
                self.type = 'bomb';
                if(self.color.r !== 255){self.color.r = 150};
                if(self.color.g !== 255){self.color.g = 150};
                if(self.color.b !== 255){self.color.b = 150};

                gr = new PIXI.Graphics();  
                gr.beginFill('0x' + self.color.r.toString(16) + self.color.g.toString(16) + self.color.b.toString(16),1);
                gr.drawCircle( self.gridRadius/2,self.gridRadius/2,self.gridRadius);
                gr.endFill();
                
                texture = app.renderer.generateTexture(gr);
            }
            for(let item = 0;item < self.upCount ;item++){
                graphics.beginFill('0xCCCCCC',0.5 / (1+item*6));
                graphics.drawCircle(self.radius - (self.gridRadius/2) + (self.offsetList[self.getRandom(0,3)] * item / 2 ),
                                    parseFloat(self.height + self.radius) - (self.nowHeight - (self.gridRadius/2)) + item * (self.upSpeed / 60) ,
                                    self.gridRadius * ((1+item/2)/1));
                graphics.endFill();
            }
            self.nowHeight += (self.upSpeed / 60);
        }
        //爆炸
        self.bomb.animation = ()=>{
            for(let item = 0;item < self.bomb.count ;item++){
                    if(self.bomb.elementsList.length < item+1){
                        self.bomb.elementsList.push([]);
                    }
                    for(let item2 = 0 ; item2 < 40;item2++){
                        if(self.bomb.progress-item2 <= 0 ){break;}
                        if(self.bomb.elementsList[item].length < item2+1){
                            self.bomb.elementsList[item].push(new PIXI.Sprite(texture));
                            app.stage.addChild(self.bomb.elementsList[item][item2]);
                        }
                        let radius;
                        let BezierData = self.quadraticCurvePoint(self.bomb.cpList[item], (self.bomb.progress-item2)/self.bomb.timeOut);
                        if(item2 === 0 ){
                            graphics.beginFill('0x' + self.color.r.toString(16) + self.color.g.toString(16) + self.color.b.toString(16),
                                            self.color.o);
                            graphics.drawCircle(BezierData[0].x + self.gridRadius/2,
                                                BezierData[0].y + self.gridRadius/2,
                                                self.gridRadius * 1.5);
                            graphics.beginFill('0xFFFFFF',1);
                            graphics.drawCircle(BezierData[0].x + self.gridRadius/2,
                                                BezierData[0].y + self.gridRadius/2,
                                                self.gridRadius * 1);
                        }
                        self.bomb.elementsList[item][item2].x = BezierData[0].x + graphics.x;
                        self.bomb.elementsList[item][item2].y = BezierData[0].y + graphics.y;
                        // self.bomb.elementsList[item][item2].scale.set(radius);
                        self.bomb.elementsList[item][item2].alpha = self.color.o *((self.bomb.timeOut - item2)/self.bomb.timeOut)/3;
                        graphics.endFill();
                    }

                if( parseInt(self.bomb.listPoint[item].x) == parseInt(self.bomb.origin.x + self.bomb.listEndPoint[item].x) &&
                    parseInt(self.bomb.listPoint[item].y) == parseInt(self.bomb.origin.y + self.bomb.listEndPoint[item].y)){
                    self.type = 'comeDown';
                    self.color.o = 0.1;
                    for(let i = 0;i < self.bomb.count ;i++){
                        for(let ii = 1 ; ii < 40;ii++){
                            self.bomb.elementsList[i][ii].destroy;
                            app.stage.removeChild(self.bomb.elementsList[i][ii]);
                        }
                    }
                    break;
                }
                self.bomb.listPoint[item].x += self.bomb.listOffset[item].x;
                self.bomb.listPoint[item].y += self.bomb.listOffset[item].y;
            }
            self.bomb.progress++;
        }
        //墜落
        self.comeDown = ()=>{
            if(self.color.o <= 0){
                self.type = 'delete';
            }
            for(let item = 0;item < self.bomb.count ;item++){
                let opennessList = [1/self.downSpeed,self.color.o];
                let openness = opennessList[self.getRandom(0,2)];
                self.bomb.elementsList[item][0].y += (self.downSpeed / 60);
                self.bomb.elementsList[item][0].y += self.offsetList[self.getRandom(0,3)];
                self.bomb.elementsList[item][0].alpha = openness;
            }
            self.color.o-=0.0005;
        }
        self.delete =()=>{
            for(let item = 0;item < self.bomb.count ;item++){
                self.bomb.elementsList[item][0].destroy;
                app.stage.removeChild(self.bomb.elementsList[item][0]);
            }
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
                    self.bomb.animation();
                    break;
                case 'comeDown':
                    self.comeDown();
                    break;
                case 'delete':
                    self.delete();
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
        timestamp   = 0;
        progress    = getRandom(1,3) * 30;
    });
}