$(function(){
    load();
    $('.close-error-alert-modal').on('click', function(){
        $('#error-alert-modal').modal('hide');
    });

    $('#check-address').on('click', function(){
        var address = $('#address-input').val();
        if (!address){
            return;
        }
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set("address", address);
        window.location.search = searchParams.toString();
        //checkAddress(address);
    });
    $('body').on('click', '.show-price-at-transaction-time', function(){
        var time = $(this).attr('time');
        var parent = $(this).parent();
        var amount = $(this).attr('amount');
        Promise.all([
            api.getPriceAtTransactionTime(time, 'EUR'),
            api.getPriceAtTransactionTime(time, 'USD')
        ])
        .then(function(data){
            var eur = data[0].Data.Data[1].close;
            var usd = data[1].Data.Data[1].close;
            $(parent).empty();
            $(parent).append(
                `
                <span>${(amount*usd).toFixed(2)} USD</span>
                <br>
                <span>${(amount*eur).toFixed(2)} EUR</span>    
                `
            );
            console.log(eur, usd)
        })
        .catch(function(e){
            $('#error-alert-modal').find('.modal-body').find('p').text(e.Message);
            $('#error-alert-modal').modal('show');
        })
    });
});

var load = function(){
    var urlParams = new URLSearchParams(window.location.search);
    var address = urlParams.get('address');
    if (!address){
        return;
    }
    $('#address-input').val(address);
    checkAddress(address);
}

var blockPayment = function(tx, conversion, eurNow, usdNow){
    var date = new Date(tx.time*1000);
    var html = `
        <div class="row">
            <div class="col-12 my-1">
                <div class="border rounded p-4 bg-light">
                    <div class="row">
                        <div class="col-7 text-left">
                            <strong><span class="${tx.result > 0 ? 'text-success': 'text-danger'}">${tx.result > 0 ? '+': ''}${tx.result/conversion} BTC</span></strong>
                            <br>
                            <span>${(tx.result/conversion*usdNow).toFixed(2)}</span> USD now
                            <br>
                            <span>${(tx.result/conversion*eurNow).toFixed(2)}</span> EUR now
                        </div>
                        <div class="col-5 text-right">
                            ${date.toLocaleDateString()} ${date.toTimeString().split(' ')[0]}
                        </div>
                        <div class="col-12">
                            <span>Value when Transacted:</span>
                            <div class="my-2">
                                <button type="button" time="${tx.time}" amount="${tx.result/conversion}" class="btn btn-primary show-price-at-transaction-time">Show</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return html;
}

var checkAddress = function(address){
    api.getPrice(function(errPrice, dataPrice){
        if (errPrice){
            alert('error');
            return;
        }
        api.getWAddress(address, function(err, data){
            if (err){
                alert('error');
                return;
            }
            $('#final-balance').text(data.addresses[0].final_balance/data.info.conversion);
            $('#total-received').text(data.addresses[0].total_received/data.info.conversion);
            $('#total-sent').text(data.addresses[0].total_sent/data.info.conversion);
            $('#total-transactions').text((data.addresses[0].n_tx).toLocaleString());
            $('#balance-row').removeClass('d-none');
    
            var html = `
                <div class=row">
                    <div class="col-12 my-2 px-0">
                        <span class="h4">Transactions:</span>
                    </div>
                </div>
            `;
            for(let i=0; i < data.txs.length; i++){
                html += blockPayment(data.txs[i], data.info.conversion, dataPrice.EUR, dataPrice.USD);
            }
            $('#txs-row').append(html);
            $('#txs-row').removeClass('d-none');
        });
    });
    
}