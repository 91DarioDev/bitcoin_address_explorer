$(function(){
    $('#currency-switch').on('change', function(){
        setCurChoice($(this).val());
        curChoice(getCurChoice());
    });
    load();
    $('.close-error-alert-modal').on('click', function(){
        $('#error-alert-modal').modal('hide');
    });

    $('#check-address').on('click', function(){
        var address = $('#address-input').val().trim();
        if (!address){
            return;
        }
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set("address", address);
        searchParams.set("page", 1);
        window.location.search = searchParams.toString();
    });
    $('body').on('click', '.show-price-at-transaction-time', function(){
        var loading = new Loader();
        loading.show();
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
                <div>
                    <div>Value at transaction time: </div>
                    <div class="usd-cur-choice">${utils.fNum(Math.abs((amount*usd)), true)} USD @ ${utils.fNum(usd, true)} USD</div>
                    <div class="eur-cur-choice">${utils.fNum(Math.abs((amount*eur)), true)} EUR @ ${utils.fNum(eur, true)} EUR</div>
                </div>
                `
            );
            curChoice(getCurChoice());
        })
        .catch(function(e){
            showError(e.Message)
        })
        .finally(()=>{
            loading.hide();
        })
    });
});


var curChoice = (cur) =>{
    if (cur === 'usd'){
        $('.usd-cur-choice').removeClass('d-none');
        $('.eur-cur-choice').addClass('d-none');
    } else if (cur === 'eur') {
        $('.usd-cur-choice').addClass('d-none');
        $('.eur-cur-choice').removeClass('d-none');
    } else if (cur === 'usd+eur'){
        $('.usd-cur-choice').removeClass('d-none');
        $('.eur-cur-choice').removeClass('d-none');
    }
}

var getCurChoice = () => {
    var choice = localStorage.getItem('cur-choice');
    if (!choice) {
        choice = 'usd';
        setCurChoice(choice);
    }
    return choice;
}

var setCurChoice = (cur) => {
    localStorage.setItem('cur-choice', cur);
}

var updateChangePrice = (usd, eur, usd24hPct, eur24hPct)=>{
    $('#btc-to-usd').text(utils.fNum(usd, true));
    $('#btc-to-eur').text(utils.fNum(eur, true));

    $("#usd-24h-pct").text(`${usd24hPct > 0 ? '+' : ''}${utils.fNum(usd24hPct, true)}%`);
    $("#eur-24h-pct").text(`${eur24hPct > 0 ? '+' : ''}${utils.fNum(eur24hPct, true)}%`);
    $("#usd-24h-pct").removeClass('text-success').removeClass('text-danger').addClass(`${usd24hPct > 0 ? 'text-success' : 'text-danger'}`);
    $("#eur-24h-pct").removeClass('text-success').removeClass('text-danger').addClass(`${eur24hPct > 0 ? 'text-success' : 'text-danger'}`);

}

var confirmationsText = function(num, amountToConfirm=12){
    var text;
    var icon;
    if (num == 0){
        text = `confirmations: 0`;
        icon =  `<i class="fas fa-question-circle text-danger"></i>`;
    } else if ( num < amountToConfirm+1){
        text = `confirmations: ${num}`;
        icon =  `<i class="far fa-clock text-warning"></i>`;
    } else {
        text = `confirmations: ${amountToConfirm}+`;
        icon = `<i class="fas fa-check-circle text-success"></i>`;
    }
    return {text, icon};
}


var showError = function(stringE){
    $('#error-alert-modal').find('.modal-body').find('p').text(stringE);
    $('#error-alert-modal').modal('show');
}

var load = function(){
    var loading = new Loader();
    loading.show();
    $('#currency-switch').val(getCurChoice());
    var urlParams = new URLSearchParams(window.location.search);
    var address = urlParams.get('address');
    var page = urlParams.get('page');
    if (!address){
        api.getPrice()
        .then(res=>{
            updateChangePrice(
                res.RAW.BTC.USD.PRICE, 
                res.RAW.BTC.EUR.PRICE,
                res.RAW.BTC.USD.CHANGEPCT24HOUR,
                res.RAW.BTC.EUR.CHANGEPCT24HOUR,
            );
            curChoice(getCurChoice());
        })
        .catch(err=>{
            //
        })
        .finally(()=>{
            loading.hide();
        });
        return;
    }
    if (!page){
        urlParams.set("page", 1);
        window.location.search = urlParams.toString();
        loading.hide();
        return;
    }
    $('#address-input').val(address);
    checkAddress(address, page, function(){
        loading.hide();
        curChoice(getCurChoice());
    });
    

}

var blockPayment = function(tx, conversion, eurNow, usdNow, latest_height){
    var date = new Date(tx.time*1000);
    var confirmations = tx.block_height ? latest_height-tx.block_height+1 : 0;
    var confirmationsOutput = confirmationsText(confirmations);
    var html = `
        <div class="row my-3">
            <div class="col-12">
                <div class="border rounded py-2 px-4">
                    <div class="row">
                        <div class="col-12 border-bottom text-center pb-2 ${tx.result > 0 ? 'text-success': 'text-danger'}">
                            <strong class="">${tx.result > 0 ? 'RECEIVED': 'SENT'}</strong>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-8 text-left">
                            <div><strong><span class="${tx.result > 0 ? 'text-success': 'text-danger'}">${tx.result > 0 ? '+': ''}${tx.result/conversion} BTC</span></strong></div>
                            <div class="usd-cur-choice"><span>${utils.fNum((Math.abs(tx.result/conversion*usdNow)), true)}</span> USD now</div>
                            <div class="eur-cur-choice d-none"><span>${utils.fNum((Math.abs(tx.result/conversion*eurNow)), true)}</span> EUR now</div>
                        </div>
                        <div class="col-4 text-right">
                            <div>${date.toLocaleDateString()}</div><div>${date.toTimeString().split(' ')[0]}</div>
                        </div>
                        <div class="col-12">
                            <div><span>${confirmationsOutput.text} </span><span> ${confirmationsOutput.icon}</span></div>
                        </div>
                        <div class="col-12 my-1 ${date.getTime() < new Date().getTime()-86400*7*1000 ? 'd-none' : ''}">
                            Value at transaction time: 
                            <button type="button" time="${tx.time}" amount="${tx.result/conversion}" class="ml-1 btn btn-sm btn-primary show-price-at-transaction-time">Show</button>
                        </div>
                        <div class="col-12 my-1">
                            <div class="">tx hash:</div> 
                            <div style="word-wrap: break-word;">${tx.hash}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return html;
}

var checkAddress = function(address, page, cb){
    Promise.all([
        api.getPrice(),
        api.getWAddress(address, page)
    ])
    .then(res=>{
        var dataPrice = res[0];
        var data = res[1];

        updateChangePrice(
            dataPrice.RAW.BTC.USD.PRICE, 
            dataPrice.RAW.BTC.EUR.PRICE,
            dataPrice.RAW.BTC.USD.CHANGEPCT24HOUR,
            dataPrice.RAW.BTC.EUR.CHANGEPCT24HOUR,
        );
        $('#final-balance').text(data.addresses[0].final_balance/data.info.conversion);
        $('#final-balance-usd').text(utils.fNum(data.addresses[0].total_received/data.info.conversion*dataPrice.RAW.BTC.USD.PRICE, true));
        $('#final-balance-eur').text(utils.fNum(data.addresses[0].total_received/data.info.conversion*dataPrice.RAW.BTC.EUR.PRICE, true));
        $('#total-received').text(data.addresses[0].total_received/data.info.conversion);
        $('#total-sent').text(data.addresses[0].total_sent/data.info.conversion);
        $('#total-transactions').text(utils.fNum(data.addresses[0].n_tx));
        $('#balance-row').removeClass('d-none');

        if ( data.txs.length > 0 ){
            var html = `
                <div class=row">
                    <div class="col-12 my-2 px-0">
                        <span class="h4">Transactions:</span>
                    </div>
                </div>
            `;
            for(let i=0; i < data.txs.length; i++){
                html += blockPayment(data.txs[i], data.info.conversion, dataPrice.RAW.BTC.EUR.PRICE, dataPrice.RAW.BTC.USD.PRICE, data.info.latest_block.height);
            }
            html += `
                <div class="row">
                    <div class="col-12 text-center my-3">
                        <div id="pagination-container"></div>
                    </div>
                </div>
            `;
            $('#txs-row').append(html);
            $('#txs-row').removeClass('d-none');
            var searchParams = new URLSearchParams(window.location.search);
            var address = searchParams.get("address");
            $('#pagination-container').pagination({
                items: data.addresses[0].n_tx > constants.MAX_OFFSET_TX ? data.addresses[0].n_tx-constants.MAX_OFFSET_TX : data.addresses[0].n_tx,
                itemsOnPage: constants.ITEMS_PER_PAGE,
                ellipsePageSet: false,
                edges: 1,
                currentPage: page,
                displayedPages: 3,
                hrefTextPrefix: `?address=${address}&page=`
            });
        }
        
    })
    .catch(e=>{
        try {
            var str = e.ReponseJSON.message;
        } catch (exception){
            var str = 'An error occurred';
        }
        showError(str)
    })
    .finally(()=>{
        cb();
    })
}