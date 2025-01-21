// ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = ` 
  attribute vec4 a_Position;
  uniform float u_Size; 
  void main() { 
    gl_Position = a_Position; 
    gl_PointSize = u_Size; 
  }`

// Fragment shader program
var FSHADER_SOURCE = ` 
  precision mediump float; 
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//GLSL global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

//setup webgl
function setupWebGL(){

    //get canvas elem
    canvas = document.getElementById('webgl', {preserveDrawingBuffer: true});

    //get rendering context for webgl
    gl = getWebGLContext(canvas);

    //on error
    if(!gl){

        console.log("failed to get rendering context for WebGL");

        return;

    }

}

//connect GLSL vars
function connectVariablesToGLSL(){

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }

}

//UI globals

//color global var
let g_selectedColor = [1,1,1,1];

//size global
let g_selectedSize = 5;

//html ui
function addActionsforHtmlUI(){

    document.getElementById('clearButton').onclick = function(){

        g_shapesList = [];

        renderAllShapes();

        //console.log("gooosey")

    };

    document.getElementById('redSlide').addEventListener('mouseup', function(){

        g_selectedColor[0] = this.value/100;

    });

    document.getElementById('greenSlide').addEventListener('mouseup', function(){

        g_selectedColor[1] = this.value/100;

    });

    document.getElementById('blueSlide').addEventListener('mouseup', function(){

        g_selectedColor[2] = this.value/100;

    });

    document.getElementById('sizeSlide').addEventListener('mouseup', function(){

        g_selectedSize = this.value;

    });

}

//display a cursor 
function cursor(x, y){

    //clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    renderAllShapes();

    //preview brush color and size
    gl.vertexAttrib3f(a_Position, x, y, 0.0);
    gl.uniform4f(u_FragColor, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]);
    gl.uniform1f(u_Size, g_selectedSize);
    gl.drawArrays(gl.POINTS, 0, 1);
}

//main
function main() {

    //set up webgl
    setupWebGL();

    //connect GLSL vars
    connectVariablesToGLSL();

    //HTML ui elements
    addActionsforHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    canvas.onmousemove = function(ev){

        if(ev.buttons == 1){

            click(ev);

        }

        let [x, y] = convertCoordinatesEventToGL(ev);

        cursor(x, y);

    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

}

//shape list
var g_shapesList = [];

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];

//click
function click(ev) {

    let [x,y] = convertCoordinatesEventToGL(ev);

    //point object
    let point = new Point();

    point.position = [x, y];

    point.color = g_selectedColor.slice();

    point.size = g_selectedSize;

    g_shapesList.push(point);

    //draw all shapes in canvas
    renderAllShapes();

}

//conversion 
function convertCoordinatesEventToGL(ev){

    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    //convert
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);

}

//render 
function renderAllShapes(){

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //rendering
    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {

        g_shapesList[i].render();

    }

}
