
var ltm = function(){};

window.addEventListener('load', () => {

    const el = $('#app');

    const errorTemplate = Handlebars.compile($('#error_template').html());

    
    
    

    // home template
    const homeTemplate = Handlebars.compile($('#template-home').html());

    //party templates
    const partyTemplate = Handlebars.compile($('#template-party').html());
    const partyAddTemplate = Handlebars.compile($('#template-party_add').html());
    
    //payments templates
    const paymentsTemplate = Handlebars.compile($('#template-payments').html());
    const paymentsAddTemplae = Handlebars.compile($('#template-payments_add').html());

    //stock templates
    const stockTemplate = Handlebars.compile($('#template-stock').html());
    const stockAddTemplate = Handlebars.compile($('#template-stock_add').html());

    const router = new Router({
        mode: 'history',
        page404: (path) => {
            const html = errorTemplate({
                color: 'yellow',
                title: 'Error 404 - Page NOT Found!',
                message: `The path '/${path}' does not exist on this site`
            });

            el.html(html);
        }
    });


    // root
    router.add('/', () => {
        let html = homeTemplate();
        el.html(html);
    });

    //party routes 
    router.add('/party', () => {
        let html = partyTemplate();
        showList('Party');
        el.html(html);
    });

    router.add('/party/add', () => {
        let html = partyAddTemplate();
        el.html(html);
    });

    //payments routes
    router.add('/payments', () => {
        let html = paymentsTemplate();
        showList('Payment');
        el.html(html);
    });

    router.add('/payments/add', () => {
        let html = paymentsAddTemplae();
        el.html(html);
    });

    // stock routes
    router.add('/stock', () => {
        let html = stockTemplate();
        showList('Stock');
        // showStockList();
        el.html(html);
    });

    router.add('/stock/add', () => {
        let html = stockAddTemplate();
        el.html(html);
    });

    router.navigateTo(window.location.pathname);
    
    // document.customEvent = {};
    ltm.prototype.navigateTo = function(path){
        router.navigateTo(path);
    };

    $('.navigator').on('click', (e) => {
        e.preventDefault();

        const target = $(e.target);
        const path = target.attr('href');

        // const path = href.substr(href.lastIndexOf('/'));
        router.navigateTo(path);
    });
});