/*=========================================================================================
    File Name: datatables-associations.js
    Description: Associations Create/Edit Datatable
    ----------------------------------------------------------------------------------------
    Item Name: Stack - Responsive Admin Theme
    Version: 1.1
==========================================================================================*/

$(document).ready(function () {

    /****************************************
    *       js of zero configuration        *
    ****************************************/
    // Setup - add a text input to each footer cell
    $('#assocColumnFilteredTable thead td').each(function (i) {
        var title = $('#assocColumnFilteredTable thead th').eq($(this).index()).text();
        if (title !== '') {
            $(this).html('<input type="text" class="form-control input-sm" style="width: auto;" placeholder="Search ' + title + '" data-index="' + i + '" />');
        }
    });

    var table = $('.sendkey-assoc').DataTable({
        "dom": '<"top">rt<"bottom"><"clear">',
        columnDefs: [
            { orderable: false, targets: [4, 5, 6, 7, 8] }
        ]
    });

    // Filter event handler
    $(table.table().container()).on('keyup', 'thead input', function () {
        table
            .column($(this).data('index'))
            .search(this.value)
            .draw();
    });

});