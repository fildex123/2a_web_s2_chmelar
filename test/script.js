// API dokumentace: https://mottl.delta-www.cz/tada/index.php


let tab = document.getElementById('leads-tbody');
let submit = document.getElementsByClassName('btn-primary');
let pole1 = document.getElementById('companyName');
let pole2 = document.getElementById('contactEmail');

async function Get(){
    const responce = await fetch(`https://mottl.delta-www.cz/tada/api.php?path=Leads`);
    let data = await responce.json();
    console.log(data);
    for(row of data){

        let tr = document.createElement('tr');
        let fc = document.createElement('td');
            let inp = document.createElement('input');
            inp.type = 'checkbox';
            inp.class = 'lead-checkbox';
            inp.value = row.id;
        fc.appendChild(inp);
        let sc = document.createElement('td');
        sc.innerHTML = row.company_name;
        let tc = document.createElement('td');
        tc.innerHTML = row.contact_email;
        let cc = document.createElement('td');
            let span = document.createElement('span');
            span.classList.add('badge');
            span.classList.add(`badge-${row.status}`);
            span.innerHTML = row.status;
            cc.appendChild(span);
        tr.appendChild(fc);
        tr.appendChild(sc);
        tr.appendChild(tc);
        tr.appendChild(cc);
        tab.appendChild(tr);
    }
}
Get();

submit.addEventlistener( 'click',async() => {
    //prevent.default();
    let com = pole1.value;
    let email = pole2.value;
    app.post('https://mottl.delta-www.cz/tada/api.php?path=users', (request, response) => {
	
    var lead = {
        Key: '420b2feed7768fc932c26b22677a0588' ,
        id: 6,
        company_name: com,
        contact_email:email ,
        status:'new'
    };

    books.push(book);
    response.send(book);
});
});
