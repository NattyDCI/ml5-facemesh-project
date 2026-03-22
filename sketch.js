let video; // variable para la captura de video
let faceMesh; // variable que contiene el modelo de la detección facial
let faces = [];
let triangles;
let uvCoords;
let logoImage;
let thumbsUpImg;
let sweet_sheep; // optional future creepy image

let buenardFont;
let creepyFont;

let img;
let sheephair_img;

let appState = "loading"; // loading → start → running
let modelReady = false;

// Loading
let loadingProgress = 0;
let loadingMessage = "Starting app...";

// Mouth timer
let mouthOpen = false;
let openStartTime = 0;
let openDuration = 0;

// Bubbles
let bubbles = [];

// DOM (solo lo que sí merece la pena)
let startButton;

// Tooth DOM elements
let ghostLeftTop;
let ghostLeftMid;
let ghostLeftBottom;
let ghostRightTop;
let ghostRightMid;
let ghostRightBottom;

function preload() {
  img = loadImage("sheep_mask.png");
  logoImage = loadImage("assets/images/logo_healthysmile.png");
  thumbsUpImg = loadImage("assets/images/thumbsup_emoji.png");
  sheephair_img = loadImage("ears_sheep.png");
  buenardFont = loadFont("assets/fonts/Buenard-Regular.ttf");
  creepyFont = loadFont("assets/fonts/JollyLodger-Regular.ttf");

  // Later, if you want, uncomment this and replace the placeholder:
  sweet_sheep = loadImage("assets/images/sweet_sheep.png");
}

async function setup() {
  let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  cnv.position(0, 0);
  cnv.style("display", "block");
  cnv.style("z-index", "0");

  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.overflow = "hidden";
  document.documentElement.style.margin = "0";
  document.documentElement.style.padding = "0";
  document.documentElement.style.overflow = "hidden";

  createUI();
  createGhostDOM();

  await loadApp();
}

async function loadApp() {
  updateLoadingState("Preparing interface...", 20);
  await waitMoment(250);

  updateLoadingState("Loading face tracking model...", 60);
  await loadFaceMeshModel();

  updateLoadingState("Almost ready...", 90);
  await waitMoment(250);

  updateLoadingState("Ready!", 100);
  await waitMoment(300);

  modelReady = true;
  appState = "start";
  startButton.show();
}

function updateLoadingState(message, progress) {
  loadingMessage = message;
  loadingProgress = progress;
}

