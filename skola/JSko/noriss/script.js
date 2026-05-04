//fetch('https://api.chucknorris.io/jokes/random')

//    https://api.chucknorris.io/jokes/categories

//    https://api.chucknorris.io/jokes/search?query={query}
let btn = document.getElementById('btn');
let vtipos = document.getElementById('vtip');
let select;


btn.addEventListener('click', ()=>{
Vtip();
});


get_category();
async function get_category(){
    const response = await fetch('https://api.chucknorris.io/jokes/categories');
    const categories = await response.json()
    console.log(categories);
    select = document.createElement('select');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    document.body.appendChild(select);
};

async function Vtip() {

    let cat = select.value;
    const responce = await fetch(`https://api.chucknorris.io/jokes/random?category=${cat}`)
    let vtip = await responce.json();
    console.log(vtip);
    vtipos.innerHTML = vtip.value;

}


//https://69cb799b0b417a19e07ab828.mockapi.io/api/test/test_data

