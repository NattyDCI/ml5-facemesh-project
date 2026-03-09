// Face Mesh Detection - Triangulated Face Mapping  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let faceMesh;
let faces = [];
let triangles;
let uvCoords;
let img;
let sheephair_img;
let facey;
let foreheadtry;

function preload() {
  // Load FaceMesh model 
  faceMesh = ml5.faceMesh({ maxFaces: 1});

  //load the texture image that will be mapped onto the face mesh
  img = loadImage("sheep_mask.png");

  //ears + hair overlay (NOT mapped)
  sheephair_img = loadImage("ears_sheep.png");
}

function mousePressed() {
  console.log("faces:",faces);
  
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480, WEBGL);

  video = createCapture(VIDEO);
  video.size(640,480);
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);

  // mesh data
  triangles = faceMesh.getTriangles();
  uvCoords = faceMesh.getUVCoords();
}

function draw() {
  
  background(0);

  
  // align WEBGL coordinates to 2D Screen
  translate(-width/2, -height/2);
  
  // camera feed
  image(video, 0, 0);
  
  

  if (faces.length > 0) {

    let face = faces[0];

    // -------------------------
    // DEBUG POINT
    // -------------------------

    let debugPoint = face.keypoints[19];

    stroke(255,0,0);
    strokeWeight(4);
    noFill();
    circle(debugPoint.x, debugPoint.y, 30);

    // -------------------------
    // FACE MESH TEXTURE
    // -------------------------

    
    texture(img);
    textureMode(NORMAL);
    noStroke();
    beginShape(TRIANGLES);
      // Loop through each triangle and fill it with sampled pixel color
    for (let i = 0; i < triangles.length; i++) {
      let tri = triangles[i];
      
    //Get the indices of the three points that form a triangle
    let [a, b, c] = tri;
    let pointA = face.keypoints[a];
    let pointB = face.keypoints[b];
    let pointC = face.keypoints[c];

    // Retrieve the corresponding UV coordinates for texture mapping
    let uvA = uvCoords[a];
    let uvB = uvCoords[b];
    let uvC = uvCoords[c];

    // Define the triangle with both position (x, y) and UV texture coordinates
    vertex(pointA.x, pointA.y, uvA[0], uvA[1]);
    vertex(pointB.x, pointB.y, uvB[0], uvB[1]);
    vertex(pointC.x, pointC.y, uvC[0], uvC[1]);
    }
    
    endShape();

    // -------------------------
    // SHEEP HAIR / EARS OVERLAY
    // -------------------------
    // after drawing video and mesh
    push();
    resetMatrix();      // resets WEBGL transformations
    translate(-width/2, -height/2);  // align top-left
    imageMode(CENTER);

    // anchor point at the middle of the forehead
    let anchor = face.keypoints[10];

    // ---------------------------------
    // HEAD ROTATION (using the eyes)
    // ---------------------------------

    // left and right eye keypoints
    let leftEye = face.keypoints[33];
    let rightEye = face.keypoints[263];

    // calculate head tilt angle
    let angle = atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

    // ---------------------------------
    // FACE DISTANCE / SCALE
    // ---------------------------------

    // distance between the eyes
    let eyeDistance = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y);

    // scale factor (adjust divisor if needed)
    let scaleFactor = eyeDistance / 100;

    // ---------------------------------
    // DRAW ROTATING + SCALING SHEEP HAIR
    // ---------------------------------

    push();

    // move origin to forehead anchor
    translate(anchor.x, anchor.y);

    // rotate with head tilt
    rotate(angle);

    // scale with face distance
    scale(scaleFactor);

    // draw sheep hair centered
    image(sheephair_img, 0, 0, 250, 150); // anchor the image using the keypoint with index 10 on the forehead , and sets width and height

    pop();

    pop();
  }
}