function waitMoment(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadFaceMeshModel() {
  return new Promise(resolve => {
    faceMesh = ml5.faceMesh({ maxFaces: 1 }, () => {
      console.log("FaceMesh ready");
      triangles = faceMesh.getTriangles();
      uvCoords = faceMesh.getUVCoords();
      resolve();
    });
  });
}

function createUI() {
  startButton = createButton("START CAMERA");
  startButton.style("position", "fixed");
  startButton.style("left", "50%");
  startButton.style("top", "70%");
  startButton.style("transform", "translate(-50%, -50%)");
  startButton.style("padding", "18px 34px");
  startButton.style("font-size", "22px");
  startButton.style("border", "none");
  startButton.style("border-radius", "14px");
  startButton.style("background", "#ff8fab");
  startButton.style("color", "#111");
  startButton.style("cursor", "pointer");
  startButton.style("box-shadow", "0 10px 24px rgba(0,0,0,0.35)");
  startButton.style("z-index", "20");
  startButton.mousePressed(() => {
    startCamera();
    appState = "running";
    startButton.hide();
    showGhostDOM();
  });
  startButton.hide();
}

function createGhostDOM() {
  ghostLeftTop = createGhostDiv();
  ghostLeftMid = createGhostDiv();
  ghostLeftBottom = createGhostDiv();
  ghostRightTop = createGhostDiv();
  ghostRightMid = createGhostDiv();
  ghostRightBottom = createGhostDiv();
  hideGhostDOM();
}

function createGhostDiv() {
  let ghost = createDiv("🦷");
  ghost.style("position", "fixed");
  ghost.style("font-size", "64px");
  ghost.style("z-index", "10");
  ghost.style("pointer-events", "none");
  ghost.style("text-shadow", "0 0 12px rgba(255,255,255,0.35)");
  ghost.hide();
  return ghost;
}

function showGhostDOM() {
  ghostLeftTop.show();
  ghostLeftMid.show();
  ghostLeftBottom.show();
  ghostRightTop.show();
  ghostRightMid.show();
  ghostRightBottom.show();
}

function hideGhostDOM() {
  ghostLeftTop.hide();
  ghostLeftMid.hide();
  ghostLeftBottom.hide();
  ghostRightTop.hide();
  ghostRightMid.hide();
  ghostRightBottom.hide();
}

function updateGhostDOM(frame) {
  if (!frame) return;

  let leftCenterX = frame.x / 2;
  let rightStart = frame.x + frame.drawWidth;
  let rightCenterX = rightStart + (width - rightStart) / 2;

  let y1 = height * 0.22;
  let y2 = height * 0.50;
  let y3 = height * 0.78;

  if (mouthOpen) {
    y1 += sin(frameCount * 0.03) * 10;
    y2 += sin(frameCount * 0.04 + 1.2) * 10;
    y3 += sin(frameCount * 0.035 + 2.4) * 10;
  }

  ghostLeftTop.style("left", (leftCenterX - 24) + "px");
  ghostLeftTop.style("top", (y1 - 24) + "px");

  ghostLeftMid.style("left", (leftCenterX - 24) + "px");
  ghostLeftMid.style("top", (y2 - 24) + "px");

  ghostLeftBottom.style("left", (leftCenterX - 24) + "px");
  ghostLeftBottom.style("top", (y3 - 24) + "px");

  ghostRightTop.style("left", (rightCenterX - 24) + "px");
  ghostRightTop.style("top", (y1 - 24) + "px");

  ghostRightMid.style("left", (rightCenterX - 24) + "px");
  ghostRightMid.style("top", (y2 - 24) + "px");

  ghostRightBottom.style("left", (rightCenterX - 24) + "px");
  ghostRightBottom.style("top", (y3 - 24) + "px");
}

function startCamera() {
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background(0);

  if (appState === "loading") {
    hideGhostDOM();
    drawLoadingContainer();
    return;
  }

  if (appState === "start") {
    hideGhostDOM();
    drawStartUI();
    return;
  }

  translate(-width / 2, -height / 2);

  let videoFrame = null;

  if (video) {
    videoFrame = drawVideoContain();
  }

  if (faces.length > 0 && videoFrame) {
    updateMouthState(faces[0], videoFrame);
  } else {
    mouthOpen = false;
    openDuration = 0;
  }

  if (videoFrame) {
    updateGhostDOM(videoFrame);
  }

  if (faces.length > 0 && triangles && uvCoords && videoFrame) {
    let face = faces[0];

    texture(img);
    textureMode(NORMAL);
    noStroke();
    beginShape(TRIANGLES);

    for (let i = 0; i < triangles.length; i++) {
      let [a, b, c] = triangles[i];

      let pointA = scalePoint(face.keypoints[a], videoFrame);
      let pointB = scalePoint(face.keypoints[b], videoFrame);
      let pointC = scalePoint(face.keypoints[c], videoFrame);

      let uvA = uvCoords[a];
      let uvB = uvCoords[b];
      let uvC = uvCoords[c];

      vertex(pointA.x, pointA.y, uvA[0], uvA[1]);
      vertex(pointB.x, pointB.y, uvB[0], uvB[1]);
      vertex(pointC.x, pointC.y, uvC[0], uvC[1]);
    }

    endShape();

    push();
    resetMatrix();
    translate(-width / 2, -height / 2);
    imageMode(CENTER);

    let anchor = scalePoint(face.keypoints[10], videoFrame);
    let leftEye = scalePoint(face.keypoints[33], videoFrame);
    let rightEye = scalePoint(face.keypoints[263], videoFrame);

    let angle = atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
    let eyeDistance = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y);
    let scaleFactor = eyeDistance / 100;

    translate(anchor.x, anchor.y);
    rotate(angle);
    scale(scaleFactor);

    image(sheephair_img, 0, 0, 250, 150);
    pop();

    updateAndDrawBubbles();
  } else if (video) {
    updateAndDrawBubbles();
  }

  drawTopCounter();
  drawBottomPanel();
}

