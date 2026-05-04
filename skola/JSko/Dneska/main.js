let sec = document.getElementById('sec');
let min = document.getElementById('min');
let start = document.getElementById('start');
let stop = document.getElementById('stop');

let sek = 0;
let minu = 0;
let time;

/*

let time = window.setInterval(funkce, milisecundy);
let time = window.setTimeout(funkce, milisecundy);

clearTimeout(time);
clearInterval(time);

*/

start.addEventListener('click',()=> {
    //time = 
    window.setInterval(stopwach(),1000);
});
//stop.addEventListener('click',()=> {clearInterval(time)});


function stopwach()
{
    sek=+1;
    sec.innerHTML=sek;
}