
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
        if(this.is_number(arguments[0])) return true;
        return (arguments[0].match(/\-?\d+\.\d+$/))? true: false;
    }

    is_number(){
        // if(arguments[0] == 0) return false;
        return (arguments[0].match(/^[0-9]+$/))? true: false;
    }
    
    is_string(){
        return (arguments[0].match(/^[0-9a-zA-Z.-\s]+$/))? true: false;
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

    is_iterable(){
        return true;
    }

    validate(doc, fieldsArray, iterableFields){
        
        let validDoc = {};
        validDoc.isValid = true;
        fieldsArray.forEach(fields => {
            fields[0].forEach(field => {
                if(doc.hasOwnProperty(field)){

                    validDoc[field] = {};
                    validDoc[field].value = doc[field];
                    
                    let valuetype = fields[1];
                    validDoc[field].isValid = this[`is_${valuetype}`](doc[field]);

                    if(valuetype == 'iterable'){
                        // console.log(validDoc[field].value);
                        validDoc[field].value = [];
                        doc[field].forEach(subField => {
                            let tempObj = {};
                            Object.keys(subField).forEach(key => {
                                // console.log(subField[key]);
                                let vType = '';
                                fieldsArray.forEach(fields => {
                                    fields[0].forEach(field => {
                                        if(field == key){
                                            vType = fields[1];
                                        }
                                    });
                                });
                                tempObj[key] = {}
                                tempObj[key].value = subField[key];
                                tempObj[key].isValid = this[`is_${vType}`](subField[key]);
                                if(!tempObj[key].isValid){
                                    validDoc.isValid = false;
                                    validDoc[field].isValid = false;
                                }
                            });
                            validDoc[field].value.push(tempObj);
                        });                        
                    }                    
                    
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
        this.docType = this.constructor.name.toLowerCase();
    }

    /**
     * return all document objects as array
     * @return {object[]} document[]
     */

    allDocs(){        
        // return new Promise((resolve, reject) => {
        return db.find({
                    selector:{ type: this.docType},
                    sort: [{'_id': 'desc'}]
                }).then((result) => {
                    let docs = [];
                    result.docs.forEach(doc => docs.push({doc}));
                    // console.log(docs);
                    return docs;
                    // resolve(docs);
                });
            // .catch(err => reject(err));
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
                    type: this.docType
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
        return  v.validate(doc, this.fields, this.iterableFields);
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
        this.docBody.type = this.docType;
        
        // let db = new PouchDB(uuid);
        // console.log(this.docBody);
        return new Promise((resolve, reject) => {
            let verfiedDoc = this.validate(this.docBody);
            if(!verfiedDoc.isValid){
                return reject(verfiedDoc);
            }

            db.put(this.docBody, (err, result) => {                
                if(err) return reject(err);
                
                //deleting docBody makes it only in parent class.
                // also improves performance in large object.
                Object.keys(this.docBody).forEach(key => {
                    this.docBody[key] = '';
                });
                return resolve(result);
            });
        });
    }

    // create_UUID(){
    //     var dt = new Date().getTime();
    //     var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //         var r = (dt + Math.random()*16)%16 | 0;
    //         dt = Math.floor(dt/16);
    //         return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    //     });
    //     return uuid;
    // }
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
                    if(!this.iterableFields[0].includes(field)){                        
                        return keys.push(field);
                    }
                    // console.log(field);
            });
        });
        // console.log(keys);
        return keys;
    }

    get iterableFields(){ return [[],'']; }
    // get(docId){
    //     return super.get(docId);
    // }

    save(docToSave){
        Object.assign(this.body, docToSave);

        return super.save(this.body)
                .then((res) => {
                    // this.body._id = res.id;
                    // this.body._rev = res.rev;

                    // console.log(this.body);
                    // delete this.body;
                    Object.keys(this.body).forEach(key => {
                        this.body[key] = '';
                    });
                    return super.get(res.id);
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
        return ['name', 'city', 'due', 'phone', 'email'];
    }

    get formFields(){
        return [
            ['name', 'input'],
            ['contact', 'input'],
            ['phone', 'input', 'tel'],
            ['whatsapp', 'input', 'tel'],
            ['email', 'input'],
            ['address', 'input'],
            ['city', 'input'],
            ['district', 'input'],
            ['state', 'input'],
            ['pincode', 'input', 'number']
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
            'pincode': 'Pincode',
            'due': 'Due'
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
            [['party', 'notes', 'payment_mode'], 'string'],
            [['amount'], 'float']
        ];
    }

    get tableFields(){
        return ['party', 'payment_mode', 'amount'];
    }

    get formFields(){
        return [
            ['party', 'select'],
            ['payment_mode', 'select'],
            ['amount', 'input', 'number', '0.002'],
            ['notes', 'textarea']
        ];
    }

    get fieldAlias(){
        return {
            'party': 'Party Name',
            'payment_mode': 'Payment Type',
            'amount': 'Amount',
            'notes': 'Notes'
        }
    }

    // allDocs(){
    //     return new Promise((resolve, reject) => {
    //         super.allDocs()
    //         .then(docArray => {
    //             return new Common().getKeyById(docArray, new Party(), 'name');
    //             // let p = [];

    //             // docArray.forEach(docObj => {
    //             //     let partyId = docObj.doc.party; 
    //             //     p.push(
    //             //         new Promise((reso, rej) => {
    //             //             return new Party().getNameById(partyId)
    //             //                     .then(partyName => {
    //             //                         docObj.doc.party = partyName;
    //             //                     })
    //             //                     .then(_ => reso());
    //             //     }));
    //             // });

    //             // return Promise.all(p)
    //             //       .then(_ => docArray);            
    //         })
    //         .then(res => resolve(res))
    //         .catch(err => reject(err));
    //     });
    // }
    
    save(docToSave){
        
        
        return super.save(docToSave)
                .then(res => {
                    let credit = 0;
                    let debit = 0;
                    let due = 0;
                    return this.allDocs()
                            .then(resAll => {
                                resAll.forEach(payment =>{
                                    if(payment.doc.party == res.party){
                                        console.log(payment.doc.amount);
                                        if(payment.doc.payment_mode == 'credit'){
                                            credit += parseFloat(payment.doc.amount);
                                        } else {
                                            debit += parseFloat(payment.doc.amount);
                                        }
                                    }
                                });
                            
                                due = debit - credit;

                                // return res;
                                return new Party().get(res.party)
                                .then(resp => {
                                    resp.due = due.toFixed(3);
                                    return new Party().save(resp)
                                            .then(respn => {
                                                // return original payment doc 
                                                // when payment successfully saved
                                                // and party due is updated.
                                                return res;
                                            });
                                });
                            });
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
            [['name',  'notes'], 'string'],
            [['quantity', 'price', 'discount', 'tax',], 'float']
        ];
    }

    get tableFields(){
        return ['name', 'quantity', 'price', 'discount', 'tax'];
    }    
    
    get formFields(){
        return [
            ['name', 'input'],
            ['quantity', 'input', 'number', '0.002'],
            ['price', 'input', 'number', '0.002'],
            ['discount', 'input', 'number','0.002'],
            ['tax', 'input', 'number', '0.002'],
            ['notes', 'textarea']
        ]
    }

    get fieldAlias(){
        return {
            'name': 'Item Name',
            'quantity': 'Quantity',
            'price': "Price",
            'discount': 'Discount',
            'tax': 'Tax',
            'notes': 'Notes'
        }
    }

    // get(docId){
    //     return super.get(docId)
    //             // .then(res => {
    //             //     res.quantity = parseFloat(res.quantity);
    //             //     res.price = parseFloat(res.price);
    //             //     res.discount = parseFloat(res.discount);
    //             //     res.tax = parseFloat(res.tax);
    //             //     return res;
    //             // });
    // }

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
            [['party', 'invoice', 'status', 'payment_mode', 'due_date', 'notes'],'string'],
            [['item'], 'number'],
            [['amount', 'item-rate', 'item-quantity', 'item-amount'], 'float'],
            [['item-details'], 'iterable']
        ];
    }

    get iterableFields(){
        return [['item', 'item-rate', 'item-quantity', 'item-amount'], 'item-details'];
    }
     
    get formFields(){
        return [
            ['invoice', 'input'],
            ['party', 'select'],
            [
                ['item', 'select'],
                ['item-rate', 'input', 'number', '0.002'],    
                ['item-quantity', 'input', 'number', '0.002'],
                ['item-amount', 'input', 'number', '0.002'],
            ],
            ['amount', 'input', 'number', '0.002'],
            ['payment_mode', 'select'],
            ['status', 'select'],
            ['due_date', 'input'],
            ['notes', 'textarea']
        ];
    }

    get tableFields(){
        return ['party', 'invoice', 'amount', 'status', 'payment_mode', 'due_date']
    }    

    get fieldAlias(){
        return {
            'invoice' : 'Invoice No.',
            'party' : 'Party Name',
            'item': 'Item Name',
            'item-rate': 'Rate',
            'item-quantity': 'Quantity',
            'item-amount': 'Item Amount',
            'amount': 'Net Payable Amount',
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
                // .then(res => console.log(res))
                // .catch(err => err);
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }
    
    save(docToSave){

        if(docToSave._rev == null){
            // here when doc is new
            let doc = {};
                    
            doc.amount = docToSave.amount;
            doc.party = docToSave.party;
            doc.notes = 'For Invoice No. ' + docToSave.invoice;
            
            docToSave.paymentIds = [];
            
            if(docToSave.payment_mode != 'credit'){
                doc.payment_mode = 'credit';
                
                return new Payment().save(doc)
                    .then(res => {
                        docToSave.paymentIds.push(res._id);
                        doc.payment_mode = docToSave.payment_mode;
                        return doc;                
                    })
                    .then(res => {
                        return new Payment().save(res);
                    })
                    .then(res => {
                        docToSave.paymentIds.push(res._id);
                        return super.save(docToSave);
                    })
                // .then(result => result);
            } else {
                doc.payment_mode = docToSave.payment_mode;
                return new Payment().save(doc)
                    .then(res => {
                        docToSave.paymentIds.push(res._id);
                        return super.save(docToSave);
                    })
            }
        } else {
            // here when document is updated.
            let modalPayment = new Payment();
            let preDoc = this.get(docToSave._id);
            let modalStock = new Stock();
            return modalPayment.get(docToSave.paymentIds[0])
                .then(res => {
                    res.amount = docToSave.amount;
                    res.payment_mode = 'credit';
                    return modalPayment.save(res);
                })
                .then(res => {
                    // docToSave.paymentIds[1] == null will be true when
                    // payment_mode is credit and payment_mode is changed from credit to else.
                    if(docToSave.paymentIds[1] == null) {
                        docToSave.paymentIds[1].splice(1,2);
                        if(docToSave.payment_mode != "credit"){
                            delete res._id;
                            delete res._rev;
                            res.payment_mode = docToSave.payment_mode;
                            return modalPayment.save(res)
                                    .then(res => {
                                        docToSave.paymentIds.push(res._id);
                                        return res;
                                    });
                        }

                        return res;
                        
                    }

                    return modalPayment.get(docToSave.paymentIds[1])
                            .then(res => {
                                res.amount = (docToSave.payment_mode == 'credit') ? "0" : docToSave.amount;
                                res.payment_mode = (docToSave.payment_mode == 'credit') ? res.payment_mode : docToSave.payment_mode;
                                return modalPayment.save(res);
                            });                    
                })
                .then(res => {
                    console.log(res);
                    let itemDetailsProp = docToSave['item-details'];
                    let p = []
                    itemDetailsProp.forEach(itemDetailObj => {
                        console.log(itemDetailObj.item);
                        p.push(modalStock.get(itemDetailObj.item)
                                .then(res => {
                                    console.log(res);
                                    // res.quantity = res.quantity - preDoc.quantity + parseFdocToSave.quantity;
                                    return modalStock.save(res);
                                })
                              );
                        // itemDetailsProp['quantity']
                    });
                    // modalStock.get(pre)
                    // delay ({},30);
                    return Promise.all(p).then(res => super.save(docToSave));
                });
        }
    }
    // save(docToSave){
    //     return super.save(docToSave).then(res => {
    //             let doc = {}
                
    //             doc.amount = res.amount;
    //             doc.party = res.party;
    //             doc.notes = 'For Invoice No. ' + res.invoice;
    //             if(res.payment_mode != 'credit'){
    //                 doc.payment_mode = 'credit';
    //                 return new Payment().save(doc).then(_ => {
    //                     doc.payment_mode = res.payment_mode;
    //                     new Payment().save(doc);                                
    //                 });
    //             } else {
    //                 doc.payment_mode = res.payment_mode;
    //                 new Payment().save(doc);
    //             }

    //             return res;
    //         });
    // }
    // save(docToSave){
    //     return super.save(docToSave)
    //             // .then(res => {
    //             //     console.log(res);                    
    //             //     return new Promise((resolve, reject) => {
    //             //         let p = {};
    //             //         p.party = res.party;
    //             //         p.payment_mode = res.payment_mode;
    //             //         p.amount = res.amount;
    //             //         new Payment().save(p)
    //             //         .then(doc => { 
    //             //             console.log(doc);
    //             //             resolve(this);
    //             //         })
    //             //         .catch(err => reject(err));
    //             //     });
    //             //     // return this;
    //             // });
    // }
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
            [['invoice'], 'number'],
            [['amount'], 'float']
        ];
    }

    get tableFields(){
        return ['party', 'invoice', 'payment_mode', 'amount'];
    }

    get formFields(){
        return [
            ['party', 'select'],
            ['invoice', 'input', 'number'],
            ['payment_mode', 'select'],
            ['amount', 'input', 'number', '0.002'],
            ['notes', 'textarea']
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
            ['amount', 'input', 'number', '0.002'],
            ['notes', 'textarea']
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