function drawCreepyBackground() {
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  noStroke();

  let cx = width * 0.5;
  let cy = height * 0.35;
  let maxR = dist(0, 0, width, height) * 0.85;

  for (let r = maxR; r > 0; r -= 8) {
    let t = map(r, maxR, 0, 0, 1);

    let col = lerpColor(
      color(8, 4, 16),
      color(70, 18, 10),
      t * 0.7
    );

    if (t > 0.7) {
      col = lerpColor(
        color(70, 18, 10),
        color(255, 110, 20),
        map(t, 0.7, 1, 0, 1)
      );
    }

    fill(col);
    ellipse(cx, cy, r * 2, r * 2);
  }

  for (let i = 0; i < 18; i++) {
    let alpha = map(i, 0, 17, 0, 18);
    stroke(0, alpha);
    strokeWeight(30);
    noFill();
    rect(i * 6, i * 6, width - i * 12, height - i * 12, 30);
  }

  pop();
}

function drawCreepyImagePlaceholder(x, y, w, h) {
  push();

  noStroke();
  fill(0, 0, 0, 120);
  rect(x, y, w, h, 18);

  stroke(120, 255, 120, 80);
  strokeWeight(2);
  noFill();
  rect(x, y, w, h, 18);

  stroke(255, 120, 40, 80);
  strokeWeight(1);
  rect(x + 8, y + 8, w - 16, h - 16, 14);

  stroke(255, 255, 255, 40);
  line(x + 18, y + 18, x + w - 18, y + h - 18);
  line(x + w - 18, y + 18, x + 18, y + h - 18);

  noStroke();
  fill(255, 220);
  textAlign(CENTER, CENTER);
  textFont(buenardFont);
  textSize(20);
  text("Creepy image", x + w / 2, y + h / 2 - 10);

  fill(180);
  textSize(14);
  text("placeholder", x + w / 2, y + h / 2 + 18);

  pop();
}

function drawLoadingContainer() {
  resetMatrix();
  translate(-width / 2, -height / 2);

  drawCreepyBackground();

  let boxW = 560;
  let boxH = 320;
  let boxX = width / 2 - boxW / 2;
  let boxY = height / 2 - boxH / 2;

  noStroke();
  fill(0, 0, 0, 170);
  rect(boxX, boxY, boxW, boxH, 24);

  stroke(255, 180);
  strokeWeight(2);
  noFill();
  rect(boxX, boxY, boxW, boxH, 24);

  if (sweet_sheep) {
    image(sweet_sheep, width / 2 - 240, boxY + 120, 50, 80);
    image(sweet_sheep, width / 2 + 190, boxY + 120, 50, 80);
  } else {
    drawCreepyImagePlaceholder(width / 2 - 90, boxY + 26, 180, 90);
  }

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textFont(creepyFont);
  textSize(42);
  text("Say hello to the sheep Dentist", width / 2, boxY + 150);

  textFont(buenardFont);
  textSize(24);
  fill(225);
  text(loadingMessage, width / 2, boxY + 195);

  let barW = 360;
  let barH = 24;
  let barX = width / 2 - barW / 2;
  let barY = boxY + 230;

  fill(35);
  rect(barX, barY, barW, barH, 12);

  fill(0, 155, 0);
  rect(barX, barY, barW * (loadingProgress / 100), barH, 12);

  fill(255);
  textSize(22);
  text(Math.round(loadingProgress) + "%", width / 2, boxY + 275);
}

