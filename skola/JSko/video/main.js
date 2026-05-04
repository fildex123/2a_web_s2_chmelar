let d = document.getElementById('d');
let video = document.getElementById('v');
let rek = document.getElementById('reklama');
let mem =false;
d.addEventListener('click', () => {
    console.log('awoefieowbfiahvj');
    if (video.paused) {
        video.play();
        d.textContent = "Pause";
    } else {
        video.pause();
        d.textContent = "Play";
    }
});

window.addEventListener('focus',()=>{
    if(!mem){
        video.play();
        d.textContent = "Pause";
    }
    rek.style.display = "block";     
});

window.addEventListener('blur',()=>{
        mem = video.paused;
        video.pause();
        d.textContent = "Play";
});