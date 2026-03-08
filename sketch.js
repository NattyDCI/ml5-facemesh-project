// Face Mesh Detection - Lips and Nose Tracking
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh
// https://youtu.be/R5UZsIwPbJA
let triangles;
let video;
let faceMesh;
let faces = [];
//this should help fix the video, make it smoother, it was too jittery.
let offsetX = 0;
let offsetY = 0;

function preload() {
  // Initialize FaceMesh model with a maximum of one face and flipped video input
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
  // Log detected face data to the console
  console.log(faces);
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);
  triangles = faceMesh.getTriangles();
  console.log("triangles",triangles);
}

function draw() {
  background(0);

  if (faces.length > 0) {
    let face = faces[0];
    let box = face.box;
    
    let centerX = width/2;
    let centerY = width/2;
    let rawOffsetX = centerX - box.xMin - box.width/2;
    let rawOffsetY = centerY - box.yMin - box.height/2;

    offsetX = lerp(offsetX, rawOffsetX, 0.5);
    offsetY = lerp(offsetY, rawOffsetY, 0.5)

    translate(offsetX, offsetY);
    image(video, 0, 0);
    stroke(0,0,255);
    noFill();
    rect(box.xMin, box.yMin, box.width, box.height);
    
    // Draw exterior lip contour
    beginShape();
    for (let i = 0; i < lipsExterior.length; i++) {
      let index = lipsExterior[i];
      let keypoint = face.keypoints[index];
      stroke(255, 255, 0);
      strokeWeight(2);
      noFill();
      vertex(keypoint.x, keypoint.y);
    }
    endShape(CLOSE);

    // Draw interior lip contour
    beginShape();
    for (let i = 0; i < lipsInterior.length; i++) {
      let index = lipsInterior[i];
      let keypoint = face.keypoints[index];
      stroke(255, 0, 255);
      strokeWeight(2);
      noFill();
      vertex(keypoint.x, keypoint.y);
    }
    endShape(CLOSE);

    // Calculate mouth opening distance
    let a = face.keypoints[13];
    let b = face.keypoints[14];
    let d = dist(a.x, a.y, b.x, b.y);

    // Draw a circle on the nose with size based on mouth opening
    let nose = face.keypoints[19];
    fill(0, 255, 0);
    circle(nose.x, nose.y, d);
  }
}

// Thank you Jack B. Du for these lists!

// Define the exterior lip landmark indices for drawing the outer lip contour
let lipsExterior = [
  267,
  269,
  270,
  409,
  291,
  375,
  321,
  405,
  314,
  17,
  84,
  181,
  91,
  146,
  61,
  185,
  40,
  39,
  37,
  0,
];

// Define the interior lip landmark indices for drawing the inner lip contour
let lipsInterior = [
  13,
  312,
  311,
  310,
  415,
  308,
  324,
  318,
  402,
  317,
  14,
  87,
  178,
  88,
  95,
  78,
  191,
  80,
  81,
  82,
];
