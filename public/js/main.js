$(document).ready(function(){

    $('.deleteUser').on('click', deleteUser);

});

function deleteUser(){
    let confirmation = confirm('Are You Sure?');

    if(confirmation){
        $.ajax({
            type: 'DELETE',
            url: '/users/delete/'+$(this).data('id')
        }).done(function(response){
            window.location.replace('/');
        });
    } else {
        return flase;
    }
};