function drawStartUI() {
  resetMatrix();
  translate(-width / 2, -height / 2);

  drawCreepyBackground();

  let boxW = 620;
  let boxH = 500;
  let boxX = width / 2 - boxW / 2;
  let boxY = height / 2 - boxH / 2 - 30;

  noStroke();
  fill(0, 0, 0, 170);
  rect(boxX, boxY, boxW, boxH, 24);

  stroke(255, 180);
  strokeWeight(2);
  noFill();
  rect(boxX, boxY, boxW, boxH, 24);

  textAlign(CENTER, CENTER);

  if (sweet_sheep) {
    image(sweet_sheep, width / 2 - 270, boxY + 120, 50, 80);
    image(sweet_sheep, width / 2 + 220, boxY + 120, 50, 80);
  } else {
    drawCreepyImagePlaceholder(width / 2 - 95, boxY + 28, 190, 110);
  }

  textFont(creepyFont);
  textSize(48);
  stroke(0, 140);
  strokeWeight(6);
  fill(255);
  text("Say Hello to the Sheep Dentist", width / 2, boxY + 150);

  noStroke();
  textFont(buenardFont);
  textSize(32);
  fill(255);
  text("Healthysmile", width / 2 - 35, boxY + 215);
  image(logoImage, width / 2 + 50, boxY + 189, 60, 60);

  textFont(buenardFont);
  textSize(24);
  fill(220);
  text("Open your mouth and keep it open!", width / 2, boxY + 313);

  textSize(20);
  fill(180);
  text("Press start to begin", width / 2, boxY + 365);
}

function drawTopCounter() {
  resetMatrix();
  translate(-width / 2, -height / 2);

  let circleX = width * 0.80;
  let circleY = 120;
  let circleSize = 96;

  let roundedSeconds = floor(openDuration);
  let showThumb = false;
  let counterText = "0";

  if (mouthOpen) {
    if (roundedSeconds === 5 || roundedSeconds === 10) {
      showThumb = true;
    } else {
      counterText = roundedSeconds.toString();
    }
  }

  let activeColor = color("#38D66B");
  let inactiveColor = color(155);

  push();
  stroke(mouthOpen ? activeColor : inactiveColor);
  strokeWeight(3);
  noFill();
  ellipse(circleX, circleY, circleSize, circleSize);
  pop();

  if (showThumb && thumbsUpImg) {
    push();
    imageMode(CENTER);
    image(thumbsUpImg, circleX, circleY, 42, 42);
    pop();
  } else {
    push();
    noStroke();
    fill(mouthOpen ? activeColor : inactiveColor);
    textAlign(CENTER, CENTER);
    textFont(buenardFont);
    textSize(46);
    text(counterText, circleX, circleY - 10);
    pop();
  }
}

function drawBottomPanel() {
  resetMatrix();
  translate(-width / 2, -height / 2);

  let panelW = 460;
  let panelH = 210;
  let panelX = width / 2 - panelW / 2;
  let panelY = height - panelH - 20;

  noStroke();
  fill(0, 0, 0, 185);
  rect(panelX, panelY, panelW, panelH, 18);

  stroke(255, 180);
  strokeWeight(2);
  noFill();
  rect(panelX, panelY, panelW, panelH, 18);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);

  textFont(buenardFont);
  textSize(30);
  text("HealthySmile", width / 2 - 20, panelY + 34);
  image(logoImage, width / 2 + 60, panelY + 16, 60, 60);

  let statusMessage = "Abre la boca para empezar el lavado de dientes";
  let statusColor = color("#4DA6FF");
  let thumbsMessage = "";
  let timerMessage = "Tiempo con la boca abierta: 0.0 s";

  if (mouthOpen) {
    timerMessage = "Tiempo con la boca abierta: " + openDuration.toFixed(1) + " s";

    if (openDuration >= 10) {
      statusMessage = "Muy bien! lo has conseguido!";
      statusColor = color("#38D66B");
      statusBold = true;
      thumbsMessage = "👍 Excelente!";
    } else if (openDuration >= 5) {
      statusMessage = "Muy bien! sigue asi, falta un poco";
      statusColor = color("#38D66B");
      statusBold = true;
      thumbsMessage = "👍";
    } else {
      statusMessage = "Muy bien! manten la boca abierta";
      statusColor = color("#38D66B");
      statusBold = true;
      thumbsMessage = "";
    }
  }

  fill(statusColor);
  textFont(buenardFont);
  textSize(31);
  text(statusMessage, panelX + 15, panelY + 72, panelW - 30, 80);

  fill("#ffe66d");
  textFont(buenardFont);
  textSize(18);
  text(timerMessage, width / 2, panelY + 172);

  fill(255);
  textFont(buenardFont);
  textSize(26);
  text(thumbsMessage, width / 2, panelY + 182);
}

