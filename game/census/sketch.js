var backgroundImage;

var numCounted=0;
var numTotal;

//sprites
var windowArray=[];
var windowPositions=[[122,194],[185,190]
                    ,[122,270],[185,265]
                    ,[122,345],[185,340]
                    ,[300,105],[365,100]
                    ,[300,170],[365,165]
                    ,[300,260],[365,255]
                    ,[300,330],[365,325]
                    ,[430,160],[485,155]
                    ,[435,240],[490,235]
                    ,[440,310],[495,305]
                    ,[600, 75],[660,70]
                    ,[600,150],[660,145]
                    ,[600,230],[660,225]
                    ,[600,300],[660,295]];

var thePublic;
var publicIncrements=5;

var font, fontsize = 30;

function preload(){
  font = loadFont('assets/Montserrat-ExtraBold.ttf');
}

function setup() {
  // put setup code here
  backgroundImage = loadImage('assets/background.png');
  var canvas = createCanvas(800, 600);
  canvas.parent('census-holder'); 
  noStroke();

  textFont(font);
  textSize(fontsize);
  textAlign(LEFT, TOP);

  numTotal = windowPositions.length;

  for (var i=0; i<numTotal; i++){

    wo = createSprite(windowPositions[i][0],windowPositions[i][1]);
    wo.addImage(loadImage('assets/windowA_empty.png'));
    wo.addAnimation('empty','assets/windowA_empty.png');
    wo.addAnimation('outline','assets/windowA_outline.png');

    w = createSprite(windowPositions[i][0],windowPositions[i][1]);  
    w.addImage(loadImage('assets/windowA_1.png'));
    w.addAnimation('empty','assets/windowA_1.png');
    w.addAnimation('count','assets/windowA_2.png');
    w.addAnimation('hover','assets/windowA_3.png');

    windowArray[i] = new buildingWindow(1,w,wo);
  }

  thePublic = createSprite(400,410);
  thePublic.addImage(loadImage('assets/park1.png'));
  for (var i=0; i<publicIncrements; i++){
    thePublic.addAnimation(i.toString(),'assets/park'+(i+1)+'.png');
  }
} 

function draw() {
  // put drawing code here
  background(backgroundImage);

  for (var i=0; i<numTotal; i++){
    if (windowArray[i].windowSprite.mouseIsOver){
      windowArray[i].hover(true);
    }else{
      windowArray[i].hover(false);
    }
  }

  var progress = (numCounted/numTotal)*(publicIncrements-1);
  thePublic.changeAnimation(min(Math.floor(progress),publicIncrements-1).toString());

  drawSprites();

  fill(0);
  text(numCounted.toString() + " counted",15,15);
}

class buildingWindow{
  constructor(t,s,o){
    //variables
    this.type = t;
    this.windowSprite = s;
    this.windowOutline = o;

    this.windowSprite.mouseActive = true;

    this.isCounted = false;

    //events
    this.windowSprite.onMousePressed = function(){
      this.isCounted = !this.isCounted;
      if (this.isCounted){
        this.changeAnimation('count');
        numCounted = min(numCounted+1,numTotal);
      }else{
        this.changeAnimation('empty');
        numCounted = max(numCounted-1, 0);
      }
    };
  }
  hover(isOn){
    if (isOn){
      this.windowOutline.changeAnimation('outline');
    }else{
      this.windowOutline.changeAnimation('empty');
    }
  }
}