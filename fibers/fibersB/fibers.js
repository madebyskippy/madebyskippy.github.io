/*************************
*
*   gets parameter right after ? in [data]
*   or 'team' if does not exist (this is the default)
*************************/
function getURLParameter(data) {
    return decodeURI(
        (RegExp('[?]'+'(.+?)(&|$)').exec(data)||[,'team'])[1]
    );
}

$(document).ready(function(){    

    var page=getURLParameter(location.search);
    console.log(page);
    
    if (page!='team'){
        $('.toggle').attr('id','closed');
        $('.toggle.'+page).attr('id','open');
    }else{ //default, show team
    }
    
});