// var canvas;
// var context;
// var lastClicked="";
// var lastHeight=0;
// var lastWindowSize;

$(document).ready(function(){

    $('.thumb1').html('<div class="thumb">'+
            '<a href="reflectionpond.html"><img src="imgs/potion/msk_t.png"><br><br>Reflection Pond</a>'+
        '</div>'+
        '<div class="thumb middle">'+
            '<a href="projection.html"><img src="imgs/potion/guitar_t.png"><br><br>Dynamic Projection</a>'+
        '</div>'+
        '<div class="thumb">'+
            '<a href="cityexplorer.html"><img src="imgs/potion_t.png"><br><br>City Explorer</a>'+
        '</div>');
    $('.thumb2').html('<div class="thumb">'+
            '<a href="magicbook.html"><img src="imgs/potion/ajhs_t.jpg"><br><br>Magic Book</a>'+
        '</div>'+
        '<div class="thumb middle">'+
            '<a href="gardengames.html"><img src="imgs/gardengames_t.png"><br><br>Garden Games</a>'+
        '</div>'+
        '<div class="thumb">'+
            '<a href="springsprong.html"><img src="imgs/springsprong_t.png"><br><br>Spring Sprong</a>'+
        '</div>');
    $('.thumb3').html('<div class="thumb">'+
            '<a href="space.html"><img src="imgs/space_t.png"><br><br>Space</a>'+
        '</div>'+
        '<div class="thumb middle">'+
            '<a href="proto.html"><img src="imgs/proto_t.png"><br><br>prototypes</a>'+
        '</div>'+
        '<div class="thumb">'+
            '<a href="misc.html"><img src="imgs/basnake_t.png"><br><br>misc</a>'+
        '</div>');
    $('.thumb4').html('<div class="thumb">'+
        '</div>');

    $('.header1').html('<div class="thumb header" style="">'+
            '<a href="index.html">T&nbsp;&nbsp;I&nbsp;&nbsp;M&nbsp;&nbsp;&nbsp;&nbsp;S&nbsp;&nbsp;U&nbsp;&nbsp;N</a>'+
        '</div>'+
        '<div class="thumb middle small">'+
        '</div>'+
        '<div class="thumb headerlinks">'+
            '<a href="index.html">work</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="about.html">about</a>&nbsp;'+
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a href="https://github.com/madebyskippy/">'+
            '<img src="imgs/icon-git.png" style="width:15px; padding:0; margin:0"></a>'+
            '&nbsp;&nbsp; <a href="https://madebyskippy.itch.io"><img src="imgs/icon-itch.png" style="width:17px; padding:0; margin:0"></a>'+
        '</div>');
    
    $('.side_thumb').on('click',function(event){
        var justClicked=$(event.currentTarget);
        var clickedIndex=justClicked.attr('data'); //get index of just clicked
        console.log(clickedIndex);
        //change big image
        $('.content span#selected').attr('id','closed'); //close previous
        $('.content span.'+clickedIndex).attr('id','selected'); //open just clicked
        //update sidebar
        $('.side_thumb#selected').attr('id','closed');
        justClicked.attr('id','selected');
    });

    $("input[name='Password']").on("keydown",function search(e) {
        if(e.keyCode == 13) {
            if ($("input[name='Password']").val()=="skippy"){
                $(".protected").addClass("unlocked");
                $(".protected").removeClass("protected");
                $("input[name='Password']").val("");
            }else{
                console.log("hide?");
                $(".unlocked").addClass("protected");
                $(".unlocked").removeClass("unlocked");
            }
            $("input[name='Password']").val("");
        }
    }); 

    // $('div .thumb a').on('click',function(event){
    //     console.log($(event.currentTarget).data('href'));
    //     $('div .thumb img').animate({
    //         // 'height': '0px',
    //         'opacity': '0'
    //     },300,function(){
    //         window.location.href=$(event.currentTarget).data('href');
    //         //todo when done
    //     });
    // });

    // $('div .thumb img').css('opacity','0');
    // var height = $('div .thumb img').css('height');
    // // $('div .thumb img').css('height','0');
    // $('div .thumb img').animate({
    //         // 'height': height,
    //         'opacity': '1'
    //     },300,function(){
    //     });
    
//    if (parseInt($('.content').css('margin-left')) > 250){
//        $('.content').css('margin-left',250);
//        $('.left_sidebar').css('padding-left',26);
//    }
    
//    lastWindowSize=$(window).width();
});

// $(window).resize(function(){
//    if (parseInt($('.content').css('margin-left')) > 250){
//        $('.content').css('margin-left',250);
//        $('.left_sidebar').css('padding-left',26);
//    }
//    if ($(window).width() < lastWindowSize){
//        $('.content').css('margin-left',"24%");
//        $('.left_sidebar').css('padding-left',"2.5%");
//    }
//    lastWindowSize = $(window).width();
// });