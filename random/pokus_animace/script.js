const scale = 3;
/*
const frameWidth  = 9;
const frameHeight = 8;
const totalFrames = 4;
*/

let row = 1;
let rowWidth = [9,8] 
let rowHeight = [8,7]
let rowStart = [0,9]
let moveFrames = [3,3,2] // +1 dead state

// X pozice každého framu na sheetu (left hodnoty -1 kvůli indexování od 1)

const el = document.createElement('div');
el.style.cssText = `
  width: ${rowWidth[row] * scale}px;
  height: ${rowHeight[row] * scale}px;
  background-image: url('enemy_sheet.png');
  background-size: ${60 * scale}px auto;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  position: fixed;
  left: 100px;
  top: 100px;
`;
document.body.appendChild(el);

let currentFrame = 0;

setInterval(() => {
  currentFrame = (currentFrame + 1) % totalFrames;
  const x = currentFrame*rowWidth[row];
  const pxHeight = 0;
  let i = 0;
  for(height in rowHeight){
    pxHeight +=height;
    if(i>=row){
      pxHeight += i;
      break;
    }
    i++;  
  }
  el.style.backgroundPosition = `${-x * scale}px ${-pxHeight * scale}px`;
}, 500);