function drawVideoContain() {
  let canvasRatio = width / height;
  let videoRatio = video.width / video.height;

  let drawWidth, drawHeight;

  if (canvasRatio > videoRatio) {
    drawHeight = height;
    drawWidth = drawHeight * videoRatio;
  } else {
    drawWidth = width;
    drawHeight = drawWidth / videoRatio;
  }

  let x = (width - drawWidth) / 2;
  let y = (height - drawHeight) / 2;

  image(video, x, y, drawWidth, drawHeight);

  return { x, y, drawWidth, drawHeight };
}

function scalePoint(p, frame) {
  return {
    x: frame.x + map(p.x, 0, video.width, 0, frame.drawWidth),
    y: frame.y + map(p.y, 0, video.height, 0, frame.drawHeight)
  };
}

function getMouthCenter(face, frame) {
  let upperLip = scalePoint(face.keypoints[13], frame);
  let lowerLip = scalePoint(face.keypoints[14], frame);
  let leftMouth = scalePoint(face.keypoints[78], frame);
  let rightMouth = scalePoint(face.keypoints[308], frame);

  return {
    x: (leftMouth.x + rightMouth.x) / 2,
    y: (upperLip.y + lowerLip.y) / 2
  };
}

function spawnBubble(face, frame) {
  let mouth = getMouthCenter(face, frame);
  bubbles.push(
    new Bubble(
      mouth.x + random(-12, 12),
      mouth.y + random(-6, 6)
    )
  );
}

function updateMouthState(face, frame) {
  let upperLip = scalePoint(face.keypoints[13], frame);
  let lowerLip = scalePoint(face.keypoints[14], frame);

  let mouthDistance = dist(
    upperLip.x, upperLip.y,
    lowerLip.x, lowerLip.y
  );

  if (mouthDistance > 30) {
    if (!mouthOpen) {
      mouthOpen = true;
      openStartTime = millis();
      spawnBubble(face, frame);
    }

    openDuration = (millis() - openStartTime) / 1000;

    if (frameCount % 6 === 0) {
      spawnBubble(face, frame);
    }
  } else {
    mouthOpen = false;
    openDuration = 0;
  }
}

function updateAndDrawBubbles() {
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].draw();

    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
    }
  }

  pop();
}

class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(12, 26);
    this.vx = random(-0.8, 0.8);
    this.vy = random(-2.8, -1.4);
    this.alpha = 220;
    this.life = random(50, 90);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.size += 0.08;
    this.alpha -= 3;
    this.life--;
  }

  draw() {
    noFill();
    stroke(255, 255, 255, this.alpha);
    strokeWeight(2);
    ellipse(this.x, this.y, this.size);

    noStroke();
    fill(255, 255, 255, this.alpha * 0.35);
    ellipse(this.x - this.size * 0.18, this.y - this.size * 0.18, this.size * 0.22);
  }

  isDead() {
    return this.life <= 0 || this.alpha <= 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}