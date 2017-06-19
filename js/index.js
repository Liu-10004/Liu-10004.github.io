var loadingRender=(function (){
    var ary = ["icon.png", "zf_course.png", "zf_course1.png", "zf_course2.png", "zf_course3.png", "zf_course4.png", "zf_course5.png", "zf_course6.png", "zf_cube1.png", "zf_cube2.png", "zf_cube3.png", "zf_cube4.png", "zf_cube5.png", "zf_cube6.png", "zf_cubeBg.jpg", "zf_cubeTip.png", "zf_messageChat.png", "zf_messageKeyboard.png", "zf_messageLogo.png", "zf_messageStudent.png", "zf_outline.png", "zf_phoneBg.jpg", "zf_phoneDetail.png", "zf_phoneListen.png", "zf_phoneLogo.png", "zf_return.png"];
    var curNum=0;
    var n=0
    var total=ary.length;
    var $loading=$('.loading');
    var $progress=$('.progress');
    var $progressSpan=$progress.find('span');
    return {
        init: function (){
            $.each(ary,function (index,item){
                var oImg=new Image;
                oImg.src='img/'+item;
                oImg.onload=function (){
                    oImg=null;
                    n=(++curNum)/total;
                    $progressSpan.css('width',n*100+'%')
                    if(curNum==total){
                        window.setTimeout(function (){
                            $loading.css('opacity',0).on('webkitTransitionEnd',function (){
                                $(this).remove();
                                phoneRender.init();
                            })
                        },500)
                    }
                }
            })
        }
    }
})()

/*PHONE*/
var phoneRender=(function (){
    var $header=$('.header')
    var $phone=$('.phone');
    var $time=$phone.find('.time');
    var $listen=$('.listen');
    var $listenTouch=$listen.find('.touch');
    var $detail=$phone.find('.detail');
    var $detailTouch=$detail.find('span');
    var phoneBell=$('#phoneBell')[0];
    var phoneSay=$('#phoneSay')[0];//把JQ对象转换为原生JS对象，因为AUDIO中很多属性和方法都是原生的，我们需要使用原生对象调取
    function listenTouchFn(){
        $header.css('animation',' null 0s linear 0s infinite both normal');
        $listen.remove();
        $detail.css('transform','translateY(0)');//换成原生JS的写法，$detail[0].style.webkitTransform='translateY(0)'
        phoneBell.pause();//原生
        $(phoneBell).remove();//转JQ
        phoneSay.play();
        phoneSay.oncanplay=bindTime; //oncanply：当音频可以播放 了的事件

    }
    function bindTime(){
        $time.css('display','block');
        var duration=phoneSay.duration;
        var timer=window.setInterval(function (){
            var curTime=phoneSay.currentTime;
            var minute=Math.floor(curTime/60);
            var second=Math.floor(curTime-minute*60);
            minute=minute<10?'0'+minute:minute;
            second=second<10?'0'+second:second;
            $time.html(minute+':'+second);
            if(curTime>=duration){
                closePhone();
                window.clearInterval(timer);
            }
        },1000)
    }
    function closePhone(){
        phoneSay.pause();
        $(phoneSay).remove();
        $header.css('display','none')
        $phone.css('transform','translateY('+document.documentElement.clientHeight+'px)').on('webkitTransitionEnd',function (){
            $(this).remove();//phone消失
            messageRender.init();
            })
    }
   return {
        init: function () {
            $phone.css('display','block');
            phoneBell.play();
            $listenTouch.tap(listenTouchFn);
            $detailTouch.tap(closePhone);
        }
    }
})();
var messageRender=(function (){
    var $message=$('.message');
    var $messageItem=$message.find('.list');
    var $messageList=$messageItem.find('li');
    var $messageKeyBoard=$message.find('.keyBoard');
    var $messageText=$messageKeyBoard.find('.text');
    var $messageSubmit=$messageKeyBoard.find('.submit');
    var messageMusic=$('#messageMusic')[0];

    var step=-1,
        autoTimer=null,
        isTrigger=false,
        historyH=0;

    //->消息列表的运动

    function autoMessage(){
        tempFn();
        autoTimer=window.setInterval(tempFn,1500);
    }
    function tempFn(){
        var $cur=$messageList.eq(++step);
        $cur.css({
            opacity:1,
            transform:'translateY(0)'
        })

        if(step==2){
            $cur.on('webkitTransitionEnd',function (){
            if(isTrigger){return}
            isTrigger=true;
            $messageKeyBoard
                .css('transform','translateY(0)')
                .on('webkitTransitionEnd',textPrint);
            });
            window.clearInterval(autoTimer);
            return;
        }
        if(step>=3){
            historyH+=-$cur.height();
            $messageItem.css('transform','translateY('+historyH+'px)');
        }
        if(step==$messageList.length-1){
            messageMusic.pause();
            $(messageMusic).remove();
            window.clearInterval(autoTimer);
            window.setTimeout(function (){
                $message.remove();
                cubeRender.init();
            },1500)
        }
    }
    function textPrint(){
        var text='问你点css吧';
        var n=-1;
        var textTimer=null;
        textTimer=window.setInterval(function (){
            $messageText.html($messageText.html()+text[++n]);
            if(n>=text.length-1){
                window.clearInterval(textTimer);
                $messageText.html(text);

                //开启提交按钮
                $messageSubmit
                    .css('display','block')
                    .tap(bindSubmit);
            }
        },200)
    }
    function bindSubmit(){
        $messageText.html('');
        $messageKeyBoard
            .off('webkitTransitionEnd',textPrint)
            .css('transform','translateY(3.7rem)');
        autoMessage();
    }
    return{
        init: function (){
            $message.css('display','block');
            messageMusic.play();
            autoMessage();
        }
    }
})()

