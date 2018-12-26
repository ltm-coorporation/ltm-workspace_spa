

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
        let elements = ['form', 'div', 'label', 'input', 'select', 'option'];
        super(elements);
        this.modal = modal;
        this.modalName = this.modal.constructor.name.toLowerCase();
        this.elements = elements;
        this.divTag.setAttribute('class', 'form-group');
        this.inputTag.setAttribute('class', 'form-control');
        this.selectTag.setAttribute('class', 'form-control');
    }

    view(){
        
        
        this.formTag.setAttribute('id', `form-${this.modalName}`);
        
        // console.log(this.modal);
        this.modal.formFields.forEach(fieldArray => {
            let field = fieldArray[0];
            let fieldType = fieldArray[1];            
            this.labelTag.setAttribute('for', `${this.modalName}-${field}`)
            this.labelTag.innerHTML = this.modal.fieldAlias[field];
            this.divTag.appendChild(this.labelTag.cloneNode(true));            
            
            if(fieldType == 'input'){
                this.inputTag.setAttribute('type', 'text');
                this.inputTag.setAttribute('id', `${this.modalName}-${field}`);
                this.divTag.appendChild(this.inputTag.cloneNode(true));
            }
            
            if(fieldType == 'select'){
                this.selectTag.setAttribute('id', `${this.modalName}-${field}`);
                // this.optionTag.setAttribute('value', `${this}`);
                this.selectTag.appendChild(this.optionTag.cloneNode(true));
                this.divTag.appendChild(this.selectTag.cloneNode(true));
            }

            let divValidation = this.divTag.cloneNode();
            divValidation.setAttribute('class', 'valid-feedback');
            divValidation.innerHTML = 'Valid';
            this.divTag.appendChild(divValidation.cloneNode(true));
            divValidation.setAttribute('class', 'invalid-feedback');
            divValidation.innerHTML = 'Invalid';
            this.divTag.appendChild(divValidation.cloneNode(true));
            
            this.formTag.appendChild(this.divTag.cloneNode(true));

            this.divTag.innerHTML = '';
        });

        return this.formTag;
    }
}