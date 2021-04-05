var LATEST_LOADER = 0;
var loaderObject = $('#loader-container');
var Loader = function(timeout=60000){
    LATEST_LOADER++;
    this.loaderId = LATEST_LOADER;
    this.timeout = timeout;

    this.hide = function(){
        if ( this.loaderId === LATEST_LOADER ){
            $('#loader-container').hide();
        }
    }

    this.show = function(){
        $('#loader-container').show();
        var that = this;
        setTimeout(
            function(){
                that.hide()
            },
            that.timeout
        );
    }
}