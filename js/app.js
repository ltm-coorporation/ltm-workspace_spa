
var ltm = function(){};

window.addEventListener('load', () => {

    const el = $('#app');

    const errorTemplate = Handlebars.compile($('#error_template').html());

    
    
    

    // home template
    const homeTemplate = Handlebars.compile($('#template-home').html());

    //order templates
    const orderTemplate = Handlebars.compile($('#template-order').html());
    const orderAddTemplate = Handlebars.compile($('#template-order_add').html());

    //party templates
    const partyTemplate = Handlebars.compile($('#template-party').html());
    const partyAddTemplate = Handlebars.compile($('#template-party_add').html());
    
    //payments templates
    const paymentsTemplate = Handlebars.compile($('#template-payments').html());
    const paymentsAddTemplae = Handlebars.compile($('#template-payments_add').html());

    //stock templates
    const stockTemplate = Handlebars.compile($('#template-stock').html());
    const stockAddTemplate = Handlebars.compile($('#template-stock_add').html());

    //purchase templates
    const purchaseTemplate = Handlebars.compile($('#template-purchase').html());
    const purchaseAddTemplate = Handlebars.compile($('#template-purchase_add').html());
    
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

    //order routes 
    router.add('/order', () => {
        let html = orderTemplate();
        showList('Order');
        el.html(html);
    });

    router.add('/order/add', () => {
        let html = orderAddTemplate();        
        el.html(html);
    });

    router.add('/order/edit', () => {
        let html = orderAddTemplate();
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

    router.add('/party/edit', () => {
        let html = partyAddTemplate();
        el.html(html);
    });

    //payments routes
    router.add('/payment', () => {
        let html = paymentsTemplate();
        showList('Payment');
        el.html(html);
    });

    router.add('/payment/add', () => {
        let html = paymentsAddTemplae();       
        el.html(html);
    });

    router.add('/payment/edit', () => {
        let html = paymentsAddTemplae();
        el.html(html);
    });
    // stock routes
    router.add('/stock', () => {
        let html = stockTemplate();
        showList('Stock');
        el.html(html);
    });

    router.add('/stock/add', () => {
        let html = stockAddTemplate();        
        el.html(html);
    });

    router.add('/stock/edit', () => {
        let html = stockAddTemplate();
        el.html(html);
    });

    // purchase routes
    router.add('/purchase', () => {
        let html = purchaseTemplate();
        showList('Purchase');
        el.html(html);
    });

    router.add('/purchase/add', () => {
        let html = purchaseAddTemplate();        
        el.html(html);
    });

    router.add('/purchase/edit', () => {
        let html = purchaseAddTemplate();
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