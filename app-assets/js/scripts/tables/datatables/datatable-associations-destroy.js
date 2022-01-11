$(document).ready(function () {
    var tableToDestroy = $('.sendkey-assoc').DataTable();
    console.log(tableToDestroy);
    if (tableToDestroy != null) {
        tableToDestroy.destroy(false);
    }
});