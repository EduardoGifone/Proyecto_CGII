THREE.FirstPersonControls = function ( camera, MouseMoveSensitivity = 0.002, speed = 800.0, jumpHeight = 350.0, height = 30.0) {
  var scope = this;
  
  scope.MouseMoveSensitivity = MouseMoveSensitivity;
  scope.speed = speed;
  scope.height = height;
  scope.jumpHeight = scope.height + jumpHeight;
  scope.click = false;
  
  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  //var canJump = false;
  var run = false;
  
  var velocity = new THREE.Vector3();
  var direction = new THREE.Vector3();

  var prevTime = performance.now();

  camera.rotation.set( 0, 0, 0 );

  var pitchObject = new THREE.Object3D();
  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.position.y = 10;
  yawObject.add( pitchObject );

  var PI_2 = Math.PI / 2;

  // Movimiento de camara
  var onMouseMove = function ( event ) {

    if ( scope.enabled === false ) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * scope.MouseMoveSensitivity;
    pitchObject.rotation.x -= movementY * scope.MouseMoveSensitivity;

    pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

  };

  // Movimiento de personaje
  var onKeyDown = (function ( event ) {
    
    if ( scope.enabled === false ) return;
    
    switch ( event.keyCode ) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true;
        break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      // case 32: // space
      //   if ( canJump === true ) velocity.y += run === false ? scope.jumpHeight : scope.jumpHeight + 50;
      //   canJump = false;
      //   break;

      case 16: // shift
        run = true;
        break;

    }

  }).bind(this);

  var onKeyUp = (function ( event ) {
    
    if ( scope.enabled === false ) return;
    
    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

      case 16: // shift
        run = false;
        break;

    }

  }).bind(this);
  
  var onMouseDownClick= (function ( event ) {
    if ( scope.enabled === false ) return; 
    scope.click = true;
  }).bind(this);
  
  var onMouseUpClick= (function ( event ) {
    if ( scope.enabled === false ) return; 
    scope.click = false;
  }).bind(this);

  scope.dispose = function() {
    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'keydown', onKeyDown, false );
    document.removeEventListener( 'keyup', onKeyUp, false );
    document.removeEventListener( 'mousedown', onMouseDownClick, false );
    document.removeEventListener( 'mouseup', onMouseUpClick, false );
  };

  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  document.addEventListener( 'mousedown', onMouseDownClick, false );
  document.addEventListener( 'mouseup', onMouseUpClick, false );

  scope.enabled = false;

  scope.getObject = function () {

    return yawObject;

  };

  scope.update = function () {

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.y -= 9.8 * 100.0 * delta;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize();

    var currentSpeed = scope.speed;
    if (run && (moveForward || moveBackward || moveLeft || moveRight)) currentSpeed = currentSpeed + (currentSpeed * 1.1);

    if ( moveForward || moveBackward ) velocity.z -= direction.z * currentSpeed * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * currentSpeed * delta;

    scope.getObject().translateX( -velocity.x * delta );
    scope.getObject().translateZ( velocity.z * delta );
    
    scope.getObject().position.y += ( velocity.y * delta );

    if ( scope.getObject().position.y < scope.height ) {

      velocity.y = 0;
      scope.getObject().position.y = scope.height;

      canJump = true;
    }
    prevTime = time;
  };
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var Instrucciones = document.querySelector("#Instrucciones");
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
  var element = document.body;
  var pointerlockchange = function ( event ) {
    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
      controls.enabled = true;
      Instrucciones.style.display = 'none';
    } else {
      controls.enabled = false;
      Instrucciones.style.display = '-webkit-box';
    }
  };
  var pointerlockerror = function ( event ) {
    Instrucciones.style.display = 'none';
  };

  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  Instrucciones.addEventListener( 'click', function ( event ) {
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    if ( /Firefox/i.test( navigator.userAgent ) ) {
      var fullscreenchange = function ( event ) {
        if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
          document.removeEventListener( 'fullscreenchange', fullscreenchange );
          document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
          element.requestPointerLock();
        }
      };
      document.addEventListener( 'fullscreenchange', fullscreenchange, false );
      document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
      element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
      element.requestFullscreen();
    } else {
      element.requestPointerLock();
    }
  }, false );
} else {
  Instrucciones.innerHTML = 'Your browser not suported PointerLock';
}

var camera, scene, renderer, controls, raycaster, arrow, world;

