

class viewElements{

    constructor(args){
        args.forEach(element => {
            this[element+'Tag'] = document.createElement(element);
            // this[element+'Tag'].classList.add('table');
        });
    }

    // setModal(modal){
    //     this.modal = modal;
    //     return this;
    // }
}

class HTMLTable extends viewElements{

    constructor(modal = {}){
        let tableElements = ['table', 'thead', 'tr', 'th', 'tbody', 'td'];
        super(tableElements);
        
        this.modal = modal;
        this.tableElements = tableElements;
    }

    get reset(){
        this.tableElements.forEach(element => {
            this[`${element}Tag`].innerHTML = '';
        })
    }

    view(rows = []){
        let fields = this.modal.tableFields;
        fields.push('Action');
        this.reset;

        this.tableTag.setAttribute("class","table table-striped table-bordered table-sm");
        // this.theadTag.setAttribute("class", "thead-light");
            this.thTag.setAttribute("scope","col");            
            this.thTag.innerHTML = "#";
            this.trTag.appendChild(this.thTag.cloneNode(true));
            this.thTag.setAttribute("style", "width: 21%");
            fields.forEach((header, index) => {
                this.thTag.innerHTML = (this.modal.fieldAlias[header]) ? this.modal.fieldAlias[header] : header;
                this.trTag.appendChild(this.thTag.cloneNode(true));
            });
        this.theadTag.appendChild(this.trTag.cloneNode(true));
        this.tableTag.appendChild(this.theadTag.cloneNode(true));
                
        this.tbodyTag.setAttribute('id', `${this.modal.constructor.name.toLowerCase()}-table_body`)        
        
        rows.forEach((docBody, index) => {
            this.tbodyTag.appendChild(this.tableRowBuilder(docBody.doc, fields, index+1));
        });

        if(rows.length == 0){
            this.tdTag.setAttribute("colspan", 12);
            this.tdTag.innerHTML = 'No Results Found';
            this.trTag.innerHTML = '';
            this.trTag.appendChild(this.tdTag);
            this.tbodyTag.appendChild(this.trTag);
        }

        this.tableTag.appendChild(this.tbodyTag);

        return this.tableTag;
    }

    tableRowBuilder(rowDataObj, rowFields, index){
        
        
        var tr = document.createElement('tr');        
        var td = document.createElement('td');
        var btn = document.createElement('button');
    
        // th.setAttribute('scope', 'row');
        td.innerHTML = index;
        tr.appendChild(td.cloneNode(true));
    
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
            // console.log(doc);
            docToEdit = doc;
    
            (new ltm()).navigateTo(`/${doc.type}/edit`)
        }.bind(this, rowDataObj));
        td.innerHTML = '';
        td.appendChild(btn);
        tr.appendChild(td);
    
        return tr;
    }
}

class Form extends viewElements{

    constructor(modal = {}){
        let elements = ['form', 'div', 'label', 'input', 'select', 'option', 'textarea'];
        super(elements);
        this.modal = modal;
        this.modalName = this.modal.constructor.name.toLowerCase();
        this.elements = elements;
        this.divTag.setAttribute('class', 'form-group');
        this.inputTag.setAttribute('class', 'form-control');
        this.selectTag.setAttribute('class', 'form-control');
        this.textareaTag.setAttribute('class', 'form-control');
    }

    
    
    
    setModalDoc(doc_id){
        this.modalDoc = this.modal.get(doc_id);
    }

