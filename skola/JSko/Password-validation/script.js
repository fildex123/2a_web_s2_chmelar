//sem přijde váš kód
const oldp=document.getElementById('oldpass');
const pass=document.getElementById('pass');
const pass2=document.getElementById('pass2');
const sub =document.getElementById('submit');
const war =document.getElementById('warning');
let passval = '1234';


oldp.addEventListener('keydown', kontrola);
pass2.addEventListener('keydown', kontrola);
pass.addEventListener('keydown', kontrola);

function kontrola(){
        if(pass.value!=pass2.value){
            war.innerText='hesla se neshodují';
        }else if(passval=oldp.value){
            war.innerText='špatné heslo';
        }else{
            sub.disabled = "";
        }
        sub.disabled = "disabled";
};

sub.addEventListener('click', () => {
    if(pass.value!=pass2.value){
            war.innerText='hesla se neshodují';
        }else if(passval=oldp.value){
            war.innerText='špatné heslo';
        }else{
            passval = oldp.value;
            sub.disabled = "disabled";
        }
});