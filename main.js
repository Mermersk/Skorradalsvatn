import * as twgl from "/twgl-full.module.js"//"/twgl.js-4.16.0/dist/4.x/twgl-full.module.js"

const vertexSource = `#version 300 es

in vec2 a_position;

in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
}

`

const fragmentSource = `#version 300 es
precision mediump float;
out vec4 outputColor;

in vec2 v_texCoord;

uniform sampler2D u_image;
uniform float u_time;

void main() {

    vec4 img = texture(u_image, v_texCoord);
    vec4 area = vec4(0.0, 0.0, 0.0, 1.0);

    if (img.r > 0.70) {
        area = img;
        //img = vec4(0.0, 0.0, 0.0, 1.0);
    }
    
    vec2 nc = gl_FragCoord.xy / vec2(1500, 693);

    nc.y = (nc.y - 0.5) * 2.0;
    float wave = nc.x - u_time;
    wave = sin(wave); //sin(wave*3.0)/5.0 + 0.5;

    wave = wave * cos(u_time /4.0);
    wave = (wave / 2.0) + 0.25;
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

    float distFromWave = distance(wave, nc.y);

    color = distFromWave * vec4(0.0, 1.0, 1.0, 1.0);

    //float flowLine = step(0.01, distFromWave) * step(-0.01, distFromWave);
    //flowLine = 1.0 - flowLine;
    //color.g = flowLine;


    //area = area * wave;
    img.r = (img.r * wave * area.a) * 2.0;
    outputColor = img;//mix(color, img, 0.8);
}
`
const canvas = document.getElementById("c")

canvas.width = 1500
canvas.height = 693

const gl = canvas.getContext("webgl2")
console.log(gl)
twgl.isWebGL2(gl) ? console.log("Webgl2 True") : console.error("Not Webgl2")

const glProgram = twgl.createProgramInfo(gl, [vertexSource, fragmentSource])

const arrays = {
    a_position: { numComponents: 2, data: [
        -1, -1,
        -1, 1,
        1, -1,

        1, -1,
        1, 1,
        -1, 1
    ] },

    a_texCoord: { numComponents: 2, data: [
        0, 0,
        0, 1,
        1, 0,

        1, 0,
        1, 1,
        0, 1
    ]}
    
}

const buffers = twgl.createBufferInfoFromArrays(gl, arrays);
console.log(buffers)

const imgTex = twgl.createTexture(gl, {
    src: "s-resized.png",
    flipY: true
})

console.log(imgTex)

const uniforms = {
    u_image: imgTex
}

twgl.setBuffersAndAttributes(gl, glProgram, buffers)

gl.useProgram(glProgram.program)
gl.viewport(0, 0, canvas.width, canvas.height)
twgl.setUniforms(glProgram, uniforms)

//setTimeout(ss, 100)

//function ss() {
    //twgl.drawBufferInfo(gl, buffers)
//}

function draw(time) {

    let timeInSeconds = time * 0.001
    //console.log(timeInSeconds)

    gl.useProgram(glProgram.program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    uniforms.u_time = timeInSeconds
    
    twgl.setUniforms(glProgram, uniforms)
    twgl.drawBufferInfo(gl, buffers)
    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)