const state = {
    keys: [],
    mouse: {
        down: false,
        before: {
            x: 0,
            y: 0
        },
        now: {
            x: 0,
            y: 0
        }
    },
    size: {
        height: 0, // canvas Height
        width: 0, // Canvas Width
        _height: 0, // Real Height
        _width: 0, // Real Width
        top: 0,
        left: 0,
        track: { // track how much have we moved in any direction
            top: 0,
            left: 0
        }
    },
    tool: 'hand', // hand is the tool that can grab and move around the canvas unlike cursor
    ctx: null, // Used for the grid
    /*
    * used to draw selection, selection boxes, ghost elements, anything that needs a high refresh rate
    * so we can render it without re-rendering every other element
    * */
    prototyping: null
}








/*
* Init The State
* * * * * * * * * * */
const containerRect = document.querySelector('.container').getBoundingClientRect();
state.size.height = containerRect.height
state.size.width = containerRect.width

// this should be the real width and height, so replace it with your drawing real height and width
// or leave it as it is for new drawings
state.size._height = containerRect.height
state.size._width = containerRect.width








/*
* Draw Grid
* * * * * * * * * * */
const drawGrid = () => {
    const space = 150;
    // top is the position where the first line should be drawn (it's this part that gives the scrolling illusion)
    // left is the position where the first line should be drawn 
    const top = (- state.size.track.top % space);
    const left = (- state.size.track.left % space); // - space is used only to reverse the direction of the lines
    
    // clear the canvas
    state.ctx.clearRect(0, 0, state.size.width, state.size.height);
    
    // draw the 1px grid lines on the x axis
    for (let i = top; i < state.size.height; i += space) {
        state.ctx.beginPath();
        state.ctx.moveTo(0, i);
        state.ctx.lineTo(state.size.width, i);
        state.ctx.strokeStyle = '#ccc';
        state.ctx.stroke();
    }
    
    // draw the 1px grid lines on the y axis
    for (let i = left; i < state.size.width; i += space) {
        state.ctx.beginPath();
        state.ctx.moveTo(i, 0);
        state.ctx.lineTo(i, state.size.height);
        state.ctx.strokeStyle = '#ccc';
        state.ctx.stroke();
    }
    
    // draw Both X and Y Scrollbars to show the scrolling animation and percentage
    const yHeight = (state.size.height / state.size._height) * state.size.height
    const xWidth = (state.size.width / state.size._width) * state.size.width
    const yTop = (state.size.top / state.size._height) * state.size.height
    const xLeft = (state.size.left / state.size._width) * state.size.width
    const sSize = 10; // scrollbar size
    state.ctx.fillStyle = 'rgba(79,79,79,0.42)'
    state.ctx.beginPath();
    state.ctx.moveTo(state.size.width - sSize, yTop);
    state.ctx.arcTo(state.size.width, yTop, state.size.width, yTop + sSize, sSize / 2);
    state.ctx.arcTo(state.size.width, yTop + yHeight, state.size.width - sSize, yTop + yHeight, sSize / 2);
    state.ctx.arcTo(state.size.width - sSize, yTop + yHeight, state.size.width - sSize, yTop + yHeight - sSize, sSize / 2);
    state.ctx.arcTo(state.size.width - sSize, yTop, state.size.width, yTop, sSize / 2);
    state.ctx.fill();
    state.ctx.beginPath();
    state.ctx.moveTo(xLeft, state.size.height - sSize);
    state.ctx.arcTo(xLeft, state.size.height, xLeft + sSize, state.size.height, sSize / 2);
    state.ctx.arcTo(xLeft + xWidth, state.size.height, xLeft + xWidth, state.size.height - sSize, sSize / 2);
    state.ctx.arcTo(xLeft + xWidth, state.size.height - sSize, xLeft + xWidth - sSize, state.size.height - sSize, sSize / 2);
    state.ctx.arcTo(xLeft, state.size.height - sSize, xLeft, state.size.height, sSize / 2);
    state.ctx.fill();
    
}







/*
* Mouse Scrolling Handler
* * * * * * * * * * */
const handelMouseScroll = () => {
    // if the mouse is down and the tool is hand
    if (state.mouse.down && state.tool === 'hand') {
        const xDistance = state.mouse.now.x - state.mouse.before.x;
        const yDistance = state.mouse.now.y - state.mouse.before.y;
        
        // handel Y Scrolling
        if (yDistance >= 0) { // Up
            if (state.size.top === 0){ // When reaching top
                state.size._height += yDistance
            } else { // When There is space to scroll
                state.size.top = (state.size.top - yDistance) >= 0 ? (state.size.top - yDistance) : 0
            }
            state.size.track.top -= yDistance
        } else { // DOWN
            if (state.size.top + state.size.height === state.size._height){ // when reaching bottom
                state.size._height -= yDistance
                state.size.top -= yDistance
            } else { // When there is space to scroll
                state.size.top = (state.size.top - yDistance) <= state.size._height - state.size.height ? (state.size.top - yDistance) : state.size._height - state.size.height
            }
            state.size.track.top -= yDistance
        }
        
        
        // handel X Scrolling
        if (xDistance >= 0) { // Right
            if (state.size.left === 0){ // When reaching right
                state.size._width += xDistance
            } else { // When There is space to scroll
                state.size.left = (state.size.left - xDistance) >= 0 ? (state.size.left - xDistance) : 0
            }
            state.size.track.left -= xDistance
        } else { // Left
            if (state.size.left + state.size.width === state.size._width) { // when reaching left
                state.size._width -= xDistance
                state.size.left -= xDistance
            } else { // When there is space to scroll
                state.size.left = (state.size.left - xDistance) <= state.size._width - state.size.width ? (state.size.left - xDistance) : state.size._width - state.size.width
            }
            state.size.track.left -= xDistance
        }
        
        // update the mouse before position
        state.mouse.before.x = state.mouse.now.x
        state.mouse.before.y = state.mouse.now.y
        
        // draw the grid
        drawGrid()
    }
}







