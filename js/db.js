
var uuid = 'uuid';
var db = new PouchDB(uuid);
var remoteCouch = `http://ltm:qwerty@localhost:5984/${uuid}`;
// var account = 'a9b5854b-543d-4dba-b22d-bd4a899d2dd3-bluemix';
// var remoteCouch = `https://oughtchaveringstensiling:8eceff51782b5087bcb3d318fd9e1fed4b0fedf6@${account}.cloudant.com/ltm-app`;
var itemData = [];
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

var targetNode = document.getElementById('app');
    var config = { childList: true };
    
var callback = function(mutationList, observer){
    for(var mutation of mutationList){
        if(mutation.type == 'childList') {
            observer.disconnect();
            return appReload()
        };
    }
};

var observer = new MutationObserver(callback);

window.addEventListener('load', () =>  {

    db.replicate.to(remoteCouch)
        // .on('complete', (result) => console.log(result));
    db.replicate.from(remoteCouch)
        // .on('complete', (result) => console.log(result));
    appReload(false);
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
    $.fn.select2.defaults.set( "theme", "bootstrap" );

    if(window.location.pathname.includes('add') || window.location.pathname.includes('edit')){
        let addFormName = window.location.pathname.split('/').slice(1,2).toString();   
    
        this[`${addFormName}AddForm`]();
    }
    
    // edit doc module
    if(Object.keys(docToEdit).length){
        editDocument(docToEdit);
    }
    // /edit doc module
    setTimeout(() => {
        observer.observe(targetNode, config);
    }, 300); 
}

function orderAddForm(){
    // order module
    $(new Form(new Order()).view()).insertBefore('#btn-order_add');
    
    new Party().allNameAndId()
    .then(partyNamesAndId => {
        let data = [];
        partyNamesAndId.forEach(partyNameIdObj => {

            let dataObj = {};
            dataObj.id = partyNameIdObj.id;
            dataObj.text = partyNameIdObj.name;
            data.push(dataObj);
        });
        
        $('#order-party').select2({
            // theme:'bootstrap',
            placeholder: 'Select Party',
            data: data,
            // tags: true,
            allowClear: true
        });

        $('#order-payment_mode').select2({
            // theme:'bootstrap',
            placeholder: 'Select mode of Payment',
            data: new Payment().mode,
            // tags: true,
            allowClear: true
        });
    })
    .catch(err => console.log(err));

    // let itemData = []
    new Stock().allDocs()
    .then(stockDocs => {
        let data = [];
        stockDocs.forEach(stockDoc => {

            stockDoc.doc.id = stockDoc.doc._id;
            stockDoc.doc.text = stockDoc.doc.name;
            data.push(stockDoc.doc);
        });

        itemData = data;
        // console.log(itemData);
        // $('#order-item').select2({
        //     placeholder: 'Select item',
        //     data: itemData,
        //     allowClear: true
        // });

        let itemGroupDiv = document.getElementById('item-group');
        // let rateDiv = document.querySelector('[name="order[amount]"').parentNode.cloneNode(true);
        // let rateLabel = rateDiv.querySelector('label');
        // rateLabel.setAttribute('for','item-rate');
        // rateLabel.innerHTML = 'Item Rate';
        
        // let rateInput = rateDiv.querySelector('input');
        // rateInput.setAttribute('placeholder', 'Enter Rate');
        // rateInput.setAttribute('name','order[rate]');
        // // console.log(rateDiv);
        // // console.log(itemGroupDiv.firstChild.firstChild);
        // let itemAmountDiv = document.querySelector('[name="order[amount]"').parentNode.cloneNode(true);
        // let itemAmountLabel = itemAmountDiv.querySelector('label');
        // itemAmountLabel .setAttribute('for','item-amount');
        // itemAmountLabel.innerHTML = 'Item Amount';
        
        // let itemAmountInput = itemAmountDiv.querySelector('input');
        // itemAmountInput.setAttribute('placeholder', 'Enter Amount');
        // itemAmountInput.setAttribute('name','order[item-amount]');

        // itemGroupDiv.firstChild.insertBefore(rateDiv, itemGroupDiv.firstChild.firstChild.nextSibling);
        // let itemAmountSelector = itemGroupDiv.firstChild.querySelector('[name="order[quantity]"').parentNode.parentNode;
        
        // itemAmountSelector.parentNode.insertBefore(itemAmountDiv, itemAmountSelector.nextSibling);
        customAddEventListener(itemGroupDiv.firstChild);

        // if(document.getElementById('order-item')){
        //     setTimeout(() => {
        //         orderItemObserver.observe(orderItemTarget, config);
        //     }, 2000);
        // }
    })
    .catch(err => console.log(err));    

    // var orderItemTarget = document.getElementById('item-group');    
            
    // var orderItemCB = function(mutationList, observer){
    //     for(var mutation of mutationList){
    //         if(mutation.type == 'childList') {
    //             let elArray = document.getElementsByClassName('btn-row_add');
    //             console.log(elArray);
    //             elArray.forEach(element => {
    //                 console.log(element);
    //                 element.addEventListener('click', btnRowAddEventListener);
    //             });
    //         };
    //     }
    // };

    // var orderItemObserver = new MutationObserver(orderItemCB);

    $('#order-status').select2({
        placeholder: 'Select Status',
        data: new Order().status,
        // tags: true,
        allowClear: true
    });

    $('#btn-order_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Order');
    });

    function addItemRow(e){
        
        let el = e.target.parentNode;
        while(el.parentNode){
            if(el.className == 'row'){                
                break;
            }
            el = el.parentNode;
        }
        // let btnRowDelete
        // el.getElementsByClassName('btn-row_delete')[0].classList.remove('invisible');
        let row = el.cloneNode(true);        

        customAddEventListener(row);        

        let btnRowDelete = row.getElementsByClassName('btn-row_delete')[0];
        btnRowDelete.classList.remove('invisible');
        btnRowDelete.addEventListener('click', (e) => {
            let el = e.target.parentNode;
            while(el.parentNode){
                if(el.className == 'row'){                
                    break;
                }
                el = el.parentNode;
            };
            el.parentNode.removeChild(el);
            updateNetAmount();
        });

        el.parentNode.insertBefore(row, el.nextSibling);
    }

    function customAddEventListener(row){

        Array.from(row.getElementsByTagName('input')).forEach(element => {
            element.value = '';
        });
        
        Array.from(row.getElementsByTagName('select')).forEach(element => {
            element.classList.remove('select2-hidden-accessible');
            let select2Container = element.parentNode.getElementsByClassName('select2-container')[0];
            
            if(select2Container) select2Container.parentNode.removeChild(select2Container);
            $(element).select2({
                placeholder: 'Select item',
                data: itemData,
                allowClear: true
            });
            $(element).on('select2:select', e => {
                let el = element.parentNode;
                // console.log(el);
                while(el.parentNode){
                    if(el.className == 'row'){                
                        break;
                    }
                    el = el.parentNode;
                };                
                
                let rate = e.params.data.price;
                let defaultQuantity = 1;
                el.querySelector('[name="order[item-rate]"]').value = rate;                
                el.querySelector('[name="order[item-quantity]"').value = defaultQuantity;
                el.querySelector('[name="order[item-rate]"]').dispatchEvent(new Event('change'));
            });
            $(element).on('select2:unselect', e => {
                let el = element.parentNode;
                // console.log(el);
                while(el.parentNode){
                    if(el.className == 'row'){                
                        break;
                    }
                    el = el.parentNode;
                };                
                
                el.querySelector('[name="order[item-rate]"]').value = '';
                el.querySelector('[name="order[item-quantity]"').value = '';
                el.querySelector('[name="order[item-rate]"]').dispatchEvent(new Event('change'));
            });
        });

        row.querySelector('[name="order[item-rate]"]').addEventListener('change', updateItemAmount);
        row.querySelector('[name="order[item-quantity]"]').addEventListener('change', updateItemAmount);
        row.querySelector('[name="order[item-amount]"]').addEventListener('change', updateNetAmount);
        row.getElementsByClassName('btn-row_add')[0].addEventListener('click', addItemRow);

        function updateItemAmount(e){
            let itemRate = row.querySelector('[name="order[item-rate]"]').value;
            let itemQuantity = row.querySelector('[name="order[item-quantity]"]').value;

            row.querySelector('[name="order[item-amount]"]').value = itemRate * itemQuantity;
            
            updateNetAmount();
        }
    }

    function updateNetAmount(){
        let itemAmmountArray = document.getElementsByName('order[item-amount]');
        let netAmount = 0;
        itemAmmountArray.forEach(element => netAmount += parseFloat(element.value));
        document.querySelector('[name="order[amount]"').value = netAmount.toFixed(3);
    }
}

