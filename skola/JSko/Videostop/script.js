let btnplay = document.getElementById('playBtn');
let balance = document.getElementById('balance');
let images = document.querySelectorAll('.p-1');
let numberDice=[1,2,3];
let isPressed = false;
let blncNumber = 100;
let interval = null;


btnplay.addEventListener('click', () => {
    if(isPressed){
        btnplay.innerHTML="play";
        isPressed=false;
        clearInterval(interval);
        interval = null;

        let div = document.body.appendChild(document.createElement(div));
        div.appendChild()
    }else{
        btnplay.innerHTML="stop";
        isPressed=true;
        interval = setInterval(change, 50);
    }
    balance.innerHTML=blncNumber;
});

function change(){
    let i =0;
    for(let img of images){
        let r = Math.floor(Math.random() * 6) + 1;
        img.src = `img/${r}.svg`;
        numberDice[i]=r;
        i++;
    }
}