/*
* Cursor Selection... handler
* * * * * * * * * * */
const handelCursor = () => {
    // compare the mouse.before and mouse.now and draw the selection box
    if (state.mouse.down && state.tool === 'cursor') {
        const xDistance = state.mouse.now.x - state.mouse.before.x;
        const yDistance = state.mouse.now.y - state.mouse.before.y;
        state.prototyping.clearRect(0, 0, state.size.width, state.size.height);
        state.prototyping.fillStyle = 'rgba(0,123,255,0.25)'
        state.prototyping.fillRect(state.mouse.before.x, state.mouse.before.y, xDistance, yDistance);
        state.prototyping.strokeStyle = 'rgba(0,123,255,0.5)'
        state.prototyping.strokeRect(state.mouse.before.x, state.mouse.before.y, xDistance, yDistance);
        drawGrid()
    } else {
        // In case The Mouseup event fires we will call handelCursor but the mouse.down will be false so it will just clear the prototyping canvas
        // it's better if you create a loop to keep the prototyping in sync but in my simple case it's not needed
        state.prototyping.clearRect(0, 0, state.size.width, state.size.height);
    }
}







/*
* Wheel Scrolling Handler
* * * * * * * * * * */
const handelWheelScroll = (e) => {
    if (!state.keys.includes('shift')){
        
        // Y Scrolling
        if (e.deltaY > 0){
            state.size.track.top += 10
            if (state.size.top + state.size.height === state.size._height){
                state.size._height += 10
                state.size.top += 10
            } else {
                state.size.top = state.size.top + 10 <= state.size._height - state.size.height ? state.size.top + 10 : state.size._height - state.size.height
            }
        } else if (e.deltaY < 0) {
            state.size.track.top -= 10
            if (state.size.top > 0){
                state.size.top = state.size.top - 10 >= 0 ? state.size.top - 10 : 0
            } else {
                state.size._height += 10
            }
        }
        
    } else {
        
        // X Scrolling
        if (e.deltaY > 0){
            state.size.track.left += 10
            if (state.size.left + state.size.width === state.size._width){
                state.size._width += 10
                state.size.left += 10
            } else {
                state.size.left = state.size.left + 10 <= state.size._width - state.size.width ? state.size.left + 10 : state.size._width - state.size.width
            }
        } else if (e.deltaY < 0) {
            state.size.track.left -= 10
            if (state.size.left > 0){
                state.size.left = state.size.left - 10 >= 0 ? state.size.left - 10 : 0
            } else {
                state.size._width += 10
            }
        }
        
    }
    
    
    // draw the grid
    drawGrid();
}






/*
* Init The Canvas and Draw the first grid
* * * * * * * * * * */
const init = () => {
    const cvs = document.getElementById('canvas-space');
    cvs.setAttribute('width', state.size.width);
    cvs.setAttribute('height', state.size.height);
    state.ctx = cvs.getContext('2d');
    drawGrid();
    
    const prototyping = document.getElementById('prototyping-space');
    prototyping.setAttribute('width', state.size.width);
    prototyping.setAttribute('height', state.size.height);
    state.prototyping = prototyping.getContext('2d');
}







/*
* Init All Events
* * * * * * * * * * */
window.addEventListener('mousemove', (e) => {
    if (state.mouse.down && state.tool === 'hand') {
        state.mouse.now.x = e.clientX
        state.mouse.now.y = e.clientY
        
        handelMouseScroll()
    } else if (state.mouse.down && state.tool === 'cursor') {
        state.mouse.now.x = e.clientX
        state.mouse.now.y = e.clientY

        handelCursor()
    }
});

window.addEventListener('wheel', (e) => {
    handelWheelScroll(e)
})

window.addEventListener('mousedown', (e) => {
   state.mouse.down = true
    state.mouse.before.x = e.clientX
    state.mouse.before.y = e.clientY
    state.mouse.now.x = e.clientX
    state.mouse.now.y = e.clientY
});

window.addEventListener('mouseup', (e) => {
    state.mouse.down = false
    
    if (state.tool === 'cursor') {
        handelCursor()
    }
});

window.addEventListener('keydown', (e) => {
    if (!state.keys.includes(e.key.toLowerCase())) state.keys.push(e.key.toLowerCase())
});

window.addEventListener('keyup', (e) => {
    if (state.keys.includes(e.key.toLowerCase())) state.keys = state.keys.filter(k => k !== e.key.toLowerCase())
});

// Tools Changing Events
document.querySelectorAll('.tools [data-tool]').forEach(e => {
    e.addEventListener('click', (e) => {
        state.tool = e.target.getAttribute('data-tool');
        document.querySelector('.tools [data-tool].active').classList.remove('active')
        e.target.classList.add('active')
    })
});







/*
* Init The App And Enjoy (happy coding 😉)
* * * * * * * * * * * * */
init();