function paymentAddForm(){
     // payment module
     $(new Form(new Payment()).view()).insertBefore('#btn-payment_add');
     new Party().allNameAndId()
     .then(partyNamesAndId => {
         let data = [];
         partyNamesAndId.forEach(partyNameIdObj => {
 
             let dataObj = {};
             dataObj.id = partyNameIdObj.id;
             dataObj.text = partyNameIdObj.name;
             data.push(dataObj);
         });
         
         $('#payment-party').select2({
             // theme:'bootstrap',
             placeholder: 'Select Party',
             data: data,
             // tags: true,
             allowClear: true
         });
 
         $('#payment-payment_mode').select2({
             // theme:'bootstrap',
             placeholder: 'Select mode of Payment',
             data: new Payment().mode,
             // tags: true,
             allowClear: true
         });
     })
     .catch(err => console.log(err));
     
     $('#btn-payment_add').on('click', (e) => {
         e.preventDefault();
         saveDoc('Payment');
     });
     // /payment module
}

function purchaseAddForm(){
    // purchase module
    $(new Form(new Purchase()).view()).insertBefore('#btn-purchase_add');
    new Party().allNameAndId()
    .then(partyNamesAndId => {
        let data = [];
        partyNamesAndId.forEach(partyNameIdObj => {

            let dataObj = {};
            dataObj.id = partyNameIdObj.id;
            dataObj.text = partyNameIdObj.name;
            data.push(dataObj);
        });
        
        $('#purchase-party').select2({
            placeholder: 'Select Party',
            data: data,
            // tags: true,
            allowClear: true
        });

        $('#purchase-payment_mode').select2({
            placeholder: 'Select mode of Payment',
            data: new Payment().mode,
            // tags: true,
            allowClear: true
        });
    })
    .catch(err => console.log(err));
    
    $('#btn-purchase_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Purchase');
    });
    // /purchase module
}