    view(){
        
        
        this.formTag.setAttribute('id', `form-${this.modalName}`);
        
        this.modal.formFields.forEach(formFieldArray => {

            // if lopp here is for iterable field row in form.
            if(formFieldArray[0] instanceof Array){
                let div = document.createElement('div');
                div.setAttribute('class', 'row');
                // for each col of iterable row.
                formFieldArray.forEach(subFormFieldArray => {
                    let innerDiv = document.createElement('div');
                    innerDiv.appendChild(createFormGroup.call(this, subFormFieldArray));
                    innerDiv.setAttribute('class', 'col-md col-sm-12');
                    div.appendChild(innerDiv.cloneNode(true));
                });
                let btnDiv = document.createElement('div');
                btnDiv.setAttribute('class', 'col-md-2 col-sm-12');
                btnDiv.appendChild(document.createElement('br'));

                let btn = document.createElement('button');
                btn.setAttribute('type', 'button');

                btn.setAttribute('class', 'btn btn-primary btn-row_add col-6');
                btn.innerHTML = 'Add';
                btnDiv.appendChild(btn.cloneNode(true));

                btn.setAttribute('class', 'btn btn-primary btn-row_delete col-6 invisible');
                btn.innerHTML = 'Delete';                
                btnDiv.appendChild(btn.cloneNode(true));

                div.appendChild(btnDiv.cloneNode(true));
                
                let div2 = document.createElement('div');
                div2.setAttribute('id', `${formFieldArray[0][0]}-group`);
                div2.appendChild(div.cloneNode(true));
                
                this.formTag.appendChild(div2);

            } else {
                
                this.formTag.appendChild(createFormGroup.call(this, formFieldArray));
            }
            
            function createFormGroup(fieldArray){
                // console.log(this);
                
                let field = fieldArray[0];
                let fieldTag = fieldArray[1];
                let fieldType = fieldArray[2] || 'text';
                let fieldStep = fieldArray[3] || '';
                let msgInValid = 'InValid';
                this.modal.fields.forEach(fa => {
                    // check for field in form field array.
                    if(fa[0].includes(field)){
                        // check for custom invalid message in form field array.
                        msgInValid = fa[2] || msgInValid;
                    }
                });
                this.divTag.innerHTML = '';
                this.labelTag.setAttribute('for', `${this.modalName}-${field}`)
                this.labelTag.innerHTML = this.modal.fieldAlias[field];
                this.divTag.appendChild(this.labelTag.cloneNode(true));     
                
                // let tagId = `${this.modalName}-${field}`;
                let tagName = `${this.modalName}[${field}]`;
                switch(fieldTag){
                    case 'input':{
                                    this.inputTag.setAttribute('type', fieldType);
                                    this.inputTag.setAttribute('step', fieldStep);
                                    // this.inputTag.setAttribute('id', tagId);
                                    this.inputTag.setAttribute('name', tagName);
                                    this.inputTag.setAttribute('placeholder', `Enter ${this.modal.fieldAlias[field]}`);
                                    this.divTag.appendChild(this.inputTag.cloneNode(true));
                                }
                                break;
                    case 'select': {
                                    // this.selectTag.setAttribute('id', tagId);
                                    this.selectTag.setAttribute('name', tagName);
                                    this.optionTag.setAttribute('value','');
                                    this.selectTag.appendChild(this.optionTag.cloneNode(true));
                                    this.divTag.appendChild(this.selectTag.cloneNode(true));
                                }
                                break;
                    case 'textarea': 
                                    // this.textareaTag.setAttribute('id', tagId);
                                    this.textareaTag.setAttribute('name', tagName);
                                    this.textareaTag.setAttribute('placeholder', `Enter ${this.modal.fieldAlias[field]}`);
                                    this.divTag.appendChild(this.textareaTag.cloneNode(true));
                }
                // if(fieldTag == 'input')
                
                // if(fieldTag == 'select')
                let divValidation = this.divTag.cloneNode();
                divValidation.setAttribute('class', 'valid-feedback');
                divValidation.innerHTML = 'Valid';
                this.divTag.appendChild(divValidation.cloneNode(true));
                divValidation.setAttribute('class', 'invalid-feedback');
                divValidation.innerHTML = msgInValid;
                this.divTag.appendChild(divValidation.cloneNode(true));
                return this.divTag.cloneNode(true);
            }
            this.resetTags();
        });
        // console.log(this.formTag);
        // this.formTag.firstElementChild.querySelectorAll('input', () => {
        //     console.log(this);
        //     this.setAttribute('autofocus','');
        // });
        
        return this.formTag;
    }

    resetTags(){
        this.divTag.innerHTML = '';
        this.labelTag.innerHTML = '';
        this.inputTag.innerHTML = '';
        this.selectTag.innerHTML = '';
        this.optionTag.innerHTML = '';
        this.textareaTag.innerHTML = '';
    }
}