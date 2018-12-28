
// data modals

class Validator{

    is_float(){
        return (arguments[0].match(/\-?\d+\.\d+$/))? true: false;
    }

    is_number(){
        return (arguments[0].match(/^[0-9]+$/))? true: false;
    }
    
    is_string(){
        return (arguments[0].match(/^[0-9a-zA-Z-\s]+$/))? true: false;
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
        
        let validDoc = {};
        validDoc.isValid = true;
        fieldsArray.forEach(fields => {
            fields[0].forEach(field => {
                if(doc.hasOwnProperty(field)){

                    validDoc[field] = {};
                    validDoc[field].value = doc[field];
                    let valuetype = fields[1];
                    validDoc[field].isValid = this[`is_${valuetype}`](doc[field]);
                    
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
        this.fieldKeys.forEach(field => {
            this.body[field] = '';
        });
        // this.fields.forEach(function(fieldTypeArray){
            
        //     fieldTypeArray[0].forEach(function(field){
                
        //         this.body[field] = '';
        //     }.bind(this));
        // }.bind(this));
    }

    get fieldKeys(){
        let keys = [];

        // from child class
        this.fields.forEach(fieldArray => {
            fieldArray[0].forEach(field => {
                keys.push(field);
            });
        });
        return keys;
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
    }   

    get fields(){
        return [
                [['name', 'contact', 'phone', 'address', 'city', 'district', 'state'], 'string'],
                [['pincode'], 'number'],
                [['email'], 'email'],
                [['phone', 'whatsapp'], 'phone']                
            ];
    }

    get tableFields() {
        return ['name', 'city', 'phone', 'email'];
    }

    get formFields(){
        return [
            ['name', 'input'],
            ['contact', 'input'],
            ['phone', 'input'],
            ['whatsapp', 'input'],
            ['email', 'input'],
            ['address', 'input'],
            ['city', 'input'],
            ['district', 'input'],
            ['state', 'input'],
            ['pincode', 'input']
        ]
    }

    get fieldAlias(){
        return {
            'name' : 'Party Name',
            'contact': 'Contact Name',
            'phone': 'Phone',
            'whatsapp': 'Whatsapp',
            'email': 'Email',
            'address': 'Street Address',
            'city': 'City',
            'district': 'District',
            'state': 'State',
            'pincode': 'Pincode'
        }
    }    

    allNameAndId(){
        return new Promise((resolve, reject) => {
                this.allDocs()
                .then(docs => {
                    let fieldArray = [];               
                    docs.forEach(docObj => {
                        let nameIdobj = {};
                        nameIdobj.id = docObj.doc._id;
                        nameIdobj.name = docObj.doc.name;
                        fieldArray.push(nameIdobj);
                    });

                    resolve(fieldArray);
                });
            });    
    }

    getNameById(id){
        return new Promise((resolve, reject) => {
            this.get(id)
            .then(doc => resolve(doc.name))
            .catch(err => reject(err));        
        });
    }
}

class Payment extends modalDoc{

    constructor(){
        super();
    }

    get mode(){
        return [
            {
                id: 'cash',
                text: 'Cash'
            },
            {
                id: 'credit',
                text: 'Credit'
            },
            {
                id: 'upi',
                text: 'UPI'
            },
            {
                id: 'paytm',
                text: 'PayTm'
            },
            {
                id: 'cheque',
                text: 'Cheque'
            },
            {
                id: 'online',
                text: 'Online Transfer'
            },
        ];
    }

    get fields(){
        return [
            [['party', 'notes', 'mode'], 'string'],
            [['amount'], 'number']
        ];
    }

    get tableFields(){
        return ['party', 'mode', 'amount'];
    }

    get formFields(){
        return [
            ['party', 'select'],
            ['mode', 'select'],
            ['amount', 'input'],
            ['notes', 'input']
        ];
    }

    get fieldAlias(){
        return {
            'party': 'Party Name',
            'mode': 'Payment Mode',
            'amount': 'Amount',
            'notes': 'Notes'
        }
    }

    allDocs(){
        return new Promise((resolve, reject) => {
            super.allDocs()
            .then(docArray => {
                let p = [];

                docArray.forEach(docObj => {
                    let partyId = docObj.doc.party; 
                    p.push(
                        new Promise((reso, rej) => {
                            return new Party().getNameById(partyId)
                                    .then(partyName => {
                                        docObj.doc.party = partyName;
                                    })
                                    .then(_ => reso());
                    }));
                });

                return Promise.all(p)
                      .then(_ => docArray);              
            })
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }
}

class Stock extends modalDoc{

    constructor(){
        super();
    }

    get fields(){
        return [
            [['name', 'price'], 'string'],
            [['quantity', 'discount'], 'number'],
            [['tax'], 'number']
        ];
    }

    get tableFields(){
        return ['name', 'quantity', 'price', 'discount', 'tax'];
    }    
    
    get formFields(){
        return [
            ['name', 'input'],
            ['quantity', 'input'],
            ['price', 'input'],
            ['discount', 'input'],
            ['tax', 'input']
        ]
    }

    get fieldAlias(){
        return {
            'name': 'Item Name',
            'quantity': 'Quantity',
            'price': "Price",
            'discount': 'Discount',
            'tax': 'Tax'
        }
    }

    allNameAndId(){
        return new Promise((resolve, reject) => {
            this.allDocs()
            .then(docs => {
                let fieldArray = [];               
                docs.forEach(docObj => {
                    let nameIdobj = {};
                    nameIdobj.id = docObj.doc._id;
                    nameIdobj.name = docObj.doc.name;
                    fieldArray.push(nameIdobj);
                });
                resolve(fieldArray);
            });
        });
    }
}


class Order extends modalDoc{
    constructor(){
        super();
    }

    get status() {
        return [
            { id: 'completed'  , text: 'Completed'  },
            { id: 'pending'    , text: 'Pending'    },
            { id: 'processing' , text: 'Processing' },
            { id: 'cancelled'  , text: 'Cancelled'  },
            { id: 'halt'       , text: 'Halt'       }
        ];
    }

    get fields(){
        return[
            [['party', 'item', 'invoice', 'status', 'payment_mode', 'due_date', 'notes'],'string'],
            [['amount', 'quantity'], 'number'],
        ];
    }

    get tableFields(){
        return ['party', 'invoice', 'amount', 'status', 'payment_mode', 'due_date']
    }

    get formFields(){
        return [
            ['invoice', 'input'],
            ['party', 'select'],
            ['item', 'select'],
            ['quantity', 'input'],
            ['amount', 'input'],            
            ['payment_mode', 'select'],
            ['status', 'select'],
            ['due_date', 'input'],
            ['notes', 'input']
        ];
    }

    get fieldAlias(){
        return {
            'invoice' : 'Invoice No.',
            'party' : 'Party Name',
            'item': 'Item Name',
            'quantity': 'Quantity',            
            'amount': 'Amount',
            'net_amount': 'Net Amount',
            'payment_mode': 'Payment Mode',
            'status' : 'Status',
            'due_date': 'Due date',
            'notes': 'Notes'
        }
    }

    allDocs(){
        return new Promise((resolve, reject) => {
            super.allDocs()
            .then(docArray => {
                let p = [];

                docArray.forEach(docObj => {
                    let partyId = docObj.doc.party; 
                    p.push(
                        new Promise((reso, rej) => {
                            return new Party().getNameById(partyId)
                                    .then(partyName => {
                                        docObj.doc.party = partyName;
                                    })
                                    .then(_ => reso());
                    }));
                });

                return Promise.all(p)
                      .then(_ => docArray);              
            })
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }
}

class Purchase extends modalDoc{
    constructor(){
        super();
    }

    get fields(){
        return [
            [['party', 'invoice', 'payment_mode', 'notes'], 'string'],
            [['amount'], 'number']
        ];
    }

    get tableFields(){
        return ['party', 'invoice', 'payment_mode', 'amount', 'notes'];
    }

    get formFields(){
        return [
            ['party', 'select'],
            ['invoice', 'input'],
            ['payment_mode', 'select'],
            ['amount', 'input'],
            ['notes', 'input']
        ];
    }

    get fieldAlias(){
        return {
            'party': 'Party Name',
            'invoice': 'Invoice No.',
            'payment_mode': 'Payment Mode',
            'amount': 'Amount',
            'notes' : 'Notes'
        }
    }

    allDocs(){
        return new Promise((resolve, reject) => {
            super.allDocs()
            .then(docArray => {
                let p = [];

                docArray.forEach(docObj => {
                    let partyId = docObj.doc.party; 
                    p.push(
                        new Promise((reso, rej) => {
                            return new Party().getNameById(partyId)
                                    .then(partyName => {
                                        docObj.doc.party = partyName;
                                    })
                                    .then(_ => reso());
                    }));
                });

                return Promise.all(p)
                      .then(_ => docArray);              
            })
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }
}

const classMapping = { Order, Party, Payment, Stock, Purchase };

// /data modals