let colors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'brown', 'white', 'black'];
let selectedColor = 'black';
let bgMusic;
let brushSound;
let clearScreenSound;
let saveFileSound;
let colorSelect;
let lastPaintTime = 0;
let musicSpeedIncreaseRate = 0.05;

let port;
let joyX = 0, joyY = 0, sw = 0;
let circleX, circleY;
let speed = 3;

function preload() {
  bgMusic = loadSound('assets/background.mp3'); 
  bgMusic.setVolume(1);

  brushSound = loadSound('assets/paintbrush.mp3'); 
  brushSound.setVolume(0.5);

  clearScreenSound = loadSound('assets/clear.mp3'); 

  saveFileSound = loadSound('assets/save.mp3'); 

  colorSelect = loadSound('assets/click.mp3');
  colorSelect.setVolume(0.5);
}

function setup() {
  port = createSerial();
  createCanvas(700, 500);
  background(240);
  bgMusic.loop(); 

  circleX = width / 2;
  circleY = height / 2;

  connectButton = createButton("Connect");
  connectButton.mousePressed(connect);
}

function draw() {
  drawPalette();
  drawInstructions();
  strokeWeight(1);

  let str = port.readUntil("\n");
  if (str !== null) {
    let values = str.split(",");
    if (values.length > 2) {
      joyX = map(float(values[0]), -512, 512, -speed, speed);
      joyY = map(float(values[1]), -512, 512, -speed, speed);
      sw = Number(values[2]);

      circleX += joyX;
      circleY += joyY;

      
      circleX = constrain(circleX, 0, width);
      circleY = constrain(circleY, 0, height);
    }
  }

  
  if (sw == 1) {
    brushPaint();
    
    for (let i = 0; i < colors.length; i++) {
      if (circleY > i * 25 && circleY < (i + 1) * 25) {
        selectedColor = colors[i];
        colorSelect.play();
        break;
      }
    }
  }

  
  fill(selectedColor);
  noStroke();
  circle(circleX, circleY, 20);
}

function brushPaint() {
  
  noStroke();
  fill(selectedColor);
  ellipse(circleX, circleY, 20, 20); 
  brushSound.play(); 
}

function drawPalette() {
  stroke('white');
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i]);
    rect(0, i * 25, 25, 25);
  }
}

function drawInstructions() {
  fill(0); 
  textSize(12); 
  textAlign(LEFT, BOTTOM); 
  text('Press "C" to clear canvas', 10, height - 10);

  fill(0); 
  textSize(12); 
  textAlign(RIGHT, BOTTOM); 
  text('Press "S" to save to computer', 690, height - 10);
}

function keyPressed() {
  if (key === 'c') {
    clearScreen();
  } else if (key === 's') {
    saveCanvas('myCanvas', 'png');
    saveFileSound.play(); 
  }
}

function mouseReleased() {
  saveFile();
}

function clearScreen() {
  background(240);
  clearScreenSound.play(); 
}

function connect() {
  if (!port.opened()) {
    port.open('Arduino', 9600);
  } else {
    port.close();
  }
}
