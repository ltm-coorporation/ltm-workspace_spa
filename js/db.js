
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
            tags: true,
            allowClear: true
        });

        $('#order-payment_mode').select2({
            // theme:'bootstrap',
            placeholder: 'Select mode of Payment',
            data: new Payment().mode,
            tags: true,
            allowClear: true
        });
    })
    .catch(err => console.log(err));

    new Stock().allNameAndId()
    .then(stockNamesAndId => {
        let data = [];
        stockNamesAndId.forEach(stockNameIdObj => {

            let dataObj = {};
            dataObj.id = stockNameIdObj.id;
            dataObj.text = stockNameIdObj.name;
            data.push(dataObj);
        });
        
        $('#order-item').select2({
            // theme:'bootstrap',
            placeholder: 'Select item',
            data: data,
            tags: true,
            allowClear: true
        });
    })
    .catch(err => console.log(err));

    $('#order-status').select2({
        placeholder: 'Select Status',
        data: new Order().status,
        tags: true,
        allowClear: true
    });

    $('#btn-order_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Order');
    });
    // / order module

    // stock module
    $(new Form(new Stock()).view()).insertBefore('#btn-stock_add');
    $('#btn-stock_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Stock');
    });
    // /stock module

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
            tags: true,
            allowClear: true
        });

        $('#payment-mode').select2({
            // theme:'bootstrap',
            placeholder: 'Select mode of Payment',
            data: new Payment().mode,
            tags: true,
            allowClear: true
        });
    })
    .catch(err => console.log(err));
    
    $('#btn-payment_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Payment');
    });
    // /payment module

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
            // theme:'bootstrap',
            placeholder: 'Select Party',
            data: data,
            tags: true,
            allowClear: true
        });

        $('#purchase-payment_mode').select2({
            // theme:'bootstrap',
            placeholder: 'Select mode of Payment',
            data: new Payment().mode,
            tags: true,
            allowClear: true
        });
    })
    .catch(err => console.log(err));
    
    $('#btn-purchase_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Purchase');
    });
    // /purchase module

    // party module
    $(new Form(new Party()).view()).insertBefore('#btn-party_add');
    $('#btn-party_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Party');
    });
    // / party module

    // expense module
    $(new Form(new Expense()).view()).insertBefore('#btn-expense_add');
    $('#btn-expense_add').on('click', (e) => {
        e.preventDefault();
        saveDoc('Expense');
    });
    // / expense module

    // edit doc module
    if(Object.keys(docToEdit).length){
        editDocument(docToEdit);
    }
    // /edit doc module
    setTimeout(() => {
        observer.observe(targetNode, config);
    }, 300); 
}

// common functions 
function alertDocSave(modal){    
    var prefix = modal.constructor.name.toLowerCase();
    document.getElementById(`form-${prefix}`).reset();    
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
            if(!err[field].isValid){
                el.classList.remove('is-valid');
                el.classList.add('is-invalid');
            } else {
                el.classList.remove('is-invalid');
                el.classList.add('is-valid');
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