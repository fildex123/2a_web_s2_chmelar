let jmeno = document.getElementById('client-name');
let zprava = document.getElementById('issue-desc');
let sub = document.getElementById('submit-ticket');

let jmenoS = sessionStorage.getItem('jmeno');
let zpravaS = sessionStorage.getItem('draftTicket');

if (jmenoS) jmeno.value = jmenoS;
if (zpravaS) zprava.value = zpravaS;

jmeno.addEventListener('input', () => {
jmenoS = jmeno.value;
sessionStorage.setItem('jmeno',jmenoS);
});

zprava.addEventListener('input', () => {
zpravaS = zprava.value;
sessionStorage.setItem('draftTicket',zpravaS);
});

sub.addEventListener('click',()=>{

    if (jmenoS === "" || zpravaS === "") {
        return;
    }

    let ticket = {
        date: new Date().toLocaleString(),
        client : jmenoS,
        issue : zpravaS
    }

    let tickets = localStorage.getItem('savedTickets');

    if (tickets) {
        tickets = JSON.parse(tickets);
    } else {
        tickets = [];
    }

    tickets.push(ticket);
    localStorage.setItem('savedTickets',JSON.stringify(tickets));

    jmeno.value = "";
    jmenoS = "";
    zprava.value = "";
    zpravaS = "";

    sessionStorage.removeItem('jmeno');
    sessionStorage.removeItem('draftTicket');
    HistoryTic();
});

let ticketList = document.getElementById('ticket-list');

function HistoryTic(){
    let tickets = localStorage.getItem('savedTickets');
    if (tickets) {
        tickets = JSON.parse(tickets);
    } else {
        tickets = [];
    }

    ticketList.innerHTML = "";

    for(let ticket of tickets){
        let tic = document.createElement('div');
        ticketList.appendChild(tic);
        tic.className = 'ticket-item';

        let h1 = document.createElement('h1');
        tic.appendChild(h1);
        h1.innerHTML=ticket.client;
        let p = document.createElement('p');
        p.innerHTML = ticket.issue;
        tic.appendChild(p);

        let date = document.createElement('div');
        tic.appendChild(date);
        date.className = 'ticket-date';
        date.innerHTML = ticket.date;
    }
}


    HistoryTic();