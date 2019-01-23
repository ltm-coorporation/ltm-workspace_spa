$('#syncModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-body #modal-username').val('prashant4');
    modal.find('.modal-body #modal-password').val('qwerty');
    
})
$('#btnSync').click(function(e){
    var modal = $('#syncModal');
    let username = modal.find('#modal-username').val()
    let password = modal.find('#modal-password').val()
    let data = new URLSearchParams();
    data.append('username', username); data.append('password', password);
    // fetch('http://localhost:3001/api/user/create', {
    //     method: 'POST',
    //     mode: 'no-cors',
    //     body: data,        
        
    // })

    // .then(function(res){
    //     let result = res.json();
    //     return result;
    // })
    // .then(function(response){
    //     console.log(response); 
    //     $('syncModal').modal('hide');
    // }).catch(function(err){ console.log(err); });

    // var data = "username=prashant4&password=qwerty&undefined=";

    var xhr = new XMLHttpRequest();
    // xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
        // console.log(this.responseText);
        let res = JSON.parse(this.responseText);

        if(res.statusCode == 200 || res.statusCode == 201){
            $('#syncModal').modal('hide');
            db.replicate.to(res.body.dbhost+`/${username}`);
            db.replicate.from(res.body.dbhost+`/${username}`);
        }
    }
    });

    xhr.open("POST", "http://localhost:3001/api/user/create");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // xhr.setRequestHeader("cache-control", "no-cache");
    // xhr.setRequestHeader("Postman-Token", "321ac92d-f454-43f1-816b-93d39db55871");

    xhr.send(data);
})