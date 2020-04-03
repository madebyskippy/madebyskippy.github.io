var backgroundImage;

var numCounted=0;
var numTotalWindows;
var numTotalPopulation;

var currentProgress=0;

var lastClickTime;
var inactivePromptInterval=1000*5; //
var autoPopulateInterval=1000*10; //10 sec
var lastAutoPopulateTime;

//sprites
var windowArray=[];
var windowEmptyArray=[]; //array of indicies of empty windows
var windowPositions=[[122,194],[185,190]
                    ,[122,270],[185,265]
                    ,[122,345],[185,340] //
                    ,[300,105],[365,100]
                    ,[300,175],[365,170]
                    ,[300,250],[365,245]
                    ,[300,330],[365,325] //
                    ,[433,160],[483,155] 
                    ,[438,235],[488,230]
                    ,[443,310],[493,305] //
                    ,[600, 75],[660,70] 
                    ,[600,150],[660,145]
                    ,[600,225],[660,220]
                    ,[600,300],[660,295]];
var windowVariations=[1,1,1,1,1,1,
                      3,3,3,3,3,3,3,3,
                      2,2,2,2,2,2,
                      1,1,1,1,1,1,1,1]; //diff colors for diff buildings

var thePublic;
var publicIncrements=5;

var font, fontsize = 30;

var sparkles=[];

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

  for (var i=0; i<20; i++){
    var s = createSprite(0,0);
    s.addImage(loadImage('assets/shine0.png'));
    s.addAnimation('empty','assets/shine0.png');
    var sa = s.addAnimation('sparkle','assets/shine0.png','assets/shine1.png',
                            'assets/shine2.png','assets/shine3.png',
                            'assets/shine4.png','assets/shine4.png',
                            'assets/shine3.png','assets/shine3.png',
                            'assets/shine4.png','assets/shine4.png',
                            'assets/shine3.png','assets/shine3.png',
                            'assets/shine4.png','assets/shine4.png',
                            'assets/shine3.png','assets/shine5.png',
                            'assets/shine6.png','assets/shine7.png',
                            'assets/shine0.png');
    sa.looping=false;
    s.depth = 6;
    sparkles[i]=s;
  }

  numTotalWindows = windowPositions.length;
  numTotalPopulation=0;

  for (var i=0; i<numTotalWindows; i++){
    var wamount=floor(random(1,4));

    var win = createSprite(windowPositions[i][0],windowPositions[i][1]);
    var windowType = "assets/window"+windowVariations[i].toString()+"_";
    win.addImage(loadImage(windowType+'e.png'));
    win.addAnimation('empty',windowType+'e.png');
    win.addAnimation('outline',windowType+'h.png');
    win.depth=1;

    var ppl = createSprite(windowPositions[i][0],windowPositions[i][1]); 
    ppl.addAnimation('empty','assets/population_empty.png');
    //randomize the variety TODO
    var variety = floor(random(1,3));
    var pplcolor = floor(random(1,4));
    var shirtVariety = floor(random(1,4));
    var hairVariety = floor(random(1,10));
    if (wamount==2){
      variety = floor(random(1,4));
      pplcolor = floor(random(1,7));
    }if (wamount==3){
      pplcolor=floor(random(1,7));
    }
    var pplfilename = 'assets/population_'+wamount.toString()+variety.toString();
    ppl.addAnimation('count',pplfilename+'_body'+pplcolor.toString()+".png"); 
    ppl.depth=2;

    var shirt = createSprite(windowPositions[i][0],windowPositions[i][1]);
    shirt.addAnimation('empty','assets/population_empty.png');
    shirt.addAnimation('count',pplfilename+'_shirt'+shirtVariety.toString()+'.png');
    shirt.depth=3;

    var hair = [];
    for (var k=0; k<wamount; k++){
      var hairSingle = createSprite(windowPositions[i][0],windowPositions[i][1]); 
      hairSingle.addAnimation('empty','assets/population_empty.png');
      hairSingle.addAnimation('count',pplfilename+'_hair'+(k+1).toString()+hairVariety.toString()+'.png');
      hairSingle.depth=4; 
      hair[k]=hairSingle;
    }

    var bub = createSprite(windowPositions[i][0]+50,windowPositions[i][1]-50);
    bub.addImage(loadImage('assets/bubble0.png'));
    bub.addAnimation('empty','assets/bubble0.png');
    banim = bub.addAnimation('grow','assets/bubble1.png','assets/bubble2.png',
                            'assets/bubble3.png','assets/bubble4.png',
                            'assets/bubble4.png','assets/bubble4.png',
                            'assets/bubble4.png','assets/bubble4.png',
                            'assets/bubble4.png','assets/bubble4.png',
                            'assets/bubble4.png','assets/bubble4.png',
                            'assets/bubble4.png','assets/bubble4.png',
                            'assets/bubble3.png','assets/bubble2.png',
                            'assets/bubble1.png','assets/bubble0.png');
    banim.looping=false;
    bub.depth=5;

    var startCounted = false;
    if (random()<0.1){
      startCounted=true;
    }
    numTotalPopulation = numTotalPopulation + wamount;
    windowArray[i] = new buildingWindow(1,ppl,hair,shirt,win,bub,wamount,startCounted,i);
    if (!startCounted){
      windowEmptyArray[windowEmptyArray.length]=i;
    }
  }

  thePublic = createSprite(400,410);
  thePublic.addImage(loadImage('assets/park1.png'));
  for (var i=0; i<publicIncrements; i++){
    thePublic.addAnimation(i.toString(),'assets/park'+(i+1)+'.png');
  }
  thePublic.depth = 5;

  lastClickTime=millis();
  lastAutoPopulateTime=millis();
} 

