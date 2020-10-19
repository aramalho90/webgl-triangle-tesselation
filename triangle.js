var gl;
var modelT = [];
var modelL = [];
var mainTriangle = [vec2(-0.5, -0.5), vec2(0, 0.5), vec2(0.5, -0.5)];
var lineMode = false;
var program;
var nDiv = 0;
var v1;
var v2;
var v3;
var theta = 0.0;
var thetaLoc;

var trackingMouse = false;

var startX;
var startY;
var curx;
var cury;
var canvas;

window.onload = init;

function init() {

    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.1);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var bufferLines = gl.createBuffer();
    var bufferTriangles = gl.createBuffer();

    if (lineMode) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferLines);
        modelL = subdivisao(nDiv, mainTriangle);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(modelL), gl.STATIC_DRAW);
    } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferTriangles);
        modelT = subdivisao(nDiv, mainTriangle);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(modelT), gl.STATIC_DRAW);
    }

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    
        canvas.addEventListener("mousedown", function(event) {
        var x = event.offsetX;
        var y = event.offsetY; 
        startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function(event) {
        var x = event.offsetX;
        var y = event.offsetY;
        stopMotion();
    });

    canvas.addEventListener("mousemove", function(event) {

        var x = event.offsetX;
        var y = event.offsetY;
        mouseMotion(x, y);
    });

    render();
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(thetaLoc, theta);
    if (lineMode) {
        gl.drawArrays(gl.LINES, 0, modelL.length);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, modelT.length);
    }
	//requestAnimeFrame(render);
}

function button(value) {
    lineMode = value;
    init();
}

function subdivideTriangle(v1, v2, v3, out) {
    var v1v2 = mix(v1, v2, 0.5); // função definida em MV.js
    var v1v3 = mix(v1, v3, 0.5);
    var v2v3 = mix(v2, v3, 0.5);

    // Add 1st triangle
    out.push(v1);
    out.push(v1v2);
    out.push(v1v3);

    // Add 2nd triangle
    out.push(v1v2);
    out.push(v2);
    out.push(v2v3);

    // Add 3rd triangle
    out.push(v1v3);
    out.push(v2v3);
    out.push(v3);

    // Add 4th (inner) triangle
    out.push(v1v2);
    out.push(v2v3);
    out.push(v1v3);

}

function updateDivValue(value) {
    document.getElementById('divValue').value = value;
    nDiv = value;
    init();
}

function commitVerts(v1, v2, v3) {
    modelL.push(v1);
    modelL.push(v2);
    modelL.push(v2);
    modelL.push(v3);
    modelL.push(v3);
    modelL.push(v1);
}

function subdivisao(nDivi, mainTriangle) {
    if (nDivi == 0) 
	{
        modelT = mainTriangle;
    } else {
        var newTriangle;
        var lastVert;
        modelT = mainTriangle;
        for (var i = nDivi; i > 0; i--) {
            newTriangle = [];
            lastVert = modelT.length;
            for (var j = 0; j < lastVert; j += 3) {
                subdivideTriangle(modelT[j], modelT[j + 1], modelT[j + 2], newTriangle);
            }
            //console.log(newTriangle);
            modelT = newTriangle;
        }
    }
    modelL=[];
    for (var k = 0; k < modelT.length; k += 3) {
        commitVerts(modelT[k], modelT[k + 1], modelT[k + 2]);
    }
    if (lineMode) {
        return modelL;
    } else
        return modelT;
}

function updateTwistValue(value) {
    theta += value;
    render();

}

function startMotion(x, y) {
    trackingMouse = true;
    startX = x;
    startY = y;
}

function stopMotion() {
    trackingMouse = false;
}

function mouseMotion(x, y) {

    if (trackingMouse) {
        curx = x;
        cury = y;
        

		
        var u = vec2(startX - canvas.width/2,startY - canvas.height/2);
        var v = vec2(curx - canvas.width/2,cury - canvas.height/2);
		
		u = normalize(u);
		v = normalize(v);
		
        var angle = Math.acos(dot(u, v));
		
		var z = u[0]*v[1] - u[1]*v[0];
		
		if(z>0) angle = -angle;  
		
		if(!isNaN(angle)){
        updateTwistValue(angle);
		}
		
		startX = x;
		startY = y;
    }
}