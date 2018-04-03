$(function () {
    //自定义常量 作为全局使用
    const config = {
        appid: 'wx340146d907668175',
        host: 'https://biaoqing1.zmwxxcx.com',
        commonHost: 'https://common.zmwxxcx.com',
        searchUrl:'https://pic.sogou.com/pics/json.jsp?'
    }
    const url = {
        common: {
            submitAdvid: `${config.commonHost}/xcx/saveadvid`,
        },
        yewu: {
            hotwords: `${config.host}/emoji/hotwords`,
            search: `${config.host}/emoji/search`,
            hotimg: `${config.commonHost}/report/img-top`
        }
    }
    let hotWords;
    //自调用函数 加载页面数据
    !function(url){
        //请求热词
        getHotwords(url);
        // 请求热门表情
        getHotimg(url)
    }(url);
    //获取数据
    function getHotwords(url) {
        $.ajax({
            type: "GET",
            url: url.yewu.hotwords,
            dataType: "jsonp",
            success:(res)=>{
                console.log(res);
                hotWords = res.d.Results;
                let  hotSearch = getRand(hotWords);
                hotSearch.forEach((item)=>{
                    if(item.IsHot == "0"){
                        $(`<div class="word-item"><div class="normal-word">${item.Name}</div></div>`).appendTo($(".hot-area"));
                    }else {
                        $(`<div class="word-item"><div class="hot-word">${item.Name}</div><img src="./imgs/fonthot.png" alt=""></div>`).appendTo($(".hot-area"));
                    }
                })
            }
        })
    }
    function getHotimg(url) {
        $.ajax({
            type: "GET",
            url: url.yewu.hotimg,
            dataType: "jsonp",
            data: {
                appKey: config.appid,
            },
            success:(res)=>{
                let hotimgs = res.d;
                hotimgs.forEach((item)=>{
                    $(`<div class="face-item"><img src="${item.actionname}" alt=""></div>`).appendTo($(".face-area"));
                })
            }
        })
    }
    //数据处理方法
    // 获取八个随机热词 加入跳转词语
    function  getRand (fonts){
        let newFonts = [];
        // let obj = {Name:"更多神器",IsHot:"3"};
        let fixNum;
        for (let i = 0; i < fonts.length;i ++){
            if (fonts[i].IsFix == "1"){
                fixNum = i;
                console.log(fonts[i])
                newFonts.push(fonts[i])
            }
        }
        while (newFonts.length < 9){
            let randNum = Math.floor(Math.random()*fonts.length);
            if (newFonts.indexOf(fonts[randNum]) == "-1" && randNum != fixNum){
                newFonts.push(fonts[randNum])
            }
        }
        // newFonts.splice(2, 0, obj);
        return newFonts;
    }
    //获取搜索到的表情
    let start = 0;
    let searchFonts = "";
    function getImgs(fonts) {
        if(fonts == "") return;
        console.log("search");
            let searchUrl = config.searchUrl + "query=" + fonts + "表情&st=5&start=" + start + "&xml_len=60&reqFrom=wap_result&";
            $.ajax({
                type: "GET",
                url: searchUrl,
                dataType: "jsonp",
                success:(res)=>{
                    console.log(res);
                    // 获取数据
                    if(res.items.length > 0) {
                        let imgData = res.items.map(function (item) {
                            return item.picUrl;
                        });
                        let totalNum = res.totalNum;
                        let imgs = [];
                        imgData = imgData.map(function (item) {
                            if (item.indexOf("sogoucdn.com") == "-1") {
                                item = config.host + "/emoji/image?imgUrl=" + item;
                            } else {
                                item = item;
                            }
                            return item;
                        })
                        // console.log(imgData);
                        imgs = imgData;
                        // 插入到页面
                        imgs.forEach((item) => {
                            $(`<div class="emoji-item"><img src="${item}" alt=""></div>`).appendTo($(".emoji-area"));
                        })
                        start+=60;
                    }
                }
            })

    }

    //页面dom事件处理
    //点击搜索
    $(".search-btn").on("click",(e)=>{
        console.log($(":input")[0].value);
        searchFonts = $(":input")[0].value;
        if(searchFonts != ""){
            $(".search-input").css({"display":"none"});
            $(".change-search").css({"display":"flex"});
            $(".hot-body").css({"display":"none"});
            $(".hot-face").css({"display":"none"});
            $(".emoji-body").css({"display":"block"});
            $(":input")[0].value = searchFonts;
            $(":input")[1].value = searchFonts;
            $(".emoji-area").empty();
            start = 0;
            getImgs(searchFonts);
        }
    })
    $(".has-search").on("click",(e)=>{
        // console.log($(":input")[0].value);
        searchFonts = $(":input")[1].value;
        if(searchFonts != ""){
            $(".search-input").css({"display":"none"});
            $(".change-search").css({"display":"flex"});
            $(".hot-body").css({"display":"none"});
            $(".hot-face").css({"display":"none"});
            $(".emoji-body").css({"display":"block"});
            $(":input")[0].value = searchFonts;
            $(":input")[1].value = searchFonts;
            $(".emoji-area").empty();
            start = 0;
            getImgs(searchFonts);
        }
    })
    //监测输入框为空
    $("body").on("change","#has-input",(e)=>{
        console.log(e);
    })
    //预览图片
    let teachImg;
    $("body").on("click",".face-item",(e)=>{
        teachImg = $(e.target)[0].currentSrc
        let teachFlag = window.sessionStorage.getItem("teach");
        if(teachFlag){
            // console.log(teachFlag)
            wx.previewImage({
                current: teachImg, // 当前显示图片的http链接
                urls: [teachImg],// 需要预览的图片http链接列表
                success:res=>{
                    console.log(res);
                },
                fail:res=>{
                    console.log(res);
                }
            })
            let page = searchFonts;
            let action = hex_md5(teachImg);
            let actionName = teachImg;
            $.ajax({
                type: "GET",
                url: url.common.submitAdvid,
                dataType: "jsonp",
                data:{
                    page: page,
                    action: action,
                    actionName: actionName,
                },
                headers: {
                    'cookie':`AppKey=${config.appid}`,
                },
                success:(res)=>{
                    console.log(res);
                }
            })
        }else {
            window.sessionStorage.setItem("teach","teach");
            $(".teach-body").css({"display":"block"});
            $(".teach-body").children("img").attr("src",teachImg);
        }
    })
    $("body").on("click",".emoji-item",(e)=>{
        teachImg = $(e.target)[0].currentSrc
        let teachFlag = window.sessionStorage.getItem("teach");
        if(teachFlag){
            // console.log(teachFlag)
            wx.previewImage({
                current: teachImg, // 当前显示图片的http链接
                urls: [teachImg] ,// 需要预览的图片http链接列表
                success:res=>{
                    console.log(res);
                },
                fail:res=>{
                    console.log(res);
                }
            })
            let page = searchFonts;
            let action = hex_md5(teachImg);
            let actionName = teachImg;
            $.ajax({
                type: "GET",
                url: url.common.submitAdvid,
                dataType: "jsonp",
                data:{
                    page: page,
                    action: action,
                    actionName: actionName,
                },
                headers: {
                    'cookie':`AppKey=${config.appid}`,
                },
                success:(res)=>{
                    console.log(res);
                }
            })
        }else {
            window.sessionStorage.setItem("teach","teach");
            $(".teach-body").css({"display":"block"});
            $(".teach-body").children("img").attr("src",teachImg);
        }
    })
    //点击热词
    $("body").on("click",".word-item",(e)=>{
        searchFonts = $(e.target)[0].innerText;
        $(".search-input").css({"display":"none"});
        $(".change-search").css({"display":"flex"});
        $(".hot-body").css({"display":"none"});
        $(".hot-face").css({"display":"none"});
        $(".emoji-body").css({"display":"block"});
        $(":input")[0].value = searchFonts;
        $(":input")[1].value = searchFonts;
        $(".emoji-area").empty();
        start = 0;
        getImgs(searchFonts);
    });
    //点击回退
    $(".back-btn").on("click",(e)=>{
        $(".search-input").css({"display":"block"});
        $(".change-search").css({"display":"none"});
        $(".hot-body").css({"display":"block"});
        $(".hot-face").css({"display":"block"});
        $(".emoji-body").css({"display":"none"});
        $(":input")[0].value = "";
        $(":input")[1].value = "";
    })
    //换一换
    $(".hottop-right").on("click",(e)=>{
        let  hotSearch = getRand(hotWords);
        $(".hot-area").empty();
        hotSearch.forEach((item)=>{
            if(item.IsHot == "0"){
                $(`<div class="word-item"><div class="normal-word">${item.Name}</div></div>`).appendTo($(".hot-area"));
            }else {
                $(`<div class="word-item"><div class="hot-word">${item.Name}</div><img src="./imgs/fonthot.png" alt=""></div>`).appendTo($(".hot-area"));
            }
        })
    })
    //教程页面 知道了
     $(".has-know").on("click",(e)=>{
         $(".teach-body").css({"display":"none"});
         wx.previewImage({
             current: teachImg, // 当前显示图片的http链接
             urls: [teachImg],// 需要预览的图片http链接列表
             success:res=>{
                console.log(res);
             },
             fail:res=>{
                 console.log(res);
             }
         })
         let page = searchFonts;
         let action = hex_md5(teachImg);
         let actionName = teachImg;
         // console.log(actionName)
         $.ajax({
             type: "GET",
             url: url.common.submitAdvid,
             dataType: "jsonp",
             data:{
                 page: page,
                 action: action,
                 actionName: actionName,
             },
             headers: {
                 'cookie':`AppKey=${config.appid}`,
             },
             success:(res)=>{
                 console.log(res);
             }
         })
     })
    // 页面滚动至底部 加载
    $(window).scroll(()=>{
        //页面高度
        let pageH =$(this).innerHeight();
        //滚动高度
        let scrollTop = $(this).scrollTop();
        //可视内容高度
        let viewH = $(window).height();
        if(viewH + scrollTop >= pageH){
            getImgs(searchFonts);
        }
    });
})