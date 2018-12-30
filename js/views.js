

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

    view(){
        
        this.reset;

        this.tableTag.setAttribute("class","table table-stripped");
        this.theadTag.setAttribute("class", "thead-light");
            this.thTag.setAttribute("scope","col");
            this.thTag.innerHTML = "#";
            this.trTag.appendChild(this.thTag.cloneNode(true));
            this.modal.tableFields.forEach(header => {
                this.thTag.innerHTML = header;
                this.trTag.appendChild(this.thTag.cloneNode(true));
            });
        this.theadTag.appendChild(this.trTag.cloneNode(true));
        this.tableTag.appendChild(this.theadTag.cloneNode(true));
                
        this.tbodyTag.setAttribute('id', `${this.modal.constructor.name.toLowerCase()}-table_body`)
        this.tableTag.appendChild(this.tbodyTag.cloneNode(true));

        return this.tableTag;
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

    view(){
        
        
        this.formTag.setAttribute('id', `form-${this.modalName}`);
        
        this.modal.formFields.forEach(formFieldArray => {

            if(formFieldArray[0] instanceof Array){
                let div = document.createElement('div');
                div.setAttribute('class', 'row');
                formFieldArray.forEach(subFormFieldArray => {
                    let innerDiv = document.createElement('div');
                    innerDiv.appendChild(createFormGroup.call(this, subFormFieldArray));
                    innerDiv.setAttribute('class', 'col');
                    div.appendChild(innerDiv.cloneNode(true));
                });
                let btn = document.createElement('button');
                btn.setAttribute('type', 'button');
                btn.setAttribute('class', 'btn btn-primary');
                btn.innerHTML = 'Button';
                btn.addEventListener('click', function(){
                    var parentDiv = this.parentNode;
                    parentDiv.appendChild(div.cloneNode(true));
                })
                let div2 = document.createElement('div');
                div2.setAttribute('id', `${formFieldArray[0][0]}-group`);
                div2.appendChild(div.cloneNode(true));
                div2.appendChild(btn);
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
                    if(fa[0].includes(field)){
                        msgInValid = fa[2] || msgInValid;
                    }
                });
                this.divTag.innerHTML = '';
                this.labelTag.setAttribute('for', `${this.modalName}-${field}`)
                this.labelTag.innerHTML = this.modal.fieldAlias[field];
                this.divTag.appendChild(this.labelTag.cloneNode(true));            
                
                let tagId = `${this.modalName}-${field}`;
                switch(fieldTag){
                    case 'input':{
                                    this.inputTag.setAttribute('type', fieldType);
                                    this.inputTag.setAttribute('step', fieldStep);
                                    this.inputTag.setAttribute('id', tagId);
                                    this.inputTag.setAttribute('placeholder', `Enter ${this.modal.fieldAlias[field]}`);
                                    this.divTag.appendChild(this.inputTag.cloneNode(true));
                                }
                                break;
                    case 'select': {
                                    this.selectTag.setAttribute('id', tagId);
                                    // this.optionTag.setAttribute('value', `${this}`);
                                    this.selectTag.appendChild(this.optionTag.cloneNode(true));
                                    this.divTag.appendChild(this.selectTag.cloneNode(true));
                                }
                                break;
                    case 'textarea': this.textareaTag.setAttribute('id', tagId);
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
        });

        return this.formTag;
    }
}