/*--cube--*/
/*在移动端实现滑动，我们需要阻止IMG和DOCUMENT的默认行为，IMG默认行为是滑动的时候会拖拽图片产生的虚拟图，不是操作当前的元素；在移动端DOCUMENT的默认行为是浏览器页卡的切换，需要阻止这件事情*/
$(document).add($('img')).on('touchmove',function (e){
    e.preventDefault();
})
var cubeRender=(function (){
    var $cube=$('.cube');
    var $cubeBox=$cube.find('.cubeBox');
    var $cubeList=$cube.find('li');
    function startFn(e){
        var point=e.changedTouches[0];
        $(this).attr({
            strX:point.pageX,
            strY:point.pageY,
            changeX:0,
            changeY:0,
            isMove:false
        })//这里注意使用JQ或者ZP存储的自定义属性值都是字符串，即使你写的不是，它也会当做字符串去存储，以后通过ATTR方法获取的结果是字符串
    }
    function moveFn(e){
        var point=e.changedTouches[0];
        var changeX=point.pageX-parseFloat($(this).attr('strX'));
        var changeY=point.pageY-parseFloat($(this).attr('strY'));
        console.log(changeX,changeY)
        $(this).attr({
            changeX:changeX,
            changeY,
            isMove:(Math.abs(changeX)>10||Math.abs(changeY)>10)
        });
    }
    function endFn(e){
        var isMove=$(this).attr('isMove');
        if(isMove==='false'){
            return
        }
        var changeX=parseFloat($(this).attr('changeX'));
        var changeY=parseFloat($(this).attr('changeY'));
        var rotateX=parseFloat($(this).attr('rotateX'));
        var rotateY=parseFloat($(this).attr('rotateY'));
           rotateX=rotateX-changeY/3;
           rotateY=rotateY+changeX/3;
           console.log(rotateX,rotateY)
        $(this).css('transform','scale(0.6) rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)').attr(
            {
                rotateX,
                rotateY,
                strX:null,
                strY:null,
                changeX:null,
                changeY:null,
                isMove:false
            }
        )
    }
    return {
        init: function (){
            $cube.css('display','block');
            $cubeBox.attr({
                rotateX:35,
                rotateY:35
            }).on('touchstart',startFn)
                .on('touchmove',moveFn)
                .on('touchend',endFn);

            $cubeList.tap(function (){
                $cube.css('display','none');
                swiperRender.init($(this).index());
            })
        }
    }
})()

/*--swiper--*/
var swiperRender=(function (){
    var $swiperContainer=$('.swiper-container');
    var $return=$swiperContainer.find('.return');
    var $swiperExample=null;
    var $course=$('.course');
    function moveFn(example){
        //example ：回调函数中传递的参数值，代表当前swiper的实例
        var slideAry=example.slides;
        var index=example.activeIndex;
        /*基于makisu插件实现3D折叠效果*/
        if(index==0){
            $course.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0.8
            })
            $course.makisu('open');
        }else {
            $course.makisu({
                selector:'dd',
                overlap:0.6,
                speed:0
            });
            $course.makisu('close');
        }

        $.each(slideAry,function (n,item){
            item.id=index===n?'page'+(index+1):null;
        })
    }
    return {
        init: function (index){
            index=index||0;
            $swiperContainer.css('display','block');

            $swiperExample=new Swiper('.swiper-container',{
                effect:'coverflow',
                onInit:moveFn,
                onSlideChangeEnd:moveFn//当每一个slide切换结束的时候
            });
            $swiperExample.slideTo(index,0);//直接滚动到具体的某一个切换卡区域，第一个参数是索引，第二个参数是运动时间，写0是立即切换到这个区域

            $return.tap(function (){
                $swiperContainer.css('display','none');
                $('.cube').css('display','block');
            })
        }
    }
})()
loadingRender.init();

