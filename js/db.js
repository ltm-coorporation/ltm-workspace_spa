
var uuid = 'uuid';
var db = new PouchDB(uuid);
var remoteCouch = `http://ltm:qwerty@localhost:5984/${uuid}`;
// var account = 'a9b5854b-543d-4dba-b22d-bd4a899d2dd3-bluemix';
// var remoteCouch = `https://oughtchaveringstensiling:8eceff51782b5087bcb3d318fd9e1fed4b0fedf6@${account}.cloudant.com/ltm-app`;

var docToEdit = {};
db.changes({
    since:'now',
    live: true
});

db.createIndex({
    index: {
        fields: ['_id','type']
    }
})
// .then((result) => console.log(result));

window.addEventListener('load', () =>  {

    db.replicate.to(remoteCouch)
        // .on('complete', (result) => console.log(result));
    db.replicate.from(remoteCouch)
        // .on('complete', (result) => console.log(result));
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

    // document.getElementById('btn-stock_add').addEventListener('click', stockAddClickHandler)
    $('#btn-stock_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Stock');
    });

    $('#btn-payment_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Payment');
    });

    $('#btn-party_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Party');
    });

    if(Object.keys(docToEdit).length){
        editDocument(docToEdit);
    }
}

// function stockAddClickHandler(e){
//     e.preventDefault();
//     saveStock();
// }

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
        docToEdit = {};
        docToEdit = doc;

        (new ltm()).navigateTo(`/${doc.type}/edit`)
    }.bind(this, rowDataObj));
    td.innerHTML = '';
    td.appendChild(btn);
    tr.appendChild(td);

    return tr;
}

function editDocument(editDoc){    

    let docType = editDoc.type;
    let modalName = docType.charAt(0).toUpperCase()+ docType.slice(1);
    let modal = new classMapping[modalName];
    let prefix = modal.constructor.name.toLowerCase() + '-';
    
    modal.get(editDoc._id)
    .then((doc) => {
        console.log(doc);
        document.querySelectorAll(`[id^=${prefix}]`).forEach((element) => {
            let field = element.id.replace(`${prefix}`, '');
            document.getElementById(element.id).value = doc[field];
        });
        return;
    })
    .then(() => {
        $(`#btn-${docType}_add`).off()
            .text(`Update ${docType}`)
            .on('click', (e) => {
                e.preventDefault();
                updateDoc(modal, editDoc);
            });
        
    }).catch(err => console.log(err));

    this.docToEdit = {};
}

function updateDoc(modal, editDoc){
    let doc = fetchDataFromHTML(modal);
    modal.get(editDoc._id)
    .then((result) => {
        doc._id = result._id;
        doc._rev = result._rev;
        return modal.save(doc);        
    })
    .then((res) => {
        alertDocSave(modal);
        let ltmObj = new ltm();
        ltmObj.navigateTo(editDoc.type);
    })
    .catch(err => console.log(err));
}

