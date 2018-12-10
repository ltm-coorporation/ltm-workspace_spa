var db;
var remoteCouch = false;

var uuid = 'uuid';
var paymentTableFields = ['party', 'mode', 'amount', 'created_at'];
var stockTableFields = ['name', 'quantity', 'price', 'discount', 'tax', 'created_at'];
var partyTableFields = ['name', 'city', 'phone', 'email'];

window.addEventListener('load', () =>  {
    
    addEventHandlers(false);
    var targetNode = document.getElementById('app');
    var config = { childList: true };    

    
    var callback = function(mutationList, observer){
        for(var mutation of mutationList){
            if(mutation.type == 'childList') return addEventHandlers();
        }
    };

    var observer = new MutationObserver(callback);

    observer.observe(targetNode, config);

});

function addEventHandlers(toggleNavbar = true){

    // if(toggleNavbar) $('.navbar-toggler').click();
    
    $('.navigator').on('click', (e) => {

        e.preventDefault();

        const target = $(e.target);
        const path = target.attr('href');

       
        let ltmObj = new ltm();
        ltmObj.navigateTo(path);
    });

    $('#btn-stock_add').on('click', (e) => {
        e.preventDefault();
        saveStock();
    });

    $('#btn-payment_add').on('click', (e) => {
        e.preventDefault();
        savePayment();
    });

    $('#btn-party_add').on('click', (e) => {
        e.preventDefault();
        saveParty();
    })
}

class docDB {

    constructor(){
        this.docBody = {};
        this.docBody._id = '';
        this.docBody.type = this.constructor.name.toLowerCase();
    }

    save(docToSave){
        
        Object.assign(this.docBody, docToSave)
        this.docBody._id = new Date().toISOString();
        
        let db = new PouchDB('uuid');

        return new Promise((resolve, reject) => {
            db.put(this.docBody, (err, result) => {                
                if(err) return reject(err);
                
                //deleting docBody makes it only in parent class.
                delete this.docBody;
                return resolve(result);
            });
        });
    }
}

// party functions
class Party extends docDB{

    constructor(){
        super();
        this.body = {};
        this.body._id = '';
        this.body._rev = '';
        this.body.name = '';
        this.body.contact = '';
        this.body.phone = '';
        this.body.whatsapp = '';
        this.body.email = '';
        this.body.address = '';
        this.body.city = '';
        this.body.district = '';
        this.body.state = '';
        this.body.pincode = '';
        // this.body.created_at = '';
    }

    save(partyDoc){
        Object.assign(this.body, partyDoc);
        return super.save(this.body).then((res) => { 
                    this.body._id = res.id;
                    this.body._rev = res.rev;
                    return this;
                });
    }
}


function saveParty(){

    var party = new Party();

    party.save(fetchDataFromHTML(party))
    .then((res) => {
        console.log(res.body);
        alertDocSave(party);
    })
    .catch(err => console.log(err));
}


function showPartyList(){
    let modal = new Party();

    db = new PouchDB(uuid);

    db.allDocs({
        include_docs: true,
        descending: true
    }, (err, docs) => {
        console.log(docs);
        drawTable(docs.rows, modal, partyTableFields);
    });

}

function alertDocSave(modal){
    var prefix = modal.constructor.name.toLowerCase();
    document.getElementById(`form-${prefix}`).reset();
    var alertbox = document.getElementById(`alert-${prefix}_save`);
    alertbox.classList.remove('invisible');
    setTimeout(() => {
        alertbox.classList.add('invisible');
    }, 3000);
}

function drawTable(rows, modal, fields){
    let prefix = modal.constructor.name.toLowerCase();
    var tbody = document.getElementById(`${prefix}-table_body`);
    
    tbody.innerHTML = '';

    rows.forEach((docBody, index) => {
        tbody.appendChild(tableRowBuilder(docBody.doc, fields, index+1));
    });
}

function fetchDataFromHTML(modal){
    var doc = {};
    var prefix = modal.constructor.name.toLowerCase() + '-';

    document.querySelectorAll(`[id^=${prefix}]`).forEach((element) => {
        let field = (element.id).replace(prefix, '');
        doc[field] = document.getElementById(element.id).value;
    });

    return doc;
}

// /party functions

// payments functions

// class Payments exten
function savePayment() {

    db = new PouchDB('payments');

    var paymentDoc = {
        _id: new Date().toISOString(),
        party: document.getElementById('payment-party').value,
        mode: document.getElementById('payment-mode').value,
        amount: document.getElementById('payment-amount').value,
        notes: document.getElementById('payment-notes').value,
        created_at: (new Date()).getTime()
    }

    db.put(paymentDoc, function(err, result) {
        if(!err) {
            document.getElementById('payment-form').reset();
            var alertbox = document.getElementById('payment-save_alert');
            alertbox.classList.remove('invisible');
            setTimeout(() => {
                alertbox.classList.add('invisible');
            }, 3000);
        } else {
            console.log(err);
        }
    });
}

function showPaymentList(){
    db = new PouchDB('payments');

    db.allDocs({
        include_docs: true,
        descending: true
    }, function(err, docs) {
        drawPaymentListTable(docs.rows);
    });
}

function drawPaymentListTable(rows){
    var tBody = document.getElementById('payment-table_body');

    tBody.innerHTML = '';

    rows.forEach(function(paymentDoc, index){
        tBody.appendChild(tableRowBuilder(paymentDoc.doc, paymentTableFields, index+1));
    });
}

// stock functions

function saveStock(){

    db = new PouchDB('stock');
    var itemDoc = {
        _id: new Date().toISOString(),
        name: document.getElementById('item-name').value,
        quantity: document.getElementById('item-quantity').value,
        price: document.getElementById('item-price').value,
        
        discount: document.getElementById('item-discount').value,
        tax: document.getElementById('item-tax').value,
        created_at: (new Date()).getTime()
    };

    db.put(itemDoc, function(err, result) {
        if(!err) {
            document.getElementById('stock-form').reset();
            var alertbox = document.getElementById('stock-save_alert');
            alertbox.classList.remove('invisible');
            setTimeout(() => {
                alertbox.classList.add('invisible');
            }, 3000);
        } else {
            console.log(err);
        }
    });
}

function showStockList(){

    db = new PouchDB('stock');
    db.allDocs({
        include_docs: true,
        descending: true,
    }, function(err, docs) {
        // console.log(docs);
        drawStockListTable(docs.rows);
    });
}

function drawStockListTable(rows){
    var tBody = document.getElementById('stock-table_body');
    

    tBody.innerHTML = '';
    // console.log(rows);
    rows.forEach(function(stockDoc, index){
        tBody.appendChild(tableRowBuilder(stockDoc.doc, stockTableFields, index+1));
    });
}

function tableRowBuilder(rowDataObj, rowFields, index){
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    var td = document.createElement('td');

    th.setAttribute('scope', 'row');
    th.innerHTML = index;
    tr.appendChild(th.cloneNode(true));

    rowFields.forEach(function(key){
        if(rowDataObj.hasOwnProperty(key)){
            td.innerHTML = (key == 'created_at')? (new Date(rowDataObj[key])).toLocaleDateString() : rowDataObj[key];
            tr.appendChild(td.cloneNode(true));
        }
    })

    return tr;
}