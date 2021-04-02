var api = {
    getWAddress: function(address, callback){
        var loading = new Loader();
        loading.show();
        $.ajax({
            url : `https://blockchain.info/multiaddr?active=${address}`,
            type : 'GET',
            crossDomain: true,
            dataType:'json',
            success : function(data) {  
                loading.hide();
                return callback(null, data)
            },
            error : function(e){
                loading.hide();
                return callback(e)
            }
        });
    },
    getPrice: function(callback){
        var loading = new Loader();
        loading.show();
        $.ajax({
            url : `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR`,
            type : 'GET',
            crossDomain: true,
            dataType:'json',
            success : function(data) {  
                loading.hide();
                return callback(null, data)
            },
            error : function(e){
                loading.hide();
                return callback(e)
            }
        });
    },
    getPriceAtTransactionTime: function(ts, cur){
        return new Promise((resolve, reject)=>{
            var loading = new Loader();
            loading.show();
            $.ajax({
                url : `https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=${cur}&limit=1&toTs=${ts}`,
                type : 'GET',
                crossDomain: true,
                dataType:'json',
                success : function(data) {
                    loading.hide();
                    if (data.Response === "Error") return reject(data); 
                    return resolve(data);
                },
                error : function(e){
                    loading.hide();
                    return reject(e);
                }
            });
        })
    }
};