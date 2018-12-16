
var uuid = 'uuid';
var db = new PouchDB(uuid);
var remoteCouch = `http://localhost:5984/${uuid}`;

var docToEdit = {};
db.changes({
    since:'now',
    live: true
});

db.createIndex({
    index: {
        fields: ['type', '_id']
    }
})
// .then((result) => console.log(result));

// var paymentTableFields = ['party', 'mode', 'amount', 'created_at'];
// var stockTableFields = ['name', 'quantity', 'price', 'discount', 'tax', 'created_at'];
// var partyTableFields = ['name', 'city', 'phone', 'email'];

window.addEventListener('load', () =>  {

    db.replicate.to(remoteCouch);
    db.replicate.from(remoteCouch);
    appReload(false);
    var targetNode = document.getElementById('app');
    var config = { childList: true };    

    
    var callback = function(mutationList, observer){
        for(var mutation of mutationList){
            if(mutation.type == 'childList') return appReload();
        }
    };

    var observer = new MutationObserver(callback);

    observer.observe(targetNode, config);

});

function appReload(toggleNavbar = true){

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
    });

    if(Object.keys(docToEdit).length){
        editDocument(docToEdit);
    }
}

// common functions 
function alertDocSave(modal){    
    var prefix = modal.constructor.name.toLowerCase();
    document.getElementById(`form-${prefix}`).reset();
    var alertbox = document.getElementById(`alert-${prefix}_save`);
    alertbox.classList.remove('invisible');
    setTimeout(() => {
        alertbox.classList.add('invisible');
    }, 3000);
}

function drawTable(rows, modal){
    let prefix = modal.constructor.name.toLowerCase();
    let tbody = document.getElementById(`${prefix}-table_body`);
    let fields = modal.tableFields;

    tbody.innerHTML = '';

    rows.forEach((docBody, index) => {
        tbody.appendChild(tableRowBuilder(docBody.doc, fields, index+1));
    });
}

function tableRowBuilder(rowDataObj, rowFields, index){
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    var td = document.createElement('td');
    var btn = document.createElement('button');

    th.setAttribute('scope', 'row');
    th.innerHTML = index;
    tr.appendChild(th.cloneNode(true));

    rowFields.forEach(function(key){
        if(rowDataObj.hasOwnProperty(key)){
            td.innerHTML = (key == 'created_at')? (new Date(rowDataObj[key])).toLocaleDateString() : rowDataObj[key];
            tr.appendChild(td.cloneNode(true));
        }
    });

    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'btn btn-primary');
    btn.innerHTML = 'Edit';
    btn.addEventListener('click', function(doc){
        // editDocument(doc);
        docToEdit = {};
        docToEdit = doc;

        (new ltm()).navigateTo(`/${doc.type}/edit`)
    }.bind(this, rowDataObj));

    tr.appendChild(btn);

    return tr;
}

