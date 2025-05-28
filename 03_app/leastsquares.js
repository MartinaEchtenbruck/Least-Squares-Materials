var canvas, context;
var clickPop = [];
var sumX=0, sumY=0, meanX=0, meanY=0;
var enableFit = false;
var m=null, b=null;
 
function drawPointHSL(x,y,hue) {
  context.beginPath();
  context.arc(x, y, 4, 0, Math.PI * 2, false);                                        
  context.fillStyle = "hsl(" + hue + ", 80%, 80%)";
  context.fill(); 
              
  context.beginPath();
  context.arc(x, y, 2, 0, Math.PI * 2, false);                                        
  context.fillStyle = "hsl(" + hue + ", 80%, 60%)";
  context.fill();  
}
      
function updateFeedbackData(){   
}

function drawGridAndAxes() {
  const gridSpacing = 20;
  const width = canvas.width;
  const height = canvas.height;

  const originX = gridSpacing * 2; // statt 20 jetzt 40
  const originY = height - gridSpacing * 2;

  context.beginPath();
  context.strokeStyle = "#ddd";
  context.lineWidth = 0.5;

  // Vertikale Linien
  for (let x = 0; x <= width; x += gridSpacing) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }

  // Horizontale Linien
  for (let y = 0; y <= height; y += gridSpacing) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();

  // Achsen
  context.beginPath();
  context.moveTo(0, originY); // X-Achse
  context.lineTo(width, originY);
  context.moveTo(originX, 0); // Y-Achse
  context.lineTo(originX, height);
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.stroke();

  // Pfeile
  context.beginPath();
  context.moveTo(width - 10, originY - 5);
  context.lineTo(width, originY);
  context.lineTo(width - 10, originY + 5);
  context.moveTo(originX - 5, 10);
  context.lineTo(originX, 0);
  context.lineTo(originX + 5, 10);
  context.stroke();

  // Beschriftung
  context.font = "12px sans-serif";
  context.fillStyle = "black";
  context.fillText("x", width - 15, originY - 10);
  context.fillText("y", originX + 5, 15);
}
      
function resetSetup(){       
  // deactivate fit line button
  $("#fitLine").css("background-color", "#eee"); 
  $("#fitLine").css("color", "#bbb");
  $("#fitLine").css("cursor", "default");
  
  // clear canvas and reset feedback data
  context.clearRect(0, 0, canvas.width, canvas.height);  
  drawGridAndAxes();
  
  // flush clickPop
  clickPop = [];
  sumX=0; sumY=0;
  meanX=0; meanY=0;
  
  // reset previous line
  m=null; b=null;
  
  // reset enableFit
  enableFit = false;          
}

function enableFitting(){
  // activate fit line button
  $("#fitLine").css("background-color", "#eee"); 
  $("#fitLine").css("color", "#000");
  $("#fitLine").css("cursor", "pointer");
  
  // set enableFit
  enableFit = true;
}

function fitLine(){
  var ximx=0, yimy=0, sumOfNumerators=0, sumOfDenominators=0;
  
  // calculate sums for m
  for (entry=0; entry < clickPop.length; entry++){
    ximx = clickPop[entry][0]-meanX;
    yimy = clickPop[entry][1]-meanY;
    // (xi-mx)(yi-my) -- nominator
    sumOfNumerators += (ximx*yimy);
    
    // (xi-mx)^2 -- denominator  
    sumOfDenominators += (ximx*ximx);
  }
  
  // fade old line
  if (b!=null && m!=null) drawLine(b, m, '#eee');
  
  // slope m
  m = sumOfNumerators /  sumOfDenominators;
    
  // y-intercept
  b = meanY - (m * meanX);
  
  // draw line
  drawLine(b, m, '#000');
}

function drawLine(b,m, style){
  var x0, y0, x1, y1;
  
  // calculate start point
  if (b<0) { y0=0; x0=-b/m;}
  else if (b>canvas.height) {x0=(canvas.height-b)/m; y0=canvas.height;}                     
  else { y0=b; x0=0;}
  
  // calcualate endpoint
  var y100 = b+(m*canvas.width);
  if (y100<0){y1=0; x1=-b/m;}
  else if (y100>canvas.height) {x1=(canvas.height-b)/m; y1=canvas.height;}
  else { y1=y100; x1=canvas.width;}
  
  // draw line
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = style;
  context.stroke();
}

