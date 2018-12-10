
var ltm = function(){};

window.addEventListener('load', () => {

    const el = $('#app');

    const errorTemplate = Handlebars.compile($('#error_template').html());

    
    
    

    // home template
    const homeTemplate = Handlebars.compile($('#home_template').html());

    //party templates
    const partyTemplate = Handlebars.compile($('#party_template').html());
    const partyAddTemplate = Handlebars.compile($('#template-party_add').html());
    
    //payments templates
    const paymentsTemplate = Handlebars.compile($('#payments_template').html());
    const paymentsAddTemplae = Handlebars.compile($('#payments-add_template').html());

    //stock templates
    const stockTemplate = Handlebars.compile($('#stock_template').html());
    const stockAddTemplate = Handlebars.compile($('#stock-add_template').html());

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
        showPartyList();
        el.html(html);
    });

    router.add('/party/add', () => {
        let html = partyAddTemplate();
        el.html(html);
    });

    //payments routes
    router.add('/payments', () => {
        let html = paymentsTemplate();
        showPaymentList();
        el.html(html);
    });

    router.add('/payments/add', () => {
        let html = paymentsAddTemplae();
        el.html(html);
    });

    // stock routes
    router.add('/stock', () => {
        let html = stockTemplate();
        showStockList();
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