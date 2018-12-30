
// data modals

class Common{
    constructor(){}

    getKeyById(docArray, modal, key){
        let p = [];

        let field = modal.constructor.name.toLowerCase();
        docArray.forEach(docObj => {
            let keyDocId = docObj.doc[field]; 
            p.push(
                new Promise((reso, rej) => {
                    return modal.getKeyById(key, keyDocId)
                            .then(value => {
                                docObj.doc[field] = value;
                            })
                            .then(_ => reso());
            }));
        });

        return Promise.all(p)
              .then(_ => docArray);              
    }
}

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
/**
 * Common class for all document database operations.
 */
class docDB {

    constructor(){
        this.docBody = {};
        this.docBody._id = '';
        this.docBody.type = this.constructor.name.toLowerCase();
    }

    /**
     * return all document objects as array
     * @return {object[]} document[]
     */

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

    /**
     * returns only specified 'key in document (key) ' and 'document id(id)'
     * @param {string} key - Key to fetch from document. 
     * @return {object} id,key
     */

    allKeyAndId(key){
        return new Promise((resolve, reject) => {
            this.allDocs()
            .then(docs => {
                let fieldArray = [];               
                docs.forEach(docObj => {
                    let keyIdobj = {};
                    keyIdobj.id = docObj.doc['_id'];
                    keyIdobj[key] = docObj.doc[key];
                    fieldArray.push(keyIdobj);
                });
                resolve(fieldArray);
            });
        });
    }

    /**
     * return key value based on document id
     * @param {string} key - key to fetch
     * @param {string} id - document id
     * @return {*} value - key value in document
     */
    getKeyById(key, id){
        return new Promise((resolve, reject) => {
            this.get(id)
            .then(doc => resolve(doc[key]))
            .catch(err => reject(err));        
        });
    }

    /**
     * return 'document' find by using 'document id'.
     * @param {string} docId -document if to fetch
     * @return {object} doc - fetched document
     */
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

    /**
     * return validation result of document
     * @param {object} doc -document to validate
     */
    validate(doc){
        let v = new Validator();
        return  v.validate(doc, this.fields);
    }

    /**
     * returns promise of document save which should contain 
     * result if successfull and err if document in invalidated.
     * @param {object} docToSave - document to save.
     * @return {Promise} err and successfull - based on validation and saving doc.
     */
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

/**
 * Common class for all modals.
 * @augments docDB
 */
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

    // get(docId){
    //     return super.get(docId);
    // }

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

/**
 * Class for party modal.
 * @augments modalDoc
 */
class Party extends modalDoc{

    constructor(){
        super();
    }   

    get fields(){
        return [
                [['name', 'contact',  'address', 'city', 'district', 'state'], 'string', 'Should be characters'],
                [['pincode'], 'number', 'Should be a number'],
                [['email'], 'email', 'Should be a valid email'],
                [['phone', 'whatsapp'], 'phone', 'Should be a valid phone number']                
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
        return this.allKeyAndId('name');
        // return new Promise((resolve, reject) => {
        //         this.allDocs()
        //         .then(docs => {
        //             let fieldArray = [];               
        //             docs.forEach(docObj => {
        //                 let nameIdobj = {};
        //                 nameIdobj.id = docObj.doc._id;
        //                 nameIdobj.name = docObj.doc.name;
        //                 fieldArray.push(nameIdobj);
        //             });

        //             resolve(fieldArray);
        //         });
        //     }); 
    }

    getNameById(id){
        return this.getKeyById('name', id);
        // return new Promise((resolve, reject) => {
        //     this.get(id)
        //     .then(doc => resolve(doc.name))
        //     .catch(err => reject(err));        
        // });
    }
}

/**
 * Class for payment modal.
 * @augments modalDoc
 */
class Payment extends modalDoc{

    constructor(){
        super();
    }

    get mode(){
        let obj = globalConst.payment_mode;
        return Object.keys(obj).map(k => {
            return { id : obj[k].toLowerCase(), text: obj[k]};
        });
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
                return new Common().getKeyById(docArray, new Party(), 'name');
                // let p = [];

                // docArray.forEach(docObj => {
                //     let partyId = docObj.doc.party; 
                //     p.push(
                //         new Promise((reso, rej) => {
                //             return new Party().getNameById(partyId)
                //                     .then(partyName => {
                //                         docObj.doc.party = partyName;
                //                     })
                //                     .then(_ => reso());
                //     }));
                // });

                // return Promise.all(p)
                //       .then(_ => docArray);            
            })
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }
}

/**
 * Class for stock modal.
 * @augments modalDoc
 */

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
        return super.allKeyAndId('name');
        // return new Promise((resolve, reject) => {
        //     this.allDocs()
        //     .then(docs => {
        //         let fieldArray = [];               
        //         docs.forEach(docObj => {
        //             let nameIdobj = {};
        //             nameIdobj.id = docObj.doc._id;
        //             nameIdobj.name = docObj.doc.name;
        //             fieldArray.push(nameIdobj);
        //         });
        //         resolve(fieldArray);
        //     });
        // });
    }
}

/**
 * Class for order modal.
 * @augments modalDoc
 */
class Order extends modalDoc{
    constructor(){
        super();
    }

    get status() {
        let obj = globalConst.process_status;
        return Object.keys(obj).map(k => {
            return { id : k, text: obj[k]};
        });
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
                return new Common().getKeyById(docArray, new Party(), 'name');
                // let p = [];

                // docArray.forEach(docObj => {
                //     let partyId = docObj.doc.party; 
                //     p.push(
                //         new Promise((reso, rej) => {
                //             return new Party().getNameById(partyId)
                //                     .then(partyName => {
                //                         docObj.doc.party = partyName;
                //                     })
                //                     .then(_ => reso());
                //     }));
                // });

                // return Promise.all(p)
                //       .then(_ => docArray);           
            })
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }
}

/**
 * Class for purchase modal.
 * @augments modalDoc
 */
class Purchase extends modalDoc{
    constructor(){
        super();
    }

    get fields(){
        return [
            [['party', 'payment_mode', 'notes'], 'string'],
            [['amount', 'invoice'], 'number']
        ];
    }

    get tableFields(){
        return ['party', 'invoice', 'payment_mode', 'amount'];
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
                return new Common().getKeyById(docArray, new Party(), 'name');
                // let p = [];

                // docArray.forEach(docObj => {
                //     let partyId = docObj.doc.party; 
                //     p.push(
                //         new Promise((reso, rej) => {
                //             return new Party().getNameById(partyId)
                //                     .then(partyName => {
                //                         docObj.doc.party = partyName;
                //                     })
                //                     .then(_ => reso());
                //     }));
                // });

                // return Promise.all(p)
                //       .then(_ => docArray);              
            })
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    }
}

/**
 * Class for expense modal.
 * @augments modalDoc
 */
class Expense extends modalDoc{
    constructor(){
        super();
    }

    get fields(){
        return [
            [['name', 'notes'], 'string'],
            [['amount'], 'number']
        ];
    }

    get tableFields(){
        return ['name', 'amount'];
    }

    get formFields(){
        return [
            ['name', 'input'],
            ['amount', 'input'],
            ['notes', 'input']
        ];
    }

    get fieldAlias(){
        return {
            'name': 'Expense Name',
            'amount': 'Amount',
            'notes': 'Notes'
        }
    }
}

const classMapping = { Order, Party, Payment, Stock, Purchase, Expense };

// /data modals