function draw() {
  // put drawing code here
  background(backgroundImage);

  for (var i=0; i<numTotalWindows; i++){
    if (windowArray[i].pplSprite.mouseIsOver){
      windowArray[i].hover(true);
    }else{
      windowArray[i].hover(false);
    }
  }

  var progress = (numCounted/numTotalPopulation)*(publicIncrements-1);
  var progressInt = min(Math.floor(progress),publicIncrements-1);
  if (currentProgress < progressInt){
    for (var i=0; i<20; i++){
      sparkles[i].changeAnimation('sparkle');
      sparkles[i].animation.rewind();
      sparkles[i].animation.play();
      sparkles[i].position.x = random(0,800);
      sparkles[i].position.y = random(400,550);
    }
  }
  currentProgress=progressInt;
  thePublic.changeAnimation(progressInt.toString());

  drawSprites();

  fill(0);

  //display progress
  text(numCounted.toString() +"/"+numTotalPopulation+ " counted",15,15);

  //not done yet! help out the user!
  if (numCounted<numTotalPopulation){
    //prompt user
    if (millis()-lastClickTime > inactivePromptInterval){
      text("click on the windows!",15,50);
    }

    //auto populate
    var latest = lastClickTime;
    if (lastAutoPopulateTime > lastClickTime){
      var latest = lastAutoPopulateTime
    }
    if (millis()-latest > autoPopulateInterval){
      windowArray[windowEmptyArray[floor(random(0,windowEmptyArray.length))]].clicked();  
      lastAutoPopulateTime=millis();
    }
  }
}

function adjustWindowEmptyArray(index,isFull){
  var string = "";
  if (!isFull){
    //add it
    windowEmptyArray.push(index);
  }else{
    //remove it
    for (var i=0; i<windowEmptyArray.length; i++){
      string += " "+windowEmptyArray[i];
      if (windowEmptyArray[i]==index){
        windowEmptyArray.splice(i,1);
        string+= " removing";
        break;
      }
    }
  }
}

class buildingWindow{
  constructor(t,ppl,hair,shirt,o,b,a,startCounted,windowID){
    //variables
    this.type = t;
    this.pplSprite = ppl;
    this.hairSprite = hair;
    this.shirtSprite = shirt;
    this.windowOutline = o;
    this.bubble=b;
    this.populationAmount=a;
    this.pplSprite.mouseActive = true;
    this.id=windowID


    this.isCounted = startCounted;
    if (startCounted){
      this.pplSprite.changeAnimation('count');
      for (var i=0; i<this.hairSprite.length; i++){
        this.hairSprite[i].changeAnimation('count');
      }
      this.shirtSprite.changeAnimation('count');
      numCounted=numCounted+this.populationAmount;
    }

    this.pplSprite.onMousePressed = this.clicked.bind(this);
  }
  hover(isOn){
    if (isOn){
      this.windowOutline.changeAnimation('outline');
    }else{
      this.windowOutline.changeAnimation('empty');
    }
  }
  clicked(){
    this.isCounted = !this.isCounted;
    if (this.isCounted){
      this.pplSprite.changeAnimation('count');
      for (var i=0; i<this.hairSprite.length; i++){
        this.hairSprite[i].changeAnimation('count');
      }
      this.shirtSprite.changeAnimation('count');
      this.bubble.changeAnimation('grow');
      this.bubble.animation.rewind();
      this.bubble.animation.play();
      numCounted = min(numCounted+this.populationAmount,numTotalPopulation);
    }else{
      this.pplSprite.changeAnimation('empty');
      for (var i=0; i<this.hairSprite.length; i++){
        this.hairSprite[i].changeAnimation('empty');
      }
      this.shirtSprite.changeAnimation('empty');
      numCounted = max(numCounted-this.populationAmount, 0);
    }
    adjustWindowEmptyArray(this.id,this.isCounted);
    lastClickTime=millis();
  }
}