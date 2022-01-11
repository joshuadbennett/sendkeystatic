/*=========================================================================================
    File Name: datatables-basic.js
    Description: Basic Datatable
    ----------------------------------------------------------------------------------------
    Item Name: Stack - Responsive Admin Theme
    Version: 1.1
    Author: PIXINVENT
    Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

$(document).ready(function() {

    /****************************************
    *       js of zero configuration        *
    ****************************************/

    $('.zero-configuration').DataTable();

    /**************************************
    *       js of default ordering        *
    **************************************/

    $('.default-ordering').DataTable({
        "order": [[3, "desc"]]
    });

    /************************************
    *       js of multi ordering        *
    ************************************/

    $('.multi-ordering').DataTable({
        columnDefs: [{
            targets: [0],
            orderData: [0, 1]
        }, {
            targets: [1],
            orderData: [1, 0]
        }, {
            targets: [4],
            orderData: [4, 0]
        }]
    });

    /*************************************
    *       js of complex headers        *
    *************************************/

    $('.complex-headers').DataTable();

    /*************************************
    *       js of dom positioning        *
    *************************************/

    $('.dom-positioning').DataTable({
        "dom": '<"top"i>rt<"bottom"flp><"clear">'
    });

    /************************************
    *       js of alt pagination        *
    ************************************/

    $('.alt-pagination').DataTable({
        "pagingType": "full_numbers"
    });

    /*************************************
    *       js of scroll vertical        *
    *************************************/

    $('.scroll-vertical').DataTable({
        "scrollY": "200px",
        "scrollCollapse": true,
        "paging": false
    });

    /************************************
    *       js of dynamic height        *
    ************************************/

    $('.dynamic-height').DataTable({
        scrollY: '50vh',
        scrollCollapse: true,
        paging: false
    });

    /***************************************
    *       js of scroll horizontal        *
    ***************************************/

    $('.scroll-horizontal').DataTable({
        "scrollX": true
    });

    /**************************************************
    *       js of scroll horizontal & vertical        *
    **************************************************/

    $('.scroll-horizontal-vertical').DataTable({
        "scrollY": 200,
        "scrollX": true
    });

    /**********************************************
    *       Language - Comma decimal place        *
    **********************************************/

    $('.comma-decimal-place').DataTable({
        "language": {
            "decimal": ",",
            "thousands": "."
        }
    });
    

   /****************************************
   *       js of zero configuration        *
   ****************************************/
    // Setup - add a text input to each footer cell
    $('#columnFilteredTable thead td').each(function (i) {
        var title = $('#columnFilteredTable thead th').eq($(this).index()).text();
        if (title !== '')
        {
            $(this).html('<input type="text" class="form-control input-sm" style="width: auto;" placeholder="Search ' + title + '" data-index="' + i + '" />');
        }
    });
    
    var table = $('.multi-column-configuration').DataTable({
        columnDefs: [
            { orderable: false, targets: 0 }
        ]
    });

    // Filter event handler
    $(table.table().container()).on('keyup', 'thead input', function () {
        table
            .column($(this).data('index'))
            .search(this.value)
            .draw();
    });


    /****************************************
    *       js of min max table             *
    ****************************************/

    $('.min-max').dataTable({
        "dom": '<"top">rt<"bottom"><"clear">',
        "order": [],
        searching: false
    });

    /*****************************
     * js of sendkey rates table *
    *****************************/

    $('.rates').dataTable({
        "stateSave": true,
        "stateDuration": 0
    });

    /*******************************
    * js of sendkey accounts table *
    *******************************/

    $('.accounts').dataTable({
        "stateSave": true,
        "stateDuration": 0
    });

    /***********************************
    * js of sendkey associations table *
    ***********************************/

    $('.associations').dataTable({
        "stateSave": true,
        "stateDuration": 0
    });

    /************************************
     * js of sendkey transactions table *
    ************************************/

    $('.transactions').dataTable({
        "order": [[6, "desc"]],
        "stateSave": true,
        "stateDuration": 0,
        columnDefs: [
            { orderable: false, targets: [8, 9] }
        ]
    });

    /*******************************
     * js of sendkey billing table *
    *******************************/

    $('.billing').dataTable({
        "order": [[9, "desc"]],
        "stateSave": true,
        "stateDuration": 0
    });

   /***********************************
   * js of sendkey activity log table *
   ***********************************/

    $('.activity-log').dataTable({
        "order": [[0, "desc"]],
        "stateSave": true,
        "stateDuration": 0
    });

    /**********************************
    * js of sendkey alert codes table *
    **********************************/

    $('.alert-codes').dataTable({
        "order": [[2, "asc"]],
        "stateSave": true,
        "stateDuration": 0
    });

    /*************************************
    * js of sendkey alert contacts table *
    *************************************/

    $('.alert-contacts').dataTable({
        "order": [[3, "asc"]],
        "stateSave": true,
        "stateDuration": 0
    });

    /*******************************************
    * js of sendkey account associations table *
    *******************************************/

    $('.kcp-assoc').dataTable({
        "dom": '<"top">rt<"bottom"><"clear">',
        columnDefs: [
            { orderable: false, targets: [3, 4, 5, 6] }
        ],
        "stateSave": true,
        "stateDuration": 0
    });

    /******************************************
    *  js of sendkey account addresses table  *
    ******************************************/

    $('.kcp-addr').dataTable({
        "dom": '<"top">rt<"bottom"><"clear">',
        columnDefs: [
            { orderable: false, targets: [5, 6, 7] }
        ],
        "stateSave": true,
        "stateDuration": 0
    });
});