function saveDoc(modalName){
    let modal = new classMapping[modalName];
    // let modal = new modalDoc();
    modal.save(fetchDataFromHTML(modal))
    .then((res) => alertDocSave(modal))
    .catch(err => console.log(err));
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
// /common functions

// data modals

class Validator{

    is_float(){
        return (arguments[0].match(/\-?\d+\.\d+$/))? true: false;
    }

    is_number(){
        return (arguments[0].match(/^[0-9]+$/))? true: false;
    }
    
    is_string(){
        return (arguments[0].match(/^[0-9a-zA-Z\s]+$/))? true: false;
    }
    
    is_email(){       

        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(arguments[0]))
         {
            return true;
         }
         return false;

    }
    
    is_phone(){
        var phoneno = /^\d{10}$/;
        return (arguments[0].match(phoneno))? true: false;           
    }

    validate(doc, fieldsArray){
        // console.log(doc);
        let validDoc = {};
        validDoc.isValid = true;
        fieldsArray.forEach(fields => {
            // console.log(fields);
            fields[0].forEach(field => {
                // console.log(field)
                if(doc.hasOwnProperty(field)){

                    validDoc[field] = {};
                    validDoc[field].value = doc[field];
                    let valuetype = fields[1];
                    validDoc[field].isValid = this[`is_${valuetype}`](doc[field]);
                    // console.log(this[`is_${valuetype}`](doc[field]));
                    if(!validDoc[field].isValid){
                        validDoc.isValid = false;
                    }
                }
            })
        });
        
        return validDoc;
    }
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
                    _id: docId,
                    type: this.docBody.type
                    }, 
            })
            .then(result => resolve(result.docs[0]))
            .catch(err => reject(err));
        });
    }

    validate(doc){
        let v = new Validator();
        // console.log(this.feilds);
        return  v.validate(doc, this.fields);
    }

    save(docToSave){
        
        Object.assign(this.docBody, docToSave)
        // this.docBody._id = new Date().toISOString();
        // this.docBody._id = docToSave._id ? docToSave._id :this.create_UUID();
        this.docBody._id = docToSave._id ? docToSave._id : new Date().getTime().toString();
        
        // let db = new PouchDB(uuid);

        return new Promise((resolve, reject) => {
            let verfiedDoc = this.validate(this.docBody);
            if(!verfiedDoc.isValid){
                return reject(verfiedDoc);
            }

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

class modalDoc extends docDB {
    constructor(){
        super();
        this.body = {};
        this.body._id = '';
        this.body._rev = '';

        // from child class
        this.fields.forEach(function(fieldTypeArray){
            
            fieldTypeArray[0].forEach(function(field){
                
                this.body[field] = '';
            }.bind(this));
        }.bind(this));
        // console.log(this);
    }

    get(docId){
        return super.get(docId);
    }

    save(docToSave){
        Object.assign(this.body, docToSave);

        return super.save(this.body)
                .then((res) => {
                    this.body._id = res.id;
                    this.body._rev = res.rev;
                    return this;
                });
    }
}
class Party extends modalDoc{

    constructor(){
        super();
        // console.log(this);
        // this.fields.forEach(function(fieldTypeArray){
            
        //     fieldTypeArray[0].forEach(function(field){
                
        //         this.body[field] = '';
        //     }.bind(this));
        // }.bind(this));

        
        // this.body.name = '';
        // this.body.contact = '';
        // this.body.phone = '';
        // this.body.whatsapp = '';
        // this.body.email = '';
        // this.body.address = '';
        // this.body.city = '';
        // this.body.district = '';
        // this.body.state = '';
        // this.body.pincode = '';
    }

    get tableFields() {
        return ['name', 'city', 'phone', 'email'];
    }

    get fields(){
        return [
                [['name', 'contact', 'phone', 'address', 'city', 'district', 'state'], 'string'],
                [['pincode'], 'number'],
                [['email'], 'email'],
                [['phone', 'whatsapp'], 'phone']                
            ];
    }

    // get(docId){
    //     return super.get(docId);
    // }

    // save(partyDoc){
    //     Object.assign(this.body, partyDoc);
    //     // this.validate(this.body,  this.fields)
    //     return super.save(this.body).then((res) => { 
    //                 this.body._id = res.id;
    //                 this.body._rev = res.rev;
    //                 return this;
    //             });
    // }
}

class Payment extends modalDoc{

    constructor(){
        super();
        // this.body = {};
        // this.body._id = '';
        // this.body._rev = '';
        // this.body.party = '';
        // this.body.mode = '';
        // this.body.amount = '';
        // this.body.notes = '';
    }

    get tableFields(){
        return ['party', 'mode', 'amount', 'created_at'];
    }

    get fields(){
        return [
            [['party', 'notes', 'mode'], 'string'],
            [['amount'], 'number']
        ];
    }

    // save(paymentDoc){
    //     Object.assign(this.body, paymentDoc);
    //     return super.save(this.body).then((res) => {
    //                 this.body._id = res._id;
    //                 this.body._rev = res.rev; 
    //                 return this;   
    //             });
    // }
}

class Stock extends modalDoc{

    constructor(){
        super();
        // this.body = {};
        // this.body._id = '';
        // this.body._rev = '';
        // this.body.name = '';
        // this.body.quantity = '';
        // this.body.price = '';
        // this.body.discount = '';
        // this.body.tax = '';
    }

    get tableFields(){
        return ['name', 'quantity', 'price', 'discount', 'tax'];
    }

    get fields(){
        return [
            [['name', 'discount', 'price'], 'string'],
            [['quantity'], 'number'],
            [['discount', 'tax'], 'number']
        ];
    }

    // save(stockDoc){
    //     // console.log(stockDoc);
    //     Object.assign(this.body, stockDoc);
    //     return super.save(this.body).then((res) => {
    //                 this.body._id = res.id;
    //                 this.body._rev = res.rev;
    //                 return this;
    //             });
    // }
}

const classMapping = { Party, Payment, Stock };

// /data modals