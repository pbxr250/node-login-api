import * as THREE from 'three';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';


// create a scene, that will hold all our elements such as objects, cameras and lights.
var scene = new THREE.Scene();

// create a camera, which defines where we're looking at.
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// create a render and set the size
var webGLRenderer = new THREE.WebGLRenderer({ alpha: true  });
//webGLRenderer.setClearColor(0x000000, 0.0);
webGLRenderer.setSize(window.innerWidth, window.innerHeight);
//webGLRenderer.shadowMapEnabled = true;


// position and point the camera to the center of the scene
//camera.position.x = -30;
//camera.position.y = 40;
//camera.position.z = 50;
//camera.lookAt(new THREE.Vector3(10, 0, 0));
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 50;
camera.lookAt(new THREE.Vector3(0, 0, 0));

// add the output of the renderer to the html element
document.getElementById("WebGL-output").append(webGLRenderer.domElement);

//Text params
var group, textMesh1, textMesh2, textGeo, materials;
var mirror = false;
var textParams = {
    text: "Vue.js",
    height: 1,
    size: 3,
    hover: 4,
    curveSegments: 2,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelEnabled: true,
    font: undefined,
    fontName: "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
    fontWeight: "normal" // normal bold
};

materials = [
    new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
    new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
];
group = new THREE.Group();
group.position.y = 0;
group.position.x = -30;

scene.add( group );

var loader = new THREE.FontLoader();
const jsonF = require('three/examples/fonts/optimer_regular.typeface.json');
textParams.font = loader.parse( jsonF );
refreshText();

var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
				dirLight.position.set( 0, 0, 1 ).normalize();
				scene.add( dirLight );

var pointLight = new THREE.PointLight( 0x32a852, 1.5 );
				pointLight.position.set( -30, 0, 10 );
				scene.add( pointLight );

var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster = new THREE.Raycaster();
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false );
// END Text params


// call the render function
var step = 0;

var knot;

// setup the control gui
var controls = new function () {
    // we need the first child, since it's a multimaterial
    this.radius = 29;
    this.tube = 15;
    this.radialSegments = 37;
    this.tubularSegments = 4;
    this.p = 2;
    this.q = 6;
    this.heightScale = 0.7;
    this.asParticles = true;
    this.rotate = true;

    this.redraw = function () {
        // remove the old plane
        if (knot) scene.remove(knot);
        // create a new one
        var geom = new THREE.TorusKnotGeometry(controls.radius, controls.tube, Math.round(controls.radialSegments), Math.round(controls.tubularSegments), Math.round(controls.p), Math.round(controls.q), controls.heightScale);

        if (controls.asParticles) {
            knot = createParticleSystem(geom);
        } 

        // add it to the scene.
        scene.add(knot);
    };
}


// var gui = new dat.GUI();
// gui.add(controls, 'radius', 0, 40).onChange(controls.redraw);
// gui.add(controls, 'tube', 0, 40).onChange(controls.redraw);
// gui.add(controls, 'radialSegments', 0, 400).step(1).onChange(controls.redraw);
// gui.add(controls, 'tubularSegments', 1, 20).step(1).onChange(controls.redraw);
// gui.add(controls, 'p', 1, 10).step(1).onChange(controls.redraw);
// gui.add(controls, 'q', 1, 15).step(1).onChange(controls.redraw);
// gui.add(controls, 'heightScale', 0, 5).onChange(controls.redraw);
// gui.add(controls, 'asParticles').onChange(controls.redraw);
// gui.add(controls, 'rotate').onChange(controls.redraw);

// gui.close();

controls.redraw();

render();

// from THREE.js examples
function generateSprite() {

    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;

    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
    gradient.addColorStop(0.2, 'rgba(0,255,100,1.0)');
    gradient.addColorStop(0.4, 'rgba(0,0,64,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;

}

function createParticleSystem(geom) {
    var material = new THREE.PointsMaterial({
        color: 0xffffff,
        depthWrite: false,
        size: 3,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: generateSprite()
    });

    var system = new THREE.Points(geom, material);
    system.sortParticles = true;
    return system;
}


function render() {
    if (controls.rotate) {
        knot.rotation.y = step += 0.0005;
        group.rotation.y = -step;
    }

    // render using requestAnimationFrame
    requestAnimationFrame(render);

    raycasting();
    webGLRenderer.render(scene, camera);
}

function createText() {

    textGeo = new THREE.TextGeometry( textParams.text, {

        font: textParams.font,

        size: textParams.size,
        height: textParams.height,
        curveSegments: textParams.curveSegments,

        bevelThickness: textParams.bevelThickness,
        bevelSize: textParams.bevelSize,
        bevelEnabled: textParams.bevelEnabled

    } );

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    var triangle = new THREE.Triangle();

    // "fix" side normals by removing z-component of normals for side faces
    // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

    if ( ! textParams.bevelEnabled ) {

        var triangleAreaHeuristics = 0.1 * ( textParams.height * textParams.size );

        for ( var i = 0; i < textGeo.faces.length; i ++ ) {

            var face = textGeo.faces[ i ];

            if ( face.materialIndex == 1 ) {

                for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                    face.vertexNormals[ j ].z = 0;
                    face.vertexNormals[ j ].normalize();

                }

                var va = textGeo.vertices[ face.a ];
                var vb = textGeo.vertices[ face.b ];
                var vc = textGeo.vertices[ face.c ];

                var s = triangle.set( va, vb, vc ).getArea();

                if ( s > triangleAreaHeuristics ) {

                    for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                        face.vertexNormals[ j ].copy( face.normal );

                    }

                }

            }

        }

    }

    var centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );

    textMesh1 = new THREE.Mesh( textGeo, materials );

    textMesh1.position.x = centerOffset;
    textMesh1.position.y = textParams.hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add( textMesh1 );

    if ( mirror ) {

        textMesh2 = new THREE.Mesh( textGeo, materials );

        textMesh2.position.x = centerOffset;
        textMesh2.position.y = - textParams.hover;
        textMesh2.position.z = textParams.height;

        textMesh2.rotation.x = Math.PI;
        textMesh2.rotation.y = Math.PI * 2;

        group.add( textMesh2 );

    }

}

function refreshText() {


    group.remove( textMesh1 );
    if ( mirror ) group.remove( textMesh2 );

    if ( ! textParams.text ) return;

    createText();

}


function onDocumentMouseMove( event ) {

    //event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onDocumentMouseDown( event ) {

    //event.preventDefault();

    raycaster.setFromCamera( mouse, camera );
    var its = raycaster.intersectObject( scene.children[0].children[0], false );
    if ( its.length > 0 ) {
        window.location.href = "https://vuejs.org";
    }

}


function raycasting() {

    raycaster.setFromCamera( mouse, camera );
    var its = raycaster.intersectObject( scene.children[0].children[0], false );
    if ( its.length > 0 ) {
        if ( INTERSECTED != its[0].object ) {
            if ( INTERSECTED ) 
                INTERSECTED.material[0].emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = its[0].object;
            INTERSECTED.currentHex = INTERSECTED.material[0].emissive.getHex();
            INTERSECTED.material[0].emissive.setHex( 0xff0000 );
        }
    } else {
        if ( INTERSECTED ) 
            INTERSECTED.material[0].emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }
}