function partyAddForm(){;
    // party module
    $(new Form(new Party()).view()).insertBefore('#btn-party_add');
    $('#btn-party_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Party');
    });
    // / party module
}

function expenseAddForm(){
    // expense module
    $(new Form(new Expense()).view()).insertBefore('#btn-expense_add');
    $('#btn-expense_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Expense');
    });
    // / expense module
}

function stockAddForm(){
    // stock module
    $(new Form(new Stock()).view()).insertBefore('#btn-stock_add');
    $('#btn-stock_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Stock');
    });
    // /stock module
}

// common functions 
function alertDocSave(modal){    
    var prefix = modal.constructor.name.toLowerCase();
    // document.getElementById(`form-${prefix}`).reset();
    document.querySelectorAll(`[id^=${prefix}]`).forEach((element) => {
        // let field = element.id.replace(`${prefix}`, '');
        let el = document.getElementById(element.id);
        el.value = '';
        setTimeout(() => {
            el.dispatchEvent(new Event('change'));
        }, 30); 
    });   
    fetchDataFromHTML(modal, false, true);
    var alertbox = document.getElementById(`alert-${prefix}_save`);
    alertbox.classList.remove('invisible');
    setTimeout(() => {
        alertbox.classList.add('invisible');
        // window.location.reload();
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
            // console.log(key);
            // // console.log(globalConst.process_status[key]);
            switch(key){
                case 'status': td.innerHTML = globalConst.process_status[rowDataObj[key]];
                                break;
                default: td.innerHTML = rowDataObj[key];
            }
            // td.innerHTML = (key == 'created_at')? (new Date(rowDataObj[key])).toLocaleDateString() : rowDataObj[key];
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
        // console.log(doc);
        document.querySelectorAll(`[id^=${prefix}]`).forEach((element) => {
            let field = element.id.replace(`${prefix}`, '');
            let el = document.getElementById(element.id);
            el.value = doc[field];
            setTimeout(() => {
                el.dispatchEvent(new Event('change'));
            }, 30); 
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
    .catch(err => {
        // console.log(err);
        fetchDataFromHTML(modal, err);
    });
}

function saveDoc(modalName){
    let modal = new classMapping[modalName];
    modal.save(fetchDataFromHTML(modal))
    .then((res) => alertDocSave(modal))
    .catch(err => {
        console.log(err)
        fetchDataFromHTML(modal, err);
    });
}

function fetchDataFromHTML(modal, err = false, reset = false){
    var doc = {};
    var prefix = modal.constructor.name.toLowerCase() + '-';

    document.querySelectorAll(`[id^=${prefix}]`).forEach((element) => {
        
        let field = (element.id).replace(prefix, '');
        let el = document.getElementById(element.id);
        doc[field] = el.value;
        // console.log(field)
        // console.log(err[field]);
        if(err){ 
            console.log(err);
            if(!err[field].isValid){
                el.classList.remove('is-valid');
                el.classList.add('is-invalid');
                if(el.nodeName == 'SELECT'){
                    el.parentElement.querySelector('.select2-selection').classList.remove('is-valid');
                    el.parentElement.querySelector('.select2-selection').classList.add('is-invalid');
                }
            } else {
                el.classList.remove('is-invalid');
                el.classList.add('is-valid');
                if(el.nodeName == 'SELECT'){
                    el.parentElement.querySelector('.select2-selection').classList.remove('is-invalid');
                    el.parentElement.querySelector('.select2-selection').classList.add('is-valid');
                }
            }
        }
        
        if(reset){
            el.classList.remove('is-invalid');
            el.classList.remove('is-valid');
        }
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