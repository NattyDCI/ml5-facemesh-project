let video; // variable para la captura de video
let faceMesh; // variable que contiene el modelo de detección facial
let faces = []; // array donde se guardan las caras detectadas
let triangles; // triángulos de la malla facial
let uvCoords; // coordenadas UV para mapear la textura
let logoImage; // imagen del logo de HealthySmile
let thumbsUpImg; // imagen del pulgar arriba
let sweet_sheep; // imagen decorativa opcional de oveja

let buenardFont; // fuente Buenard
let creepyFont; // fuente Jolly Lodger de estilo creepy

let img; // imagen de la máscara de oveja
let sheephair_img; // imagen del pelo/orejas de oveja

let appState = "loading"; // estado actual de la app: loading, start o running
let modelReady = false; // indica si el modelo ya está cargado

let loadingProgress = 0; // progreso de carga en porcentaje
let loadingMessage = "Starting app..."; // mensaje mostrado durante la carga

let mouthOpen = false; // indica si la boca está abierta
let openStartTime = 0; // momento en el que la boca se abrió
let openDuration = 0; // tiempo total con la boca abierta

let bubbles = []; // array de burbujas animadas

let startButton; // botón para iniciar la cámara

let ghostLeftTop; // diente fantasma izquierdo superior
let ghostLeftMid; // diente fantasma izquierdo central
let ghostLeftBottom; // diente fantasma izquierdo inferior
let ghostRightTop; // diente fantasma derecho superior
let ghostRightMid; // diente fantasma derecho central
let ghostRightBottom; // diente fantasma derecho inferior

function preload() { // función de p5 para cargar assets antes de setup
  img = loadImage("sheep_mask.png"); // carga la imagen de la máscara
  logoImage = loadImage("assets/images/logo_healthysmile.png"); // carga el logo
  thumbsUpImg = loadImage("assets/images/thumbsup_emoji.png"); // carga la imagen del pulgar
  sheephair_img = loadImage("ears_sheep.png"); // carga la imagen de las orejas/pelo
  buenardFont = loadFont("assets/fonts/Buenard-Regular.ttf"); // carga la fuente Buenard
  creepyFont = loadFont("assets/fonts/JollyLodger-Regular.ttf"); // carga la fuente creepy
  sweet_sheep = loadImage("assets/images/sweet_sheep.png"); // carga la imagen decorativa de oveja
} 

async function setup() { // función principal de inicialización
  let cnv = createCanvas(windowWidth, windowHeight, WEBGL); // crea el canvas en modo WEBGL
  cnv.position(0, 0); // coloca el canvas en la esquina superior izquierda
  cnv.style("display", "block"); // evita espacios extra del canvas
  cnv.style("z-index", "0"); // coloca el canvas detrás del DOM

  document.body.style.margin = "0"; // elimina el margen del body
  document.body.style.padding = "0"; // elimina el padding del body
  document.body.style.overflow = "hidden"; // evita scroll en el body
  document.documentElement.style.margin = "0"; // elimina margen del html
  document.documentElement.style.padding = "0"; // elimina padding del html
  document.documentElement.style.overflow = "hidden"; // evita scroll en el html

  createUI(); // crea la interfaz principal
  createGhostDOM(); // crea los dientes fantasma en DOM

  await loadApp(); // espera a que termine la carga de la app
}

async function loadApp() { // secuencia de carga inicial
  updateLoadingState("Preparando la interfaz...", 20); // actualiza mensaje y progreso
  await waitMoment(250); // espera breve para mostrar transición

  updateLoadingState("Cargando el modelo de detección facial...", 60); // actualiza estado antes del modelo
  await loadFaceMeshModel(); // carga el modelo de detección facial

  updateLoadingState("Casi completo...", 90); // actualiza el progreso casi al final
  await waitMoment(250); // espera breve adicional

  updateLoadingState("Listo!", 100); // marca la carga como completada
  await waitMoment(300); // espera breve antes de mostrar la pantalla inicial

  modelReady = true; // marca el modelo como listo
  appState = "start"; // cambia el estado a pantalla de inicio
  startButton.show(); // muestra el botón de comenzar
} 

