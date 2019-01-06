
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
        
        $('[name="order[party]"]').select2({
            placeholder: 'Select Party',
            data: data,
            allowClear: true
        });

        $('[name="order[payment_mode]"]').select2({
            placeholder: 'Select mode of Payment',
            data: new Payment().mode,
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
        customAddRowEventListener(itemGroupDiv.firstChild);
    })
    .catch(err => console.log(err));

    $('[name="order[status]"]').select2({
        placeholder: 'Select Status',
        data: new Order().status,
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

        customAddRowEventListener(row);        

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

    function customAddRowEventListener(row){

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

            row.querySelector('[name="order[item-amount]"]').value = parseFloat(itemRate * itemQuantity).toFixed(3);
            
            updateNetAmount();
        }
    }

    function updateNetAmount(){
        let itemAmmountArray = document.getElementsByName('order[item-amount]');
        let netAmount = 0;
        itemAmmountArray.forEach(element => {
            let value = 0;
            if(element){
                value = parseFloat(element.value);
            }
            netAmount += value;
        });
        document.querySelector('[name="order[amount]"').value = netAmount.toFixed(3);
    }
    // /order module
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
         
         $('[name="payment[party]"]').select2({
             // theme:'bootstrap',
             placeholder: 'Select Party',
             data: data,
             // tags: true,
             allowClear: true
         });
 
         $('[name="payment[payment_mode]"]').select2({
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
        
        $('[name="purchase[party]"]').select2({
            placeholder: 'Select Party',
            data: data,
            // tags: true,
            allowClear: true
        });

        $('[name="purchase[payment_mode]"]').select2({
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
    document.querySelectorAll(`[name^=${prefix}]`).forEach((el) => {
        // let field = element.id.replace(`${prefix}`, '');
        // let el = document.getElementById(element.id);
        setTimeout(() => {el.value = ''}, 30);
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

function fetchDataFromHTML(modal, err = false, reset = false){
    var doc = {};
    var prefix = modal.constructor.name.toLowerCase() + '[';
    // console.log(prefix);
    // console.log(err)
    document.querySelectorAll(`[name^="${prefix}"]`).forEach((el) => {
        
        let field = (el.name).replace(prefix, '').replace(']','');
        
        // if(!err)console.log(field);
        if(modal.iterableFields[0].includes(field)){
            if(!doc[modal.iterableFields[1]]) doc[modal.iterableFields[1]] = [];
            let tempObj = doc[modal.iterableFields[1]].pop() || {};            
            
            if(tempObj[field] == null){
                tempObj[field] = el.value;
                doc[modal.iterableFields[1]].push(tempObj);
            } else {
                doc[modal.iterableFields[1]].push(tempObj);                
                doc[modal.iterableFields[1]].push({ [field]: el.value});
            }
            if(err) {
                let iterableFieldTag = modal.iterableFields[1];
                let iterableObj = err[iterableFieldTag].value.shift() || {};
                // console.log(field);
                // console.log(iterableObj);
                if(!iterableObj[field].isValid) {
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
                delete iterableObj[field];
                if (Object.keys(iterableObj).length){
                    err[iterableFieldTag].value.unshift(iterableObj);
                }
            }
        } else {
            doc[field] = el.value;
        }        
        // console.log(field)
        // console.log(err[field]);
        if(err){ 
            // console.log(err);
            // console.log(field);
            if(modal.iterableFields[0].includes(field)) return;
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
            if(el.nodeName == 'SELECT'){
                el.parentElement.querySelector('.select2-selection').classList.remove('is-invalid');
                el.parentElement.querySelector('.select2-selection').classList.remove('is-valid');
            }
        }
    });
    // console.log(doc);
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