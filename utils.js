var utils = {
    fNum: (num, decimal=false)=>{
        var parsed = decimal ? parseFloat(num) : parseInt(num);
        return (parsed).toLocaleString(undefined, {
            minimumFractionDigits: decimal ? 2 : 0,
            maximumFractionDigits: decimal ? 2 : 0
        });
    }
};