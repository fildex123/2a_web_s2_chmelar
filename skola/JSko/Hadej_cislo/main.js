let cislo = Math.floor((Math.random()*50)+1);

for(let i = 1;i<=5;i++){
let cis = window.prompt("tipni si cislo 1-50. Pokus:" + i,25);
if(cis==cislo){
window.alert("trefa");
}else if(cis>cislo){
window.alert("je miř níže");
}else{
window.alert("je miř víše");
}
}