
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
});
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

function editDocument(editDoc){    

    let docType = editDoc.type;
    let modalName = docType.charAt(0).toUpperCase()+ docType.slice(1);
    let modal = new classMapping[modalName];
    let prefix = modal.constructor.name.toLowerCase() + '[';
    
    modal.get(editDoc._id)
    .then((doc) => {
        console.log(doc);
        let iterableField = (modal.iterableFields[0].length) ? modal.iterableFields[1] : null;
        let iterableElementsCount;
        if(iterableField){
            // iterableElementsCount = 
            let el  = document.getElementsByClassName('btn-row_add');
            for(let i = 0; i < doc[iterableField].length-1; i++){
                el[0].dispatchEvent(new Event('click'));
            }
            
        }
        document.querySelectorAll(`[name^="${prefix}"]`).forEach((el) => {
            
            let field = (el.name).replace(`${prefix}`, '').replace(']','');
            // console.log(doc[field]);
            if(!modal.iterableFields[0].includes(field)){
                el.value = doc[field];
            } else {
                // console.log(doc[iterableField]);
                let iterableDoc = doc[iterableField].shift();
                el.value = iterableDoc[field];
                delete iterableDoc[field];
                if(Object.keys(iterableDoc).length){
                    doc[iterableField].unshift(iterableDoc);
                }                
                // console.log(field);
            }
            
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
    .then(res => {
        console.log(res);
        alertDocSave(modal);
    })
    .catch(err => {
        console.log(err)
        fetchDataFromHTML(modal, err);
    });
}
// /common functions