init();
animate();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function init() {

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  
  world = new THREE.Group();
  
  raycaster = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
  //arrow = new THREE.ArrowHelper(camera.getWorldDirection(new THREE.Vector3()), camera.getWorldPosition(new THREE.Vector3()), 3, 0x000000 );


  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  // Niebla
  // scene.fog = new THREE.Fog( 0xffffff, 0, 2000 );
  // scene.fog = new THREE.FogExp2 (0xffffff, 0.007);

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );
  renderer.outputEncoding = THREE.sRGBEncoding;

  window.addEventListener( 'resize', onWindowResize, false );

  // Sombras
  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0, 100, 0.4 );
  scene.add( light );

  var dirLight = new THREE.SpotLight( 0xffffff, .5, 0.0, 180.0);
  dirLight.color.setHSL( 0.1, 1, 0.95 );
  dirLight.position.set(100, 400, 100);
  dirLight.castShadow = true;
  dirLight.lookAt(new THREE.Vector3());
  scene.add( dirLight );
  
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  dirLight.shadow.camera.far = 3000;

  var dirLightHeper = new THREE.SpotLightHelper( dirLight, 10 );
  //scene.add( dirLightHeper );

  controls = new THREE.FirstPersonControls( camera );
  scene.add( controls.getObject() );

  // ================================================================= EDITABLE =================================================================
  // Piso
  crearFondo([2000,2000], [0,0,0], [90,0,0], 'https://previews.123rf.com/images/kolotuschenko/kolotuschenko1709/kolotuschenko170900006/85260697-textura-de-arena-marr%C3%B3n-para-el-fondo-primer-plano-de-la-playa-de-arena-vista-superior.jpg', [10,10]);
  // Techo
  crearFondo([2000,2000], [0,0,-1000], [90,0,0], 'techo.jpg', [1,1]);
  // Fondo
  crearFondo([2000,1000], [0,500,1000], [0,90,0], 'bajomar1.jpg', [1,1]);
  crearFondo([2000,1000], [0,500,1000], [0,180,0], 'bajomar2.jpg', [1,1]);
  crearFondo([2000,1000], [0,500,1000], [0,270,0], 'bajomar3.jpg', [1,1]);
  crearFondo([2000,1000], [0,500,1000], [0,0,0], 'bajomar4.jpg', [1,1]);

  // objects

  var Geometry = new THREE.ConeGeometry( 20, 100, 32 );
  Geometry.translate( 0, 20, 0 );

  for ( var i = 0; i < 400; i ++ ) {

    var Material = new THREE.MeshStandardMaterial( { color: Math.random() * 0xffffff, flatShading: false, vertexColors: false } );

    var mesh = new THREE.Mesh( Geometry, Material );
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.scale.x = Math.random() * 2;
    mesh.scale.y = Math.random() * 2;
    mesh.scale.z = Math.random() * 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    //mesh.updateMatrix();
    //mesh.matrixAutoUpdate = false;
    world.add(mesh);
  }
  scene.add( world );

  // ================================================================= EDITABLE =================================================================
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function crearFondo(tamanio,traslacion,rotacion,imagen,repeat) {
  geometriaPlano = new THREE.PlaneGeometry(tamanio[0], tamanio[1], 10, 10);
  texturaPlano = new THREE.TextureLoader().load(imagen);
  texturaPlano.wrapS = texturaPlano.wrapT = THREE.RepeatWrapping;
  texturaPlano.repeat.set(repeat[0], repeat[1]);

  materialPlano = new THREE.MeshBasicMaterial({ map: texturaPlano, side: THREE.DoubleSide });
  terreno = new THREE.Mesh(geometriaPlano, materialPlano);
  terreno.rotation.x = rotacion[0]*(Math.PI/180);
  terreno.rotation.y = rotacion[1]*(Math.PI/180);
  terreno.rotation.z = rotacion[2]*(Math.PI/180);
  terreno.translateX(traslacion[0]); 
  terreno.translateY(traslacion[1]);
  terreno.translateZ(traslacion[2]);
  scene.add(terreno);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Actualziar controles
function animate() {

  requestAnimationFrame( animate );

  if ( controls.enabled === true ) {

    controls.update();

    raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
  }

  renderer.render( scene, camera );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var Controlers = function() {
  this.MouseMoveSensitivity = 0.002;
  this.speed = 800.0;
  this.jumpHeight = 350.0;
  this.height = 30.0;
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = function() {
  var controler = new Controlers();
  var gui = new dat.GUI();
  gui.add(controler, 'MouseMoveSensitivity', 0, 1).step(0.001).name('Mouse Sensitivity').onChange(function(value) {
    controls.MouseMoveSensitivity = value;
  });
  gui.add(controler, 'speed', 1, 8000).step(1).name('Speed').onChange(function(value) {
    controls.speed = value;
  });
  gui.add(controler, 'jumpHeight', 0, 2000).step(1).name('Jump Height').onChange(function(value) {
    controls.jumpHeight = value;
  });
  gui.add(controler, 'height', 1, 3000).step(1).name('Play Height').onChange(function(value) {
    controls.height = value;
    camera.updateProjectionMatrix();
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