function editDocument(editDoc){    

    let docType = editDoc.type;
    let modalName = docType.charAt(0).toUpperCase()+ docType.slice(1);
    // console.log(modalName);
    let modal = new classMapping[modalName];
    let prefix = modal.constructor.name.toLowerCase() + '-';
    
    modal.get(editDoc._id)
    .then((doc) => {
        console.log(doc);
        document.querySelectorAll(`[id^=${prefix}]`).forEach((element) => {
            let field = element.id.replace(`${prefix}`, '');
            // console.log(document.getElementById(element.id));
            document.getElementById(element.id).value = doc[field];
        });
    });

    this.docToEdit = {};
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

function showList(modalName){

    let modal = new classMapping[modalName];
    
    modal.allDocs()
    .then((docs) => {        
        drawTable(docs, modal);
    })
    .catch(err => console.log(err));
}
class docDB {

    constructor(){
        this.docBody = {};
        this.docBody._id = '';
        this.docBody.type = this.constructor.name.toLowerCase();
    }

    allDocs(){
        return new Promise((resolve, reject) => {
            db.find({
                selector:{ type: this.docBody.type},
                sort: [{'_id': 'desc'}]
            }).then((result) => {
                let docs = [];
                result.docs.forEach(doc => docs.push({doc}));
                resolve(docs);
            }).catch(err => reject(err));
        });        
    }

    get(docId){
        return new Promise((resolve, reject) => {
            db.find({
                selector: { 
                    type: this.docBody.type, 
                    _id: docId}, 
            })
            .then(result => resolve(result.docs[0]))
            .catch(err => reject(err));
        });
    }

    save(docToSave){
        
        Object.assign(this.docBody, docToSave)
        // this.docBody._id = new Date().toISOString();
        this.docBody._id = this.create_UUID();
        
        let db = new PouchDB(uuid);

        return new Promise((resolve, reject) => {
            db.put(this.docBody, (err, result) => {                
                if(err) return reject(err);
                
                //deleting docBody makes it only in parent class.
                // also improves performance in large object.
                delete this.docBody;
                return resolve(result);
            });
        });
    }

    create_UUID(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
}
// /common functions

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
    }

    get tableFields() {
        return ['name', 'city', 'phone', 'email'];
    }

    get fields(){
        return [
                [['name', 'city'], 'text'],
                ['email', 'email']
            ];
    }

    get(docId){
        // return new Promise((resolve, reject) => {
                return super.get(docId)
                    // .then(doc => resolve(doc))
                    // .catch(err => reject(err));
            // });
    }

    save(partyDoc){
        Object.assign(this.body, partyDoc);
        // this.validate(this.body,  this.fields)
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

// function showPartyList(){
//     let modal = new Party();

//     db = new PouchDB(uuid);

//     db.allDocs({
//         include_docs: true,
//         descending: true
//     }, (err, docs) => {
//         drawTable(docs.rows, modal, partyTableFields);
//     });
// }
// /party functions

// payments functions
class Payment extends docDB{

    constructor(){
        super();
        this.body = {};
        this.body._id = '';
        this.body._rev = '';
        this.body.party = '';
        this.body.mode = '';
        this.body.amount = '';
        this.body.notes = '';
    }

    get tableFields(){
        return ['party', 'mode', 'amount', 'created_at'];
    }

    save(paymentDoc){
        Object.assign(this.body, paymentDoc);
        return super.save(this.body).then((res) => {
                    this.body._id = res._id;
                    this.body._rev = res.rev;    
                });
    }
}

function savePayment() {

    var payment = new Payment();

    payment.save(fetchDataFromHTML(payment))
    .then((res) => {
        alertDocSave(payment);
    })
    .catch(err => console.log(err));
}

// function showPaymentList(){
    
//     var modal = new Payment();

//     db = new PouchDB(uuid);

//     db.allDocs({
//         include_docs: true,
//         descending: true
//     }, function(err, docs) {
//         drawTable(docs.rows, modal, paymentTableFields);
//     });
// }

// /payment functions

// stock functions
class Stock extends docDB{

    constructor(){
        super();
        this.body = {};
        this.body._id = '';
        this.body._rev = '';
        this.body.name = '';
        this.body.quantity = '';
        this.body.price = '';
        this.body.discount = '';
        this.body.tax = '';
    }

    get tableFields(){
        return ['name', 'quantity', 'price', 'discount', 'tax', 'created_at'];
    }

    save(stockDoc){
        console.log(stockDoc);
        Object.assign(this.body, stockDoc);
        return super.save(this.body).then((res) => {
                    this.body._id = res.id;
                    this.body._rev = res.rev;
                    return this;
                });
    }
}

const classMapping = { Party, Payment, Stock };

function saveStock(){

    let stock = new Stock();

    stock.save(fetchDataFromHTML(stock))
    .then((res) => {
        alertDocSave(stock);
    })
    .catch(err => console.log(err));
}

// function showStockList(){

//     let modal = new Stock();
    
//     modal.allDocs()
//     .then((docs) => {        
//         drawTable(docs, modal);
//     })
//     .catch(err => console.log(err));

//     // db.allDocs({
//     //     include_docs: true,
//     //     descending: true,
//     // }, function(err, docs) {
//     //     drawTable(docs.rows, modal, stockTableFields);
//     // });
// }
// /stock functions