function updateLoadingState(message, progress) { // actualiza texto y porcentaje de carga
  loadingMessage = message; // guarda el nuevo mensaje
  loadingProgress = progress; // guarda el nuevo progreso
} 

function waitMoment(ms) { // devuelve una promesa que espera unos milisegundos
  return new Promise(resolve => setTimeout(resolve, ms)); // resuelve tras el tiempo indicado
} 

function loadFaceMeshModel() { // carga el modelo ml5 FaceMesh
  return new Promise(resolve => { // devuelve una promesa para esperar la carga
    faceMesh = ml5.faceMesh({ maxFaces: 1 }, () => { 
      // crea FaceMesh limitado a una cara
      triangles = faceMesh.getTriangles(); // obtiene la triangulación facial
      uvCoords = faceMesh.getUVCoords(); // obtiene las coordenadas UV
      resolve(); // resuelve la promesa cuando todo está listo
    }); 
  }); 
} 

function createUI() { 
  // crea el botón principal de inicio
  startButton = createButton("EMPEZAR"); // crea el botón
  startButton.style("position", "fixed"); // posición fija sobre la ventana
  startButton.style("left", "50%"); // centra horizontalmente
  startButton.style("top", "70%"); 
  startButton.style("transform", "translate(-50%, -50%)"); // corrige el centrado real
  startButton.style("padding", "18px 34px"); 
  startButton.style("font-size", "22px");
  startButton.style("border", "none"); 
  startButton.style("border-radius", "14px"); 
  startButton.style("background", "#ff8fab"); 
  startButton.style("color", "#111"); 
  startButton.style("cursor", "pointer"); // cursor tipo mano
  startButton.style("box-shadow", "0 10px 24px rgba(0,0,0,0.35)"); // sombra del botón
  startButton.style("z-index", "20"); // asegura que esté por encima del canvas
  startButton.mousePressed(() => { 
    // define qué pasa al pulsar el botón
    startCamera(); // inicia la cámara
    appState = "running"; // cambia el estado a ejecución
    startButton.hide(); // oculta el botón
    showGhostDOM(); // muestra los dientes fantasma
  });
  startButton.hide(); // mantiene oculto el botón hasta que la app esté lista
}
function createGhostDOM() {
  ghostLeftTop = createGhostDiv("🦷"); // diente superior izquierdo
  ghostLeftMid = createGhostDiv("🎃"); // calabaza izquierda del medio
  ghostLeftBottom = createGhostDiv("🦷"); // diente inferior izquierdo

  ghostRightTop = createGhostDiv("🦷"); // diente superior derecho
  ghostRightMid = createGhostDiv("🎃"); // calabaza derecha del medio
  ghostRightBottom = createGhostDiv("🦷"); // diente inferior derecho

  ghostLeftMid.style("font-size", "68px"); // hace la calabaza un poco más grande
  ghostRightMid.style("font-size", "68px"); // hace la calabaza un poco más grande

  hideGhostDOM(); // los deja ocultos al principio
}

function createGhostDiv(emoji) {
  let ghost = createDiv(emoji); // crea un div con el emoji recibido
  ghost.style("position", "fixed"); // posición fija en pantalla
  ghost.style("font-size", "64px"); // tamaño grande del emoji
  ghost.style("font-family", "system-ui, sans-serif"); // ayuda a renderizar emojis
  ghost.style("z-index", "10"); // por encima del canvas
  ghost.style("pointer-events", "none"); // evita interacción del ratón
  ghost.style("text-shadow", "0 0 12px rgba(255,255,255,0.35)"); // brillo suave
  ghost.hide(); // empieza oculto
  return ghost; // devuelve el div creado
}
function showGhostDOM() { // muestra todos los dientes fantasma
  ghostLeftTop.show(); 
  ghostLeftMid.show();
  ghostLeftBottom.show(); 
  ghostRightTop.show(); 
  ghostRightMid.show(); 
  ghostRightBottom.show(); 
}

function hideGhostDOM() { 
  // oculta todos los dientes
  ghostLeftTop.hide(); 
  ghostLeftMid.hide(); 
  ghostLeftBottom.hide(); 
  ghostRightTop.hide(); 
  ghostRightMid.hide(); 
  ghostRightBottom.hide(); 
} 

