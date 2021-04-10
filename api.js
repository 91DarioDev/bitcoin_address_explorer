var api = {
    getWAddress: function(address, page=1){
        return new Promise((resolve, reject)=>{
            $.ajax({
                url : `https://blockchain.info/multiaddr?active=${address}&n=${constants.ITEMS_PER_PAGE}&offset=${(page-1)*constants.ITEMS_PER_PAGE}`,
                type : 'GET',
                crossDomain: true,
                dataType:'json',
                success : function(data) {  
                    return resolve(data)
                },
                error : function(e){
                    return reject(e)
                }
            });
        });
    },
    getPrice: function(){
        return new Promise((resolve, reject)=>{
            $.ajax({
                url : `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD,EUR`,
                type : 'GET',
                crossDomain: true,
                dataType:'json',
                success : function(data) {  
                    return resolve(data);
                },
                error : function(e){
                    return reject(e);
                }
            });
        });
    },
    getPriceAtTransactionTime: function(ts, cur){
        return new Promise((resolve, reject)=>{
            $.ajax({
                url : `https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=${cur}&limit=1&toTs=${ts}`,
                type : 'GET',
                crossDomain: true,
                dataType:'json',
                success : function(data) {
                    if (data.Response === "Error") return reject(data); 
                    return resolve(data);
                },
                error : function(e){
                    return reject(e);
                }
            });
        })
    }
};