function drawAxisLabels() {
  const width = canvas.width;
  const height = canvas.height;
  const originX = 40; // neuer Ursprung
  const originY = height - 40;

  const xMin = 10, xMax = 40;
  const yMin = 0, yMax = 700;

  const axisWidth = width - originX;
  const axisHeight = originY;

  context.font = "12px sans-serif";
  context.fillStyle = "black";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // X-Achse: Werte in 10er-Schritten
for (let xVal = xMin; xVal <= xMax; xVal += 10) {
  let xCanvas = ((xVal - xMin) / (xMax - xMin)) * axisWidth + originX;
  context.fillText(xVal.toString(), xCanvas, originY + 15);
}

// Y-Achse: Werte in 100er-Schritten
context.textAlign = "right";
for (let yVal = 100; yVal <= 700; yVal += 100) {
  let yCanvas = originY - ((yVal - yMin) / (yMax - yMin)) * axisHeight;
  context.fillText(yVal.toString(), originX - 5, yCanvas);
}

  // Achsentitel
  context.font = "14px sans-serif";
  context.textAlign = "center";
  context.fillText("Temperatur (\u00B0 C)", width / 2, height - 5);

  context.save();
  context.translate(10, height / 2);
  context.rotate(-Math.PI / 2);
  context.textAlign = "center";
  context.fillText("Besucherzahl", 0, 0);
  context.restore();
}

      
/* Executes immediately */
$(function () {   
  canvas = $("#canvas")[0];
  context = canvas.getContext("2d");  
  
  // Initiales Zeichnen des Gitters und Koordinatensystems
  drawGridAndAxes();
       
  $("#canvas").mousedown(function (event) {
    var x, y;
    x = event.pageX - $("#canvas").offset().left;
    y = event.pageY - $("#canvas").offset().top;
           
    // skalieren auf Werte zwischen 0 und 100
    var xPerc= Math.round(x * 100 / canvas.width);
    var yPerc= Math.round(y * 100 / canvas.height);
          
    drawPointHSL(x,y,240);
          
    // save history
    clickPop.push([x,y]) 
    sumX += x; sumY += y;
    meanX = sumX / clickPop.length;
    meanY = sumY / clickPop.length;  
    
    // enable fitting 
    if (clickPop.length > 1){enableFitting();}                    
  }); 
  
  // Fit Line Button
  $("#fitLine").mousedown(function (event) {if (enableFit) $("#fitLine").css("background-color", "#aaa");});
  $("#fitLine").mouseup(function (event) {if (enableFit) $("#fitLine").css("background-color", "#eee");fitLine();});
  
  // Clear Button
  $("#clear").mousedown(function (event) {$("#clear").css("background-color", "#aaa");});
  $("#clear").mouseup(function (event) {
    $("#clear").css("background-color", "#eee");
    resetSetup();
  });
   
   // Bath Button: Beispielhafte Schwimmbaddaten laden
  $("#bath").mousedown(function (event) {
    $("#bath").css("background-color", "#aaa");
  });

  $("#bath").mouseup(function (event) {
    $("#bath").css("background-color", "#eee");

    // Daten löschen und Canvas zurücksetzen
    resetSetup();
	
	// Label Beschriftungen gemaess der Daten setzen
	drawAxisLabels();

    const bathDataOriginal = [
      [23, 60],
      [24, 180],
      [27, 440],
      [28, 400],
      [28, 250],
      [29, 290],
      [30, 620],
      [35, 560],
      [36, 630],
      [35, 490]
    ];
	
	const width = canvas.width;
	const height = canvas.height;

    const originX = 40;
	const originY = height - 40;

	const axisWidth = width - originX;
	const axisHeight = originY;

    // Wertebereiche für Daten
    const xMin = 10;
    const xMax = 40;
    const yMin = 0;
    const yMax = 700;

    for (let i = 0; i < bathDataOriginal.length; i++) {
      const xValue = bathDataOriginal[i][0];
      const yValue = bathDataOriginal[i][1];

      // Normierung der Werte auf Canvas-Koordinaten
      const xCanvas = ((xValue - xMin) / (xMax - xMin)) * axisWidth + originX;
	  const yCanvas = originY - ((yValue - yMin) / (yMax - yMin)) * axisHeight;

      drawPointHSL(xCanvas, yCanvas, 0);
      clickPop.push([xCanvas, yCanvas]);
      sumX += xCanvas;
      sumY += yCanvas;
    }

    meanX = sumX / clickPop.length;
    meanY = sumY / clickPop.length;

    if (clickPop.length > 1) {
      enableFitting();
    }
  });
   
});