function updateGhostDOM(frame) { // actualiza posiciones de los dientes según el marco de vídeo
  if (!frame) return; // si no hay frame, sale sin hacer nada

  let leftCenterX = frame.x / 2; // centro horizontal del espacio izquierdo libre
  let rightStart = frame.x + frame.drawWidth; // inicio del espacio derecho libre
  let rightCenterX = rightStart + (width - rightStart) / 2; // centro horizontal del espacio derecho

  let y1 = height * 0.22; // altura del diente superior
  let y2 = height * 0.50; // altura del diente medio
  let y3 = height * 0.78; // altura del diente inferior

  if (mouthOpen) { // si la boca está abierta
    y1 += sin(frameCount * 0.03) * 10; // anima el superior con oscilación
    y2 += sin(frameCount * 0.04 + 1.2) * 10; // anima el medio con desfase
    y3 += sin(frameCount * 0.035 + 2.4) * 10; // anima el inferior con otro desfase
  } 

  ghostLeftTop.style("left", (leftCenterX - 24) + "px"); // posición X del izquierdo superior
  ghostLeftTop.style("top", (y1 - 24) + "px"); // posición Y del izquierdo superior

  ghostLeftMid.style("left", (leftCenterX - 24) + "px"); // posición X del izquierdo medio
  ghostLeftMid.style("top", (y2 - 24) + "px"); // posición Y del izquierdo medio

  ghostLeftBottom.style("left", (leftCenterX - 24) + "px"); // posición X del izquierdo inferior
  ghostLeftBottom.style("top", (y3 - 24) + "px"); // posición Y del izquierdo inferior

  ghostRightTop.style("left", (rightCenterX - 24) + "px"); // posición X del derecho superior
  ghostRightTop.style("top", (y1 - 24) + "px"); // posición Y del derecho superior

  ghostRightMid.style("left", (rightCenterX - 24) + "px"); // posición X del derecho medio
  ghostRightMid.style("top", (y2 - 24) + "px"); // posición Y del derecho medio

  ghostRightBottom.style("left", (rightCenterX - 24) + "px"); // posición X del derecho inferior
  ghostRightBottom.style("top", (y3 - 24) + "px"); // posición Y del derecho inferior
} 

function startCamera() { // inicia la cámara y el análisis facial
  video = createCapture(VIDEO); 
  video.size(640, 480); // fija el tamaño interno del vídeo
  video.hide(); // oculta el elemento HTML del vídeo
  faceMesh.detectStart(video, gotFaces); // inicia la detección continua de caras
} 

function gotFaces(results) { // callback que recibe resultados de detección
  faces = results; // guarda los resultados en el array global
} 

function draw() { // función principal que se ejecuta en cada frame
  background(0); // limpia el fondo con negro

  if (appState === "loading") { // si el estado es loading
    hideGhostDOM(); // oculta los dientes
    drawLoadingContainer(); // dibuja la pantalla de carga
    return; // sale del draw para no seguir
  } 

  if (appState === "start") { // si el estado es start
    hideGhostDOM(); // oculta los dientes
    drawStartUI(); // dibuja la pantalla de inicio
    return; // sale del draw
  } 

  translate(-width / 2, -height / 2); // ajusta coordenadas WEBGL a modo pantalla

  let videoFrame = null; // variable para guardar el marco de dibujo del vídeo

  if (video) { // si el vídeo existe
    videoFrame = drawVideoContain(); // dibuja el vídeo y guarda su encuadre
  } 

  if (faces.length > 0 && videoFrame) { // si hay cara detectada y marco válido
    updateMouthState(faces[0], videoFrame); // actualiza el estado de la boca
  } else { // si no hay cara o no hay vídeo
    mouthOpen = false;
    openDuration = 0; // reinicia el contador de apertura
  }

  if (videoFrame) { // si existe el encuadre del vídeo
    updateGhostDOM(videoFrame); // actualiza posición de los dientes flotantes
  } 

  if (faces.length > 0 && triangles && uvCoords && videoFrame) { // si hay todo lo necesario para la máscara
    let face = faces[0]; // toma la primera cara detectada

    texture(img); // usa la textura de la máscara
    textureMode(NORMAL); // usa coordenadas UV normalizadas
    noStroke(); // sin borde para la malla
    beginShape(TRIANGLES); // comienza a dibujar triángulos

    for (let i = 0; i < triangles.length; i++) { // recorre cada triángulo
      let [a, b, c] = triangles[i]; // toma los tres índices del triángulo

      let pointA = scalePoint(face.keypoints[a], videoFrame); // escala el punto A al canvas
      let pointB = scalePoint(face.keypoints[b], videoFrame); // escala el punto B al canvas
      let pointC = scalePoint(face.keypoints[c], videoFrame); // escala el punto C al canvas

      let uvA = uvCoords[a]; // coordenada UV del punto A
      let uvB = uvCoords[b]; // coordenada UV del punto B
      let uvC = uvCoords[c]; // coordenada UV del punto C

      vertex(pointA.x, pointA.y, uvA[0], uvA[1]); // dibuja el vértice A con textura
      vertex(pointB.x, pointB.y, uvB[0], uvB[1]); // dibuja el vértice B con textura
      vertex(pointC.x, pointC.y, uvC[0], uvC[1]); // dibuja el vértice C con textura
    } 

    endShape(); // termina la malla triangular

    push(); // guarda el estado gráfico
    resetMatrix(); // resetea la matriz de transformación
    translate(-width / 2, -height / 2); // vuelve a coordenadas de pantalla
    imageMode(CENTER); // dibuja imágenes desde su centro

    let anchor = scalePoint(face.keypoints[10], videoFrame); // punto ancla superior de la cabeza
    let leftEye = scalePoint(face.keypoints[33], videoFrame); // posición del ojo izquierdo
    let rightEye = scalePoint(face.keypoints[263], videoFrame); // posición del ojo derecho

    let angle = atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x); // calcula el ángulo de inclinación
    let eyeDistance = dist(leftEye.x, leftEye.y, rightEye.x, rightEye.y); // distancia entre ojos
    let scaleFactor = eyeDistance / 100; // factor de escala según tamaño de la cara

    translate(anchor.x, anchor.y); // mueve al punto ancla
    rotate(angle); // rota según inclinación de la cara
    scale(scaleFactor); // escala según distancia entre ojos

    image(sheephair_img, 0, 0, 250, 150); // dibuja las orejas/pelo de oveja
    pop(); // restaura el estado gráfico anterior

    updateAndDrawBubbles(); // actualiza y dibuja burbujas
  } else if (video) { // si hay vídeo pero no se puede dibujar la máscara
    updateAndDrawBubbles(); // al menos actualiza y dibuja burbujas
  }

  drawTopCounter(); // dibuja el contador circular superior
  drawBottomPanel(); // dibuja el panel inferior informativo
} 

function drawCreepyBackground() { // dibuja un fondo radial tenebroso
  push(); // guarda el estado gráfico
  resetMatrix(); // resetea transformaciones
  translate(-width / 2, -height / 2); // cambia a coordenadas de pantalla

  noStroke(); // sin borde para las formas del fondo

  let cx = width * 0.5; // centro X del gradiente
  let cy = height * 0.35; // centro Y del gradiente
  let maxR = dist(0, 0, width, height) * 0.85; // radio máximo del gradiente

  for (let r = maxR; r > 0; r -= 8) { // dibuja círculos desde fuera hacia dentro
    let t = map(r, maxR, 0, 0, 1); // normaliza la posición del radio

    let col = lerpColor( // mezcla dos colores oscuros
      color(8, 4, 16), // morado-negro exterior
      color(70, 18, 10), // rojo quemado intermedio
      t * 0.7 // cantidad de mezcla inicial
    ); 

    if (t > 0.7) { // si está cerca del centro
      col = lerpColor( // mezcla hacia un naranja brillante
        color(70, 18, 10), // rojo quemado
        color(255, 110, 20), // naranja central
        map(t, 0.7, 1, 0, 1) // mapea la mezcla en la zona central
      ); 
    }

    fill(col); // aplica el color actual
    ellipse(cx, cy, r * 2, r * 2); // dibuja el círculo del gradiente
  } 

  for (let i = 0; i < 18; i++) { // dibuja varias capas de viñeteado oscuro
    let alpha = map(i, 0, 17, 0, 18); // calcula la opacidad de cada borde
    stroke(0, alpha); // usa un borde negro semitransparente
    strokeWeight(30); // grosor del borde
    noFill(); // sin relleno
    rect(i * 6, i * 6, width - i * 12, height - i * 12, 30); // dibuja rectángulos concéntricos
  } 

  pop(); // restaura el estado gráfico
} 


function drawLoadingContainer() { // dibuja la pantalla de carga
  resetMatrix(); // resetea transformaciones
  translate(-width / 2, -height / 2); // cambia a coordenadas de pantalla

  drawCreepyBackground(); // dibuja el fondo creepy

  let boxW = 560; // ancho de la caja central
  let boxH = 320; // alto de la caja central
  let boxX = width / 2 - boxW / 2; // posición X de la caja
  let boxY = height / 2 - boxH / 2; // posición Y de la caja

  noStroke(); // sin borde en la caja principal
  fill(0, 0, 0, 170); // relleno negro semitransparente
  rect(boxX, boxY, boxW, boxH, 24); // dibuja la caja principal

  stroke(255, 180); // borde claro semitransparente
  strokeWeight(2); // grosor del borde
  noFill(); // sin relleno
  rect(boxX, boxY, boxW, boxH, 24); // dibuja el contorno de la caja

  image(sweet_sheep, width / 2 - 224, boxY + 120, 50, 80); // dibuja oveja izquierda
  image(sweet_sheep, width / 2 + 175, boxY + 120, 50, 80); // dibuja oveja derecha
 

  noStroke(); // sin borde para el texto
  fill(255); // color blanco
  textAlign(CENTER, CENTER); // centra el texto
  textFont(creepyFont); // usa fuente creepy
  textSize(42); // tamaño grande del título
  text("Saluda al dentista oveja", width / 2, boxY + 150); // título de la pantalla

  textFont(buenardFont); // cambia a fuente Buenard
  textSize(24); // tamaño del subtítulo
  fill(225); // color blanco ligeramente apagado
  text(loadingMessage, width / 2, boxY + 195); // mensaje actual de carga

  let barW = 360; // ancho de la barra de progreso
  let barH = 24; // alto de la barra de progreso
  let barX = width / 2 - barW / 2; // posición X de la barra
  let barY = boxY + 230; // posición Y de la barra

  fill(35); // color de fondo de la barra
  rect(barX, barY, barW, barH, 12); // dibuja la barra base

  fill(0, 155, 0); // color verde del progreso
  rect(barX, barY, barW * (loadingProgress / 100), barH, 12); // dibuja el progreso actual

  fill(255); // color blanco para el porcentaje
  textSize(22); // tamaño del porcentaje
  text(Math.round(loadingProgress) + "%", width / 2, boxY + 275); // texto del porcentaje
}

function drawStartUI() { // dibuja la pantalla inicial antes de iniciar la cámara
  resetMatrix(); // resetea transformaciones
  translate(-width / 2, -height / 2); // cambia a coordenadas de pantalla

  drawCreepyBackground(); // dibuja el fondo tenebroso

  let boxW = 620; // ancho de la caja principal
  let boxH = 500; // alto de la caja principal
  let boxX = width / 2 - boxW / 2; // posición X de la caja
  let boxY = height / 2 - boxH / 2 - 30; // posición Y de la caja

  noStroke(); // sin borde para el relleno
  fill(0, 0, 0, 170); // relleno oscuro semitransparente
  rect(boxX, boxY, boxW, boxH, 24); // dibuja caja principal

  stroke(255, 180); // borde claro
  strokeWeight(2); // grosor del borde
  noFill(); // sin relleno
  rect(boxX, boxY, boxW, boxH, 24); // dibuja el contorno

  textAlign(CENTER, CENTER); // centra todos los textos

  if (sweet_sheep) { // si hay imagen decorativa disponible
    image(sweet_sheep, width / 2 - 260, boxY + 120, 50, 80); // dibuja oveja izquierda
    image(sweet_sheep, width / 2 + 214, boxY + 120, 50, 80); // dibuja oveja derecha
  } else { // si no hay imagen
    drawCreepyImagePlaceholder(width / 2 - 95, boxY + 28, 190, 110); // dibuja el placeholder
  } 

  textFont(creepyFont); // usa fuente creepy
  textSize(48); // tamaño del título
  stroke(0, 140); // trazo oscuro semitransparente para el texto
  strokeWeight(6); // grosor del trazo
  fill(255); // relleno blanco
  text("Saluda al dentista oveja", width / 2, boxY + 150); // título principal

  noStroke(); // quita el borde del texto siguiente
  textFont(buenardFont); // cambia a fuente Buenard
  textSize(32); // tamaño del nombre de marca
  fill(255); // color blanco
  text("Healthysmile", width / 2 - 35, boxY + 215); // dibuja texto de marca
  image(logoImage, width / 2 + 50, boxY + 189, 60, 60); // dibuja logo junto al texto

  textFont(buenardFont); // mantiene la fuente Buenard
  textSize(24); // tamaño del texto explicativo
  fill(220); // color blanco suave
  text("Abre la boca y manténla abierta!", width / 2, boxY + 313); // instrucción principal

  textSize(20); // tamaño del texto secundario
  fill(180); // gris claro
  text("Presiona el botón para empezar", width / 2, boxY + 365); // instrucción para comenzar
} 

function drawTopCounter() { // dibuja el contador circular superior derecho
  resetMatrix(); // resetea transformaciones
  translate(-width / 2, -height / 2); // cambia a coordenadas de pantalla

  let circleX = width * 0.80; // posición X del círculo
  let circleY = 120; // posición Y del círculo
  let circleSize = 96; // diámetro del círculo

  let roundedSeconds = floor(openDuration); // segundos redondeados hacia abajo
  let showThumb = false; // indica si hay que mostrar el pulgar
  let counterText = "0"; // texto inicial del contador

  if (mouthOpen) { // si la boca está abierta
    if (roundedSeconds === 5 || roundedSeconds === 10) { // si llega a 5 o 10 segundos
      showThumb = true; // muestra el icono de pulgar
    } else { // en cualquier otro segundo
      counterText = roundedSeconds.toString(); // convierte segundos a texto
    } 
  } 
  let activeColor = color("#38D66B"); // color verde activo
  let inactiveColor = color(155); // color gris inactivo

  push(); 
  stroke(mouthOpen ? activeColor : inactiveColor);
  strokeWeight(3); 
  noFill();
  ellipse(circleX, circleY, circleSize, circleSize);
  pop();
  if (showThumb && thumbsUpImg) { // si hay que mostrar pulgar y la imagen existe
    push(); 
    imageMode(CENTER); // dibuja la imagen desde su centro
    image(thumbsUpImg, circleX, circleY, 42, 42); // dibuja el pulgar en el centro
    pop(); 
  } else { // si no toca mostrar el pulgar
    push(); // guarda el estado gráfico
    noStroke(); // sin borde para el texto
    fill(mouthOpen ? activeColor : inactiveColor); // texto verde o gris según estado
    textAlign(CENTER, CENTER); // centra el texto
    textFont(buenardFont); // usa la fuente Buenard
    textSize(46); // tamaño del número
    text(counterText, circleX, circleY - 10); // dibuja el contador numérico
    pop(); // restaura el estado
  } 
} 

function drawBottomPanel() { // dibuja el panel inferior de mensajes
  resetMatrix(); // resetea transformaciones
  translate(-width / 2, -height / 2); // cambia a coordenadas de pantalla

  let panelW = 560; // ancho del panel
  let panelH = 210; // alto del panel
  let panelX = width / 2 - panelW / 2; // posición X del panel
  let panelY = height - panelH - 20; // posición Y del panel

  noStroke(); // sin borde para el fondo del panel
  fill(0, 0, 0, 185); // relleno oscuro semitransparente
  rect(panelX, panelY, panelW, panelH, 18); // dibuja el panel

  stroke(255, 180); // borde claro
  strokeWeight(2); // grosor del borde
  noFill(); // sin relleno
  rect(panelX, panelY, panelW, panelH, 18); // dibuja contorno del panel

  fill(255); // color blanco
  noStroke(); // sin borde para los textos
  textAlign(CENTER, CENTER); // centra los textos del panel

  textFont(buenardFont); // usa fuente Buenard
  textSize(30); // tamaño del título del panel
  text("HealthySmile", width / 2 - 20, panelY + 34); // escribe HealthySmile
  image(logoImage, width / 2 + 60, panelY + 16, 60, 60); // dibuja el logo al lado

  let statusMessage = "Abre la boca para empezar el lavado de dientes"; // mensaje inicial de estado
  let statusColor = color("#4DA6FF"); // color azul del estado inicial
  let timerMessage = "Tiempo con la boca abierta: 0.0 s"; // mensaje inicial del temporizador

  if (mouthOpen) { // si la boca está abierta
    timerMessage = "Tiempo con la boca abierta: " + openDuration.toFixed(1) + " s"; // actualiza el temporizador

    // éstas condiciones determinan los mensajes según la duración, resfuerzan positivamente el tiempo que el niño se  

    if (openDuration >= 10) { // si lleva 10 segundos o más
      statusMessage = "Excelente! lo has conseguido!"; // mensaje final de éxito
      statusColor = color("#38D66B"); // color verde
      image(thumbsUpImg, panelX + 20, panelY + 92, 40, 50); // dibuja el pulgar al lado
      
    } else if (openDuration >= 5) { // si lleva 5 segundos o más
      statusMessage = "Lo vas a lograr, falta muy poco"; // mensaje intermedio
      statusColor = color("#38D66B"); // color verde
      image(thumbsUpImg, panelX + 20, panelY + 92, 40, 50); // dibuja el pulgar al lado
      
    } else { // si está abierta pero aún no llega a 5 segundos
      statusMessage = "Muy bien! manten la boca abierta"; // mensaje motivador
      statusColor = color("#38D66B"); // color verde
      image(thumbsUpImg, panelX + 20, panelY + 92, 40, 50); // dibuja el pulgar al lado
      
    } 
  } 
  //styling del mensaje de estado " abre la boca, el status message cambia segun la duración de apertura de la boca"
  fill(statusColor); 
  textFont(buenardFont); // usa Buenard
  textSize(28); // tamaño del mensaje principal
  text(statusMessage, panelX + 24, panelY + 72, panelW - 30, 80); 

  fill("#ffe66d"); // color amarillo para el temporizador
  textFont(buenardFont); // mantiene la fuente
  textSize(18); // tamaño del texto del tiempo
  text(timerMessage, width / 2, panelY + 172); // dibuja el tiempo

} 

function drawVideoContain() { // dibuja el vídeo ajustándolo al canvas sin deformarlo
  let canvasRatio = width / height; // ratio del canvas
  let videoRatio = video.width / video.height; // ratio del vídeo

  let drawWidth, drawHeight; // variables de tamaño final dibujado

  if (canvasRatio > videoRatio) { // si el canvas es más ancho proporcionalmente
    drawHeight = height; // usa todo el alto
    drawWidth = drawHeight * videoRatio; // calcula el ancho proporcional
  } else { // si el canvas es más alto proporcionalmente
    drawWidth = width; // usa todo el ancho
    drawHeight = drawWidth / videoRatio; // calcula el alto proporcional
  } 
  let x = (width - drawWidth) / 2; // centra el vídeo horizontalmente
  let y = (height - drawHeight) / 2; // centra el vídeo verticalmente

  image(video, x, y, drawWidth, drawHeight); // dibuja el vídeo en pantalla

  return { x, y, drawWidth, drawHeight }; // devuelve el marco donde se ha dibujado
} 

function scalePoint(p, frame) { // convierte un punto del vídeo a coordenadas del canvas
  return { // devuelve un nuevo objeto con coordenadas escaladas
    x: frame.x + map(p.x, 0, video.width, 0, frame.drawWidth), // escala la coordenada X
    y: frame.y + map(p.y, 0, video.height, 0, frame.drawHeight) // escala la coordenada Y
  }; // fin del objeto retornado
} 

function getMouthCenter(face, frame) { // calcula el centro aproximado de la boca
  let upperLip = scalePoint(face.keypoints[13], frame); // labio superior escalado
  let lowerLip = scalePoint(face.keypoints[14], frame); // labio inferior escalado
  let leftMouth = scalePoint(face.keypoints[78], frame); // comisura izquierda
  let rightMouth = scalePoint(face.keypoints[308], frame); // comisura derecha

  return { // devuelve el centro calculado
    x: (leftMouth.x + rightMouth.x) / 2, // media horizontal de las comisuras
    y: (upperLip.y + lowerLip.y) / 2 // media vertical entre labios
  }; // fin del objeto retornado
} 

function spawnBubble(face, frame) { // crea una nueva burbuja desde la boca
  let mouth = getMouthCenter(face, frame); // obtiene el centro de la boca
  bubbles.push( // añade una nueva burbuja al array
    new Bubble( // crea una nueva instancia de burbuja
      mouth.x + random(-12, 12), // desplaza ligeramente en X
      mouth.y + random(-6, 6) // desplaza ligeramente en Y
    ) // fin de la nueva burbuja
  ); // fin del push
} 

function updateMouthState(face, frame) { // calcula si la boca está abierta y durante cuánto tiempo
  let upperLip = scalePoint(face.keypoints[13], frame); // labio superior escalado
  let lowerLip = scalePoint(face.keypoints[14], frame); // labio inferior escalado

  let mouthDistance = dist( // calcula distancia entre labios
    upperLip.x, upperLip.y, // coordenadas del labio superior
    lowerLip.x, lowerLip.y // coordenadas del labio inferior
  ); 

  if (mouthDistance > 30) { // si la distancia es suficiente para considerar la boca abierta
    if (!mouthOpen) { // si acaba de abrirse ahora
      mouthOpen = true; // marca la boca como abierta
      openStartTime = millis(); // guarda el instante de apertura
      spawnBubble(face, frame); // genera una burbuja inicial
      spawnBubble(face, frame); // genera una burbuja inicial
      spawnBubble(face, frame); // genera una burbuja inicial
    } 

    openDuration = (millis() - openStartTime) / 1000; // calcula los segundos abiertos

    if (frameCount % 3 === 0) { // cada 6 frames
      spawnBubble(face, frame); // genera otra burbuja
    } 
  } else { // si la boca no está suficientemente abierta
    mouthOpen = false; // marca la boca como cerrada
    openDuration = 0; // reinicia el contador
  }
} 

function updateAndDrawBubbles() { // actualiza y dibuja todas las burbujas
  push(); 
  resetMatrix(); // resetea transformaciones
  translate(-width / 2, -height / 2); // usa coordenadas de pantalla

  for (let i = bubbles.length - 1; i >= 0; i--) { // recorre burbujas de atrás hacia delante
    bubbles[i].update(); // actualiza movimiento y estado
    bubbles[i].draw(); // dibuja la burbuja

    if (bubbles[i].isDead()) { // si la burbuja ya terminó su vida
      bubbles.splice(i, 1); // la elimina del array
    } 
  } 

  pop(); // restaura el estado gráfico
}
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(14, 30);
    this.vx = random(-1.0, 1.0);
    this.vy = random(-3.2, -1.6);
    this.alpha = 230;
    this.life = random(55, 100);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.size += 0.10;
    this.alpha -= 3;
    this.life--;
  }

  draw() {
    noFill();
    stroke(120, 200, 255, this.alpha);
    strokeWeight(2.2);
    ellipse(this.x, this.y, this.size);

    noStroke();
    fill(120, 200, 255, this.alpha * 0.25);
    ellipse(this.x, this.y, this.size * 0.92);

    fill(220, 245, 255, this.alpha * 0.55);
    ellipse(
      this.x - this.size * 0.18,
      this.y - this.size * 0.18,
      this.size * 0.22
    );
  }

  isDead() {
    return this.life <= 0 || this.alpha <= 0;
  }
}

function windowResized() { // función llamada cuando cambia el tamaño de la ventana
  resizeCanvas(windowWidth, windowHeight); // ajusta el canvas al nuevo tamaño
} 