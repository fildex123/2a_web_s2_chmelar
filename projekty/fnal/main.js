document.addEventListener("wheel", (e) => {
    e.preventDefault();

    const speed = 0.5;
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;

    window.scrollBy({
        left: delta * speed,
    });
}, { passive: false });

document.addEventListener("DOMContentLoaded", () => { console.log("DOM je načtený!"); 
    motor.play();
});
const camera1 = document.getElementById("camera1"); 
const camera2 = document.getElementById("camera2"); 
const cameraView = document.getElementById("cameraView");
const cameraView_r = document.getElementById("cameraView_real");
const back_to_main = document.getElementById("back_to_main");
const POV = document.getElementById("POV");
const motor = document.getElementById("motor");

camera1.addEventListener("click", () => { 
    cameraView.style.display="block";
    POV.style.display="none";
}); 
camera2.addEventListener("click", () => { 
    cameraView.style.display="block"; 
    POV.style.display="none";
});


const images = [ "img/alfabeta_jirka.jpg","img/balcony_mart.jpg","img/dining_hall_david.jpg","img/Foyer.jpg","img/part_service.jpg","img/play_room.jpg","img/staircase.jpg" ]; 
let index = 0; 

cameraView.addEventListener("click", () => {
    index++;
    camera1.src = images[index % images.length];
    camera2.src = images[(index +1 )% images.length];
    cameraView_r.src = images[index % images.length];
});
back_to_main.addEventListener("click", () => {
    cameraView.style.display="none"; 
    POV.style.display="block";
});


