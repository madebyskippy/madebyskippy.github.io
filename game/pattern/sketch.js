/* 
  draw lines

  make random equation
  like 6-x

  solve for x = 1 through 5

  connect lines to all axis
*/

var increment = 50;
var colors = [221,0,0, 254,150,1, 0,187,0, 0,126,254, 70,1,155];

function setup(){
  var canvas = createCanvas(600,600);
  canvas.parent("game");
}

function draw(){
  background(250);
  fill(0);
  stroke(0);

  line(300,600,300,0);
  text("x",10,315);

  line(600,300,0,300);
  for (var i=0; i<5; i++){
    fill(colors[i*3], colors[i*3+1], colors[i*3+2]);
    var answer = equation(i+1);
    stroke(colors[i*3], colors[i*3+1], colors[i*3+2]);
    line(300+(i+1)*increment, 300, 300, 300-answer*increment);
    line(300-(i+1)*increment, 300, 300, 300-answer*increment);
    line(300+(i+1)*increment, 300, 300, 300+answer*increment);
    line(300-(i+1)*increment, 300, 300, 300+answer*increment);
  }
  noStroke();
  text("expression: "+equationString,10,25);
}

var Aval=6;
var Bval="x";
var operation = "3";
var equationString= "6 - x";

function equation(x){
  var one = Aval, two = Bval;
  if (Aval == "x"){
    one = x;
  }
  if (Bval == "x"){
    two = x;
  }
  var result = 0;
  var opstring = "";
  if (operation == "1"){
    result = one*two;
    opstring = "&times;";
  }else if (operation == "2"){
    result= one / two;
    opstring = "&divide;";
  }else if (operation == "3"){
    result = one-two;
    opstring = "-";
  }else if (operation == "4"){
    result= one + two;
    opstring = "+";
  }
  noStroke();
  text(one+" "+opstring+" "+two+" = "+result,10,25+25*x);
  return result;
}


function enterEquation(){
  var Alist = document.getElementById("A");
  var A = Alist.options[Alist.selectedIndex].value;
  if (A != "x"){
    A = parseInt(A);
  }
  var Blist = document.getElementById("B");
  var B = Blist.options[Blist.selectedIndex].value;
  if (B != "x"){
    B = parseInt(B);
  }
  var oplist = document.getElementById("op");
  var op = oplist.options[oplist.selectedIndex].value;
  Aval = A;
  Bval = B;
  operation = op;
  equationString = A+" "+oplist.options[oplist.selectedIndex].text+" "+B;
  console.log(A+" "+op+" "+B);
}