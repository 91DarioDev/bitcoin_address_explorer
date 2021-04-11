var utils = {
    fNum: (num, decimal=false)=>{
        var parsed = decimal ? parseFloat(num) : parseInt(num);
        return (parsed).toLocaleString(undefined, {
            minimumFractionDigits: decimal ? 2 : 0,
            maximumFractionDigits: decimal ? 2 : 0
        });
    },
    fBtc: (num)=>{
        var parsed = parseFloat(num);
        return (parsed).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 8
        });
    },
    middleEllipsis: (str, chars=8)=>{
        return `${str.slice(0,chars)}...${str.slice(str.length-chars)}`;
    }
};