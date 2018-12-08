'use strict'
const apiBase = "https://api.hs.rtxux.xyz";
//@还未全部使用此全局变量
let userInfo = {
    uid: 0,
    nickname: ''
}
let settings = {
    //新消息弹窗消失延迟时长(ms)
    chatAlertDismiss: 10000
};
let chatFirstSnarlId;

//惰性求值
let AuthorizationText = () => {
    if (location.host == "127.0.0.1:5500") {
        //LiveServer调试 @test13
        // return ' ';
        return "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzIiwiaWF0IjoxNTQ0MTk2Mjg1LCJleHAiOjE1NDQ4MDEwODV9.a0CbTvvhrxCHVGZtK9sixcSHhG8bn4nc9oXpawq67nFWcriwmcqOcPZ64nRjfOGR1E9BGQILWEq7ZHwbpwDDvA";
    }
    return getCookie("tokenType") + " " + getCookie("accessToken");
};

//自动加载主页及通知
window.onload = () => {
    $('#share-column-all').click();

    chatFirstSnarlId = Snarl.addNotification({
        title: '正在建立聊天连接...',
        timeout: 10000,
        icon: '<i class="fa fa-refresh fa-spin"></i>'
    });
}

$(function () {
    /**
     * 跳转及网址传参
     */
    if (isMobile ()) {
        $('#body-cover').show().css('opacity', 0.7);
        alert('移动端请使用app，即将跳转下载页面');
        location.href = "https://copy.im/a/xjfx34";
    }
    const searchWords = GetQueryVariable ("s");
    if (searchWords) {
        $('#searchBox').val('ID:' + searchWords);
        $('#mainSearchBtn').click();
    }

    /**
     * Sidebar控制
     */
    //点击用户名
    $('#share-user-info__name').click(function () {
        ShowLoginSidebar();
    });

    // 点击设置
    $('#button-setting').click(function () {
        swal('设置', '新消息提醒自动关闭时间', {
            content: {
                element: "input",
                attributes: {
                  placeholder: settings.chatAlertDismiss / 1000,
                  type: "text",
                },
            },
        }).then((value) => {
            if (value) settings.chatAlertDismiss = parseInt(value) * 1000;
        });
    })
    
    // 尝试Cookie中token登录
    if (AuthorizationText () != " ") {
        $.ajax({
            type: 'GET',
            url: apiBase + '/user/profile',
            contentType: 'application/json',
            dataType: 'json',
            headers: {
                Authorization: AuthorizationText ()
            },
            success: function (res) {
                userInfo.uid = res.user_id;
                $('#share-user-info__name').text(res.nickName)
                    .unbind('click')
                    .click(function () {
                        $('.l-sidebar--info').fadeIn(500);
                        $('.l-sidebar--nor').css('filter', 'blur(3px)');
                        LoadUserInfoEdit ();
                    });
                CheckCertification ();
            },
            error: function (xhr) {
                setCookie("accessToken", "");
                setCookie("tokenType", "");
            }
        });
    }

    // 用户选择类型栏
    $('.share-column-list__item').click(function () {
        $('.share-column-list__item').removeClass('share-column-list__item--act');
        $(this).addClass('share-column-list__item--act');
    })
    $('#share-column-all').click(function () {
        $('.l-content>div').hide();
        $('.l-main').show();
        LoadMain ();
    })
    $('#share-column-my-lend').click(function () {
        $('.l-content>div').hide();
        $('.l-my-lend').show();
        $('#my-lend-type__all').click();
        LoadMyLend ();
    })
    $('#share-column-my-borrow').click(function () {
        $('.l-content>div').hide();
        $('.l-my-borrow').show();
        $('#my-borrow-type__all').click();
        LoadMyBorrow ();
    })
    $('#share-column-audit-inform').click(function () {
        $('.l-content>div').hide();
        $('.l-audit-inform').show();
        LoadAudit ();
        LoadInform ();
    });

    //点击聊天按钮
    const chatHTML = `
        <div class="chat-container">
            <div class="chat-contacts"></div>
            <div class="chat-main">
                <div class="chat-main-title">
                    <p class="chatter-name"></p>
                </div>
                <div class="chat-history">
                    <!-- TODO:<div class="history-tips"></div> -->
                </div>
                <div class="chat-message">
                    <textarea id="chatMessage" spellcheck="false" maxlength="165"></textarea>
                    <button class="chat-msg-btn" id="chatSend">发送</button>
                </div>
            </div>
            <div class="chat-assist">
                <div class="chat-detail">
                    <div class="chat-assist__title">出借人信息</div>
                    <div class="chat-detail__cont"></div>
                </div>
                <div class="chat-renter-goods">
                    <div class="chat-assist__title">出借人物品</div>
                    <div class="chat-renter-goods__cont"></div>
                </div>
            </div>
        </div>`
    $('.button-chat').click(function () {
        if (AuthorizationText () == ' ') {
            PromptLogin ();
            return;
        }
        $(this).addClass('animated bounceOutRight').on('animationend', function () {
            $(this).hide().removeClass('animated bounceOutRight');
        });
        layer.open({
            type: 1,
            skin: 'layui-layer-rim',
            area: ['80%', '90%'],
            title: '聊天',
            resize: false,
            shadeClose: true,
            zIndex: 5,
            content: chatHTML,
            success: ChatInit,
            end: function () {
                $('.button-chat').show().addClass('animated bounceInRight').on('animationend', function () {
                    $(this).removeClass('animated bounceInRight').show();
                });
            }
          });
    });


    /**
     * Content-main
     */
    //head相关
    $('#searchBox').keypress(function (e) {
        if (e.keyCode == "13") 
            $('#mainSearchBtn').click();
    })
    //搜索按钮
    $('#mainSearchBtn').click(function () {
        const words = $('#searchBox').val();
        if (words == "") {
            $('#searchBox').focus();
            return;
        }
        else if (words.substring(0,3) == 'ID:') {
            const id = words.substring(3);
            $.ajax({
                type: 'GET',
                url: apiBase + '/item/' + id,
                headers: {
                    Authorization: AuthorizationText ()
                },
                dataType: 'json',
                success: function (res) {
                    FillMain(res);
                },
                error: function (xhr) {
                    if (xhr.status == 404) {
                        $('.goods-list').text('未找到该id对应物品！');
                    }
                    else {
                        swal('物品id搜索失败', xhr.status + '错误', 'error');
                    }
                }
            });
        }
        else {
            $.ajax({
                type: 'GET',
                url: apiBase + '/item?search=' + words,
                dataType: 'json',
                success: function (res) {
                    if (res.length == 0) {
                        $('.goods-list').text('未找到相关物品！');
                    }
                    else {
                        FillMain(res);
                    }
                },
                error: function (xhr) {
                    swal('搜索失败', xhr.status + '错误', 'error');
                }
            });
        }
    })
    //二维码 APP下载
    $('.main-head-qrcode').mouseover(function () {
        $('.main-head-qrcode__pic').stop(true);
        $('.main-head-qrcode__pic').slideDown('fast');
    }).mouseout(function () {
        $('.main-head-qrcode__pic').stop(true);
        $('.main-head-qrcode__pic').slideUp('fast');
    }).click(function () {
        // window.open("https://xilym.tk/storage/apk/happySharing.apk");
        window.open("https://copy.im/a/xjfx34");
    });
    //用户收藏
    $('.main-head-favorite-text, .favorite-container').mouseover(function () {
        $('.favorite-container').show();
    }).mouseout(function () {
        $('.favorite-container').hide();
    });
    $('.favorite-container').text('物品');
    //排序
    $('#sortByDist').click(() => {
        swal({
            text: '请在Android版乐享上使用该功能',
            button: false,
            className: 'red-bg',
            timer: 2500
        });
    })


    /**
     * Content-my-lend
     */
    //类别控制
    $('.my-type__item').click(function () {
        $('.my-type--act').removeClass('my-type--act');
        $(this).addClass('my-type--act');
        $('.my-lend__item').show();
        $('.my-borrow__item').show();
    });
    $('#my-lend-type__waiting').click(function () {
        $('.my-lend__item:not(.my-lend__item--waiting)').hide();
    });
    $('#my-lend-type__lending').click(function () {
        $('.my-lend__item:not(.my-lend__item--lending)').hide();
    });
    $('#my-lend-type__finished').click(function () {
        $('.my-lend__item:not(.my-lend__item--finished)').hide();
    });

    /**
     * Content my-borrow
     */
    //类别控制
    $('#my-borrow-type__auditing').click(function () {
        $('.my-borrow__item:not(.my-borrow__item--auditing)').hide();
    });
    $('#my-borrow-type__borrowed').click(function () {
        $('.my-borrow__item:not(.my-borrow__item--borrowed)').hide();
    });
    $('#my-borrow-type__returned').click(function () {
        $('.my-borrow__item:not(.my-borrow__item--returned)').hide();
    });
})



function LoadUserInfoEdit ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/user/profile',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            $('#account-info-id__txt').text(res.user_id);
            $('#account-info-nickname__txt').val(res.nickName);
            $('#account-info-phone__txt').val(res.phone);
            $('#account-info-description__txt').val(res.description);
            if (res.gender == "male") {
                $('#account-info-gender__male').attr('checked', true);
            }
            else {
                $('#account-info-gender__female').attr('checked', true);
            }
        },
        error: function (xhr) {
            swal('加载当前用户信息失败', xhr.status + '错误', 'error');
        }
    });
    $('#account-info-btn__cancel').click(function () {
        $('.l-sidebar--nor').css('filter', '');
        $('.l-sidebar--info').fadeOut(500);
    });
    $('#account-info-btn__update').click(function () {
        $('#account-info-btn__update').text('更新中..');
        $.ajax({
            type: 'POST',
            url: apiBase + '/user/profile',
            headers: {
                Authorization: AuthorizationText ()
            },
            contentType: 'application/json',
            data:`{
                "nickName": "${$('#account-info-nickname__txt').val()}",
                "gender": "${$('#account-info-gender__male')[0].checked ? 'male' : 'female'}",
                "description": "${$('#account-info-description__txt').val()}",
                "phone": "${$('#account-info-phone__txt').val()}"
            }`,
            success: function (res) {
                if (res.code == 0) {
                    swal('信息更新成功', '', 'success', {
                        timer: 1500
                    });
                    $('#account-info-btn__update').text('更新');
                }
                else {
                    swal('信息更新失败', '错误代码:' + res.code, 'error').then(() => {
                        $('#account-info-btn__update').text('更新');
                    });
                }
            },
            error: function (xhr) {
                swal('信息更新失败', xhr.status + '错误', 'error').then(() => {
                    $('#account-info-btn__update').text('更新');
                });
            }
        });
    });
}

function ShowItemMap (lon, lat, idx)
{
    if ($('#goods-map').length) {
        $('.goods-position-map').empty();
        $('.goods-position-map').hide();
    }
    $('.goods-position-map').eq(idx).append('<div id="goods-map"></div>');
    $('.goods-position-map').eq(idx).show();
    var mapObj = new AMap.Map('goods-map', {
        zoom:16,
        center:[lon, lat]
    });
    //地图坐标标记
    var marker = new AMap.Marker({
        position:[lon, lat]
    })
    mapObj.add(marker);
    //地图控制条
    mapObj.plugin(["AMap.ToolBar"],function(){
        var tool = new AMap.ToolBar({
            liteStyle: true,
            locate: true,
        });
        mapObj.addControl(tool);    
    });
    mapObj.on('complete', function () {
        console.log('goods-' + idx + '地图加载完成');
        $('#goods-map').animate({bottom: '0'}, 300, function () {
            $('.goods-position-map').eq(idx).prepend('<span class="map-close">×</span>');
            $('.map-close').click(function () {
                $('#goods-map').animate({bottom: '100%'}, 300, function () {
                    mapObj.destroy();
                    $('.goods-position-map').empty();
                    $('.goods-position-map').hide();
                    console.log('goods-' + idx + '地图已关闭');
                });
            });
        });
    });
}


function FillMain (data)
{
    $('.goods-list').empty();
    const itemHTML = 
    `<div class="goods-item__hd">
        <span class="goods-owner">物主:
            <span class="goods-owner__name"></span>
        </span>
        <span class="goods-id">物品ID:
            <span class="goods-id__txt"></span>
        </span>
        <span class="goods-date">发布时间:
            <span class="goods-date__txt"></span>
        </span>
    </div>
    <i class="goods-like fa fa-heart" style="position:absolute" title="收藏"></i>
    <div class="goods-item__bd">
        <div class="goods-item__pic">
            <img src="./images/no-picture.jpg" alt="物品图片" class="goods-img">
            <div class="goods-img-intro"></div>
        </div>
        <div class="goods-item__info">
            <div class="goods-name goods-info">
                <span class="goods-property">物品名称</span>
                <span class="goods-name__txt"></span>
            </div>
            <div class="goods-price goods-info">
                <span class="goods-property">租用价格</span>
                <em class="share-rmb">¥</em>
                <span class="goods-price__txt"></span>
            </div>
            <div class="goods-time goods-info">
                <span class="goods-property">租用时长</span>
                <span class="goods-time__txt"></span>
            </div>
            <div class="goods-position goods-info">
                <span class="goods-property">租还地址</span>
                <a class="goods-position__txt position-txt" title="点击查看地图"></a>
            </div>
        </div>
        <div class="goods-item__enter">
            <button class="goods-enter" title="租用">✚</button>
        </div>
        <div class="position-map goods-position-map"></div>
    </div>`;
    //TODO:better parse single object
    let name, price, desc, positionText, time, imgId, uid, owner, id, lon , lat;
    for (let i = 0; i < (data.length ? data.length : 1); ++i) {
        if (data.length == undefined) {
            //传入的是单个item的对象
            id = data.id;
            name = data.name;
            price = data.price;
            desc = data.description;
            positionText = data.location.locationDescription;
            time = data.duration;
            imgId = data.images;
            uid = data.owner_id;
            //搜索时没有owner_id
            if (uid) owner = GetUserInfo(uid).nickName;
            lon = data.location.longitude;
            lat = data.location.latitude;
        }
        else {
            id = data[i].id;
            name = data[i].name;
            price = data[i].price;
            desc = data[i].description;
            positionText = data[i].location.locationDescription;
            time = data[i].duration;
            imgId = data[i].images;
            uid = data[i].owner_id;
            //搜索时没有owner_id
            if (uid) owner = GetUserInfo(uid).nickName;
            lon = data[i].location.longitude;
            lat = data[i].location.latitude;
        }
        let newIdx = $('.goods-list__item').length;
        $('.goods-list').append('<div class="goods-list__item" data-index="' + newIdx + '"></div>');
        let $newItem = $('.goods-list__item').last();
        $newItem.append(itemHTML);
        $newItem.attr('data-lon', lon);
        $newItem.attr('data-lat', lat);
        $newItem.attr('data-id', id);
        $newItem.attr('data-uid', uid);
        $newItem.find('.goods-owner__name').text(owner);
        $newItem.find('.goods-id__txt').text(id);
        $newItem.find('.goods-date__txt').text('17-12-22');
        if (imgId.length) {
            $newItem.find('.goods-img').attr('src', apiBase + '/image/' + imgId[0]);
        }
        $newItem.find('.goods-img-intro').text(desc);
        $newItem.find('.goods-name__txt').text(name);
        $newItem.find('.goods-price__txt').text(price);
        $newItem.find('.goods-time__txt').text(time / 86400 + '天');
        $newItem.find('.goods-position__txt').text(positionText);
        //@temp
        if (data.length == undefined) {
            break;
        }
    }
    //加载完成后，点击地址
    $('.goods-position__txt').click(function () {
        let idx = this.parentNode.parentNode.parentNode.parentNode.dataset.index;
        let lon = this.parentNode.parentNode.parentNode.parentNode.dataset.lon;
        let lat = this.parentNode.parentNode.parentNode.parentNode.dataset.lat;
        ShowItemMap(lon, lat, idx);
    });
    //点击图片放大
    $('.goods-img').click(function () {
        $('#body-cover').fadeIn(300);
        $('#body-cover').one('click', function () {
            $('#body-cover').fadeOut(300).empty();
        });
        const $newImgContainer = $('<div class="full-screen-container"></div>')
        const $newImg = $('<img>');
        $newImg.attr('src', this.src);
        $newImgContainer.append($newImg);
        $('#body-cover').append($newImgContainer);
    });
    //点击收藏
    $('.goods-like').click(function () {
        ToggleLike (this);
    })
    //点击租用按钮
    $('.goods-enter').click(function () {
        const itemHTML = `
        <div id="itemAlert">
            <div class="popup-shade">加载中……</div>
            <div class="popup-item__l">
                <div class="pop-item-image">
                    <img src="" alt="" id="popupItemImg">
                </div>
                <ul class="pop-item-image-thumb"></ul>
            </div>
            <div class="popup-item__r">
                <div class="popup-item-panel__top">
                    <span id="panelName"></span>
                    <p id="panelDescription"></p>
                    <div class="panel-btns">
                        <button id="panelChat">交流</button>
                        <button id="panelApply">租借</button>
                    </div>
                </div>
                <hr>
                <ul class="popup-item-panel__bd">
                    <div class="panel-main__l">
                        <li class="panel-row">
                            <span class="panel-attr">价格</span>
                            <span id="panelPrice" class="share-rmb"></span>
                        </li>
                        <li class="panel-row">
                            <span class="panel-attr">租期</span>
                            <span id="panelDuration"></span>
                        </li>
                        <li class="panel-row">
                            <span class="panel-attr">出借人</span>
                            <span id="panelOwner"></span>
                        </li>
                        <li class="panel-row">
                            <span class="panel-attr">租还详细地址</span>
                            <span id="panelLocation"></span>
                        </li>
                    </div>
                    <div class="panel-main__r">
                        <span style="position:absolute;margin: 10px 0 0 20px;">地图位置</span>
                        <div id="panel-map-container"></div>
                    </div>
                </ul>
                <div class="popup-item-panel__ft">
                    <div class="remark-title">评论留言</div>
                    <div class="remark-add">
                        <input type="text" id="panelAddRemark" placeholder="在此处留下评论...">
                        <input type="button" id="panelSendRemark" value="发送">
                    </div>
                </div>
            </div>
        </div>`
        const id = this.parentNode.parentNode.parentNode.dataset.id;
        const uid = this.parentNode.parentNode.parentNode.dataset.uid;
        layer.open({
            type: 1,
            skin: 'layui-layer-rim',
            area: ['70%', '90%'],
            title: '物品详情',
            resize: false,
            shadeClose: true,
            zIndex: 1,
            content: itemHTML,
            success: () => {
                ItemAlertInit(id, uid);
            }
        })
    });
    //加载后动画
    $('.goods-list__item').addClass('animated zoomIn')
    .on('animationend', function () {
        $(this).removeClass('animated zoomIn');
    });
    //加载收藏状态
    if (AuthorizationText () != ' ') {
        $.ajax({
            type: 'GET',
            url: apiBase + '/user/favorite/',
            headers: {
                Authorization: AuthorizationText ()
            },
            success: function (res) {
                for (let i in res) {
                    $('.goods-list__item[data-id=' + res[i].id + ']').find('.goods-like')
                        .addClass('goods-like--marked');
                }
            },
            error: function (xhr) {
                swal('读取收藏列表失败', xhr.status + '错误', 'error');
            }
        });
    }
}

function LoadMain ()
{
    const RANDOM_NUM = 10;
    $.ajax({
        type: 'GET',
        url: apiBase + '/item?random=' + RANDOM_NUM,
        dataType: 'json',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            FillMain (res);
        },
        error: function (xhr) {
            swal('加载主页失败', xhr.status + '错误', 'error');
        }
    });
}

function LaunchBorrow (id)
{
    $.ajax({
        type: 'POST',
        url: apiBase + '/item/' + id +  '/borrow',
        dataType: 'json',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            if (res.code == 0) {
                swal('申请成功', '请等待物主审核', 'success');
            }
            else {
                swal('申请不成功', '错误代码:' + res.code, 'error');
            }
        },
        error: function (xhr) {
            if (xhr.status == 400) {
                swal('发起申请失败', '这是你自己的东西，或是已被锁定哦', 'warning');
            }
            else {
                swal('发起申请失败', xhr.status + '错误', 'error');
            }
        }
    });
}

function FillMyLend (data)
{
    $('.my-lend-list').empty();
    const itemHTML = 
    `<div class="my-status-color"></div>
    <div class="my-item__pic">
        <img src="./images/no-picture.jpg" alt="物品图片" class="my-item-img">
    </div>
    <div class="my-item__info-1">
        <div class="my-lend-item-name">
            <span class="my-property">物品名称</span>
            <span class="my-lend-item-name__txt"></span>
        </div>
        <div class="my-lend-item-duration">
            <span class="my-property">租借时长</span>
            <span class="my-lend-item-duration__txt"></span>
        </div>
        <div class="my-lend-item-price">
            <span class="my-property">租借价格</span>
            <span class="my-lend-item-price__txt"></span>
        </div>
    </div>
    <div class="my-item__info-2">
        <div class="my-lend-item-publish-id">
                <span class="my-property">物品ID</span>
                <span class="my-lend-item-publish-id__txt"></span>
        </div>
        <div class="my-lend-item-publish-time">
                <span class="my-property">发布时间</span>
                <span class="my-lend-item-publish-time__txt">2018/8/8 08:09</span>
        </div>
    </div>
    <div class="my-lend-item__description">
        <span class="my-property">物品描述</span>
        <p class="my-lend-item-description__txt"></p>
    </div>
    <div class="my-item__op">
        <span class="my-item-status__txt" title="当前状态">发布中</span>
        <button class="my-item-btn my-lend-btn__edit">编辑</button>
        <button class="my-item-btn my-lend-btn__del">删除</button>
    </div>`;
    for (let i = 0; i < data.length; ++i) {
        let name = data[i].name;
        let price = data[i].price;
        let desc = data[i].description;
        // let positionText = data[i].location.locationDescription;
        let duration = data[i].duration;
        let itemId = data[i].id;
        let ownerId = data[i].owner_id;
        let imgId = data[i].images;
        // let lon = data[i].location.longitude;
        // let lat = data[i].location.latitude;
        let status = data[i].status;

        let newIdx = $('.my-lend__item').length;
        $('.my-lend-list').append('<div class="my-lend__item" data-index="' + newIdx + '"></div>');
        let $newItem = $('.my-lend__item').last();
        $newItem.append(itemHTML);
        if (ParseBitSet (status, 3)) {
            // 已完成/已归还
            $newItem.addClass('my-lend__item--finished');
            $newItem.find('.my-status-color').addClass('my-lend-color-finished');
            $newItem.find('.my-item-status__txt').addClass('my-lend-color-finished').text('已完成');
        }
        else if (ParseBitSet (status, 2)) {
            // 已借出
            $newItem.addClass('my-lend__item--lending');
            $newItem.find('.my-status-color').addClass('my-lend-color-lending');
            $newItem.find('.my-item-status__txt').addClass('my-lend-color-lending').text('已借出');
        }
        else if (ParseBitSet (status, 0) || status == 0 || ParseBitSet (status, 1)) {
            // 已发布&待审核
            $newItem.addClass('my-lend__item--waiting');
            $newItem.find('.my-status-color').addClass('my-lend-color-waiting');
            $newItem.find('.my-item-status__txt').addClass('my-lend-color-waiting').text('待借出');
        }
        else {
            // 已下架
        }
        // $newItem.attr('data-lon', lon);
        // $newItem.attr('data-lat', lat);
        if (imgId.length) {
            $newItem.find('.my-item-img').attr('src', apiBase + '/image/' + imgId[0]);
        }
        $newItem.find('.my-lend-item-description__txt').text(desc);
        $newItem.find('.my-lend-item-name__txt').text(name);
        $newItem.find('.my-lend-item-price__txt').text(price + ' 元');
        $newItem.find('.my-lend-item-duration__txt').text(duration / 86400 + '天');
        $newItem.find('.my-lend-item-publish-id__txt').text(itemId);
        //图片点击放大
        $('.my-item__pic').click(function () {
            $('#body-cover').fadeIn(300);
            $('#body-cover').one('click', function () {
                $('#body-cover').fadeOut(300).empty();
            });
            const $newImgContainer = $('<div class="full-screen-container"></div>')
            const $newImg = $('<img>');
            $newImg.attr('src', this.children[0].src);
            $newImgContainer.append($newImg);
            $('#body-cover').append($newImgContainer);
        });

        //建设中
        $newItem.find('.my-item-btn').click(() => {
            swal({
                text: 'Sorry,建设中……',
                button: false,
                className: 'red-bg',
                timer: 1000
            });
        });
    }
    //加载后动画
        $('.my-lend__item').addClass('animated flipInX')
            .on('animationend', function () {
                $(this).removeClass('animated flipInX');
            });
}

function LoadMyLend ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/item',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            FillMyLend (res);
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                PromptLogin ();
            }
            else {
                swal('加载已借出列表失败', xhr.status + '错误', 'error');
            }
        }
    });
}

//展示myBorrow地图
function ShowMyBorrowMap (lon, lat, idx)
{
    if ($('#my-borrow-map').length) {
        $('.my-borrow-position-map').empty();
        $('.my-borrow-position-map').hide();
    }
    $('.my-borrow-position-map').eq(idx).append('<div id="my-borrow-map"></div>');
    $('.my-borrow-position-map').eq(idx).show();
    var mapObj = new AMap.Map('my-borrow-map', {
        zoom:16,
        center:[lon, lat]
    });
    //地图坐标标记
    var marker = new AMap.Marker({
        position:[lon, lat]
    })
    mapObj.add(marker);
    //地图控制条
    mapObj.plugin(["AMap.ToolBar"],function(){
        var tool = new AMap.ToolBar({
            liteStyle: true,
            locate: true,
        });
        mapObj.addControl(tool);    
    });
    mapObj.on('complete', function () {
        console.log('my-borrow' + idx + '地图加载完成');
        $('#my-borrow-map').animate({bottom: '0'}, 300, function () {
            $('.my-borrow-position-map').eq(idx).prepend('<span class="map-close">×</span>');
            $('.map-close').click(function () {
                $('#my-borrow-map').animate({bottom: '100%'}, 300, function () {
                    mapObj.destroy();
                    $('.my-borrow-position-map').empty();
                    $('.my-borrow-position-map').hide();
                    console.log('my-borrow-' + idx + '地图已关闭');
                });
            });
        });
    });
}

function FillMyBorrow (data)
{
    $('.my-borrow-list').empty();
    const itemHTML = 
    `<div class="my-status-color"></div>
    <div class="my-item__pic">
        <img src="./images/no-picture.jpg" alt="物品图片">
        <div class="my-borrow-description"></div>
    </div>
    <div class="my-item__info-1">
        <div class="my-borrow-item-name">
            <span class="my-property">物品名称</span>
            <span class="my-borrow-item-name__txt"></span>
        </div>
        <div class="my-borrow-item-duration">
            <span class="my-property">租借时长</span>
            <span class="my-borrow-item-duration__txt"></span>
        </div>
        <div class="my-borrow-item-price">
            <span class="my-property">租借价格</span>
            <span class="my-borrow-item-price__txt"></span>
        </div>
    </div>
    <div class="my-item__info-2">
        <div class="my-borrow-item-publish-id">
                <span class="my-property">物品ID</span>
                <span class="my-borrow-item-publish-id__txt"></span>
        </div>
        <div class="my-borrow-item-owner-id">
                <span class="my-property">物主UID</span>
                <span class="my-borrow-item-owner-id__txt"></span>
        </div>
        <div class="my-borrow-item-publish-time">
                <span class="my-property">发起时间</span>
                <!-- 借入时间 归还时间 -->
                <span class="my-borrow-item-time__txt">2018/8/8 08:08</span>
        </div>
    </div>
    <div class="my-borrow-item__position">
        <span class="my-property">物品地址<br>(点击打开地图)</span>
        <p class="my-borrow-item-position__txt position-txt"></p>
    </div>
    <div class="position-map my-borrow-position-map"></div>
    <div class="my-item__op">
        <span class="my-item-status__txt" title="当前状态"></span>
        <button class="my-item-btn my-borrow-btn__contact" disabled>联系</button>
        <button class="my-item-btn my-borrow-btn__sug" disabled>投诉</button>
    </div>`

    for (let i = 0; i < data.length; ++i) {
        let name = data[i].name;
        let price = data[i].price;
        let desc = data[i].description;
        let positionText = data[i].location.locationDescription;
        let duration = data[i].duration;
        let itemId = data[i].id;
        let ownerId = data[i].owner_id;
        let imgId = data[i].images; //@temp
        let lon = data[i].location.longitude;
        let lat = data[i].location.latitude;
        let status = data[i].status;

        let newIdx = $('.my-borrow__item').length;
        $('.my-borrow-list').append('<div class="my-borrow__item" data-index="' + newIdx + '"></div>');
        let $newItem = $('.my-borrow__item').last();
        $newItem.append(itemHTML);
        if (ParseBitSet (status, 3)) {
            // 已完成/已归还
            $newItem.addClass('my-borrow__item--returned');
            $newItem.find('.my-status-color').addClass('my-borrow-color-returned');
            $newItem.find('.my-item-status__txt').addClass('my-borrow-color-returned').text('已归还');
        }
        else if (ParseBitSet (status, 2)) {
            // 已借入
            $newItem.addClass('my-borrow__item--borrowed');
            $newItem.find('.my-status-color').addClass('my-borrow-color-borrowed');
            $newItem.find('.my-item-status__txt').addClass('my-borrow-color-borrowed').text('已借入');
        }
        else if (ParseBitSet (status, 1)) {
            // 待审核
            $newItem.addClass('my-borrow__item--auditing');
            $newItem.find('.my-status-color').addClass('my-borrow-color-auditing');
            $newItem.find('.my-item-status__txt').addClass('my-borrow-color-auditing').text('待审核');
        }
        else {
            // 已下架
        }
        $newItem.attr('data-lon', lon);
        $newItem.attr('data-lat', lat);
        if (imgId.length) {
            $newItem.find('.my-item-img').attr('src', apiBase + '/image/' + imgId[0]); //@temp
        }
        $newItem.find('.my-borrow-description').text(desc);
        $newItem.find('.my-borrow-item-name__txt').text(name);
        $newItem.find('.my-borrow-item-price__txt').text(price + ' 元');
        $newItem.find('.my-borrow-item-duration__txt').text(duration / 86400 + '天');
        $newItem.find('.my-borrow-item-publish-id__txt').text(itemId);
        $newItem.find('.my-borrow-item-owner-id__txt').text(ownerId);
        $newItem.find('.my-borrow-item-position__txt').text(positionText);
        //图片点击放大
        $('.my-item__pic').click(function () {
            $('#body-cover').fadeIn(300);
            $('#body-cover').one('click', function () {
                $('#body-cover').fadeOut(300).empty();
            });
            const $newImgContainer = $('<div class="full-screen-container"></div>')
            const $newImg = $('<img>');
            $newImg.attr('src', this.children[0].src);
            $newImgContainer.append($newImg);
            $('#body-cover').append($newImgContainer);
        });
    }
    //加载完成后，点击地址
    //TODO:闭包？
    $('.my-borrow-item-position__txt').click(function () {
        let idx = this.parentNode.parentNode.dataset.index;
        let lon = this.parentNode.parentNode.dataset.lon;
        let lat = this.parentNode.parentNode.dataset.lat;
        ShowMyBorrowMap(lon, lat, idx);
    });
    //加载后动画
    $('.my-borrow__item').addClass('animated flipInX')
        .on('animationend', function () {
            $(this).removeClass('animated flipInX');
        });
}

function LoadMyBorrow ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/item?borrowed',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            FillMyBorrow(res);
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                PromptLogin ();
            }
            else {
                swal('加载已借入列表失败', xhr.status + '错误', 'error');
            }
        }
    });
}

function FillInform (data)
{
    $('.inform-list').empty();
    for (let i = data.length - 1; i >= 0; --i) {
        let sender = data[i].from;
        if (sender != 0) {
            //非系统通知
            continue;
        }
        let timestamp = data[i].timestamp;
        let msg = data[i].message;
        //此处timestamp单位是秒，js中传入date对象的是毫秒
        let timeStr = FormatTime (timestamp * 1000);
        let listHTML = 
        `<li class="inform-list__item">
            ${timeStr} 
            [${sender == 0 ? '系统' : '用户'}] <br>
            ${msg}
        </li>`
        $('.inform-list').append(listHTML);
        const $inform = $('.inform-list__item').last();
        $inform.hide();
        if ($inform.text().indexOf('请求已被同意') != -1) {
            $inform.css('background', '#aedbae');
        }
        else if ($inform.text().indexOf('请求被对方拒绝') != -1) {
            $inform.css('background', '#ffb8b8');
        }
        else if ($inform.text().indexOf('您已请求借用物品') != -1) {
            $inform.css('background', '#ffff84');
        }

        //限制长度
        if (i < data.length - 20)
            break;
    }
    //完成后动画
    // $('.inform-list__item').addClass('animated zoomIn')
    // .on('animationend', function () {
    //     $(this).removeClass('animated zoomIn');
    // });
    let animateCount = 0;
    const cycle = setInterval(() => {
        if (animateCount >= 10) {
            clearInterval(cycle);
            $('.inform-list').append('<span>仅显示最新20条消息！</span>');
        }
        $('.inform-list__item').eq(animateCount++).show()
        .addClass('animated zoomIn')
        .on('animationend', function () {
            $(this).removeClass('animated zoomIn');
        });
    }, 100);
}

function LoadInform ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/message',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            FillInform(res);
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                PromptLogin ();
            }
            else {
                swal('加载通知列表失败', xhr.status + '错误', 'error');
            }
        }
    })
}

function FillAudit (data)
{
    $('.audit-list').empty();
    if (data.length == 0) {
        $('.audit-list').append('<span>这里空空的，什么也没有~</span>');
    }
    for (let i = 0; i < data.length; ++i) {
        let listHTML, borrowerName;
        const id = data[i].id,
            itemName = data[i].name,
            duration = data[i].duration / 86400,
            item = GetItemInfo (data[i].id);
            status = data[i].status;
        try {
            borrowerName = GetUserInfo (item.borrower_id).nickName;
        }
        catch (err) {
            borrowerName = '未命名(id:' + item.borrower_id + ')';
        }
        if (status == 3) {
            listHTML = `<li class="audit-list__item audit-borrow-req" data-id=${id}>
                用户"${borrowerName}"向你的物品${itemName}（时长${duration}天）发起租借请求，请进行审核。
                <button class="audit-inform-btn audit-btn__agree">同意申请</button>
                <Button class="audit-inform-btn audit-btn__refuse">拒绝申请</Button>
                </li>`;
        }
        else if (status == 7) {
            listHTML = `<li class="audit-list__item audit-return-req" data-id=${id}>
                用户"${borrowerName}"借出的物品${itemName}是否已经被归还？
                <button class="audit-inform-btn audit-btn__returned">已归还</button>`;
        }
        $('.audit-list').append(listHTML);
        $('.audit-list__item').css('visibility', 'hidden');
    }
    //审核按钮
    $('.audit-btn__agree').click(function () {
        const id = this.parentNode.dataset.id;
        SolveApply (id, 0);
    })
    $('.audit-btn__refuse').click(function () {
        const id = this.parentNode.dataset.id;
        SolveApply (id, 1);
    })
    $('.audit-btn__returned').click(function () {
        const id = this.parentNode.dataset.id;
        SolveApply (id, 2);
    })
    //加载后动画
    let animateCount = 0;
    const cycle = setInterval(() => {
        if (animateCount == $('.audit-list__item').length) 
            clearInterval(cycle);
        $('.audit-list__item').eq(animateCount++)
        .css('visibility', 'initial')
        .addClass('animated zoomIn')
        .on('animationend', function () {
            $(this).removeClass('animated zoomIn');
        });
    }, 100);
}

function LoadAudit ()
{
    let waitingAuditObj = [];
    $.ajax({
        type: 'GET',
        url: apiBase + '/item',
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            for (let i = 0; i < res.length; ++i) {
                if (res[i].status == 3 || res[i].status == 7) {
                    waitingAuditObj.push(res[i]);
                }
            }
            FillAudit (waitingAuditObj);
        },
        error: function (xhr) {
            if (xhr.status != 401) {
                swal('加载物品列表失败', xhr.status + '错误', 'error');
            }
        }
    });
}

//@param id, operator(0:agree, 1:refuse, 2:returned)
function SolveApply (id, op)
{
    if (op === 0 || op === 1) {        
        $.ajax({
            type: 'POST',
            url: apiBase + `/item/${id}/accept?reject=${op === 0 ? 'false' : 'true'}`,
            headers: {
                Authorization: AuthorizationText ()
            },
            success: function (res) {
                if (res.code == 0) {
                    if (op == 0) {
                        swal('操作成功', '已同意借出', "success");
                        $('#share-column-audit-inform').click();
                    }
                    else {
                        swal('操作成功', '已拒绝借出', "info");
                        $('#share-column-audit-inform').click();
                    }
                }
            },
            error: function (xhr) {
                swal('操作失败', xhr.status + '错误', "error");
            }
        });
    }
    else if (op === 2) {
        $.ajax({
            type: 'POST',
            url: apiBase + `/item/${id}/return`,
            headers: {
                Authorization: AuthorizationText ()
            },
            success: function () {
                swal('操作成功', '已确认归还', "success");
                $('#share-column-audit-inform').click();
            },
            error: function (xhr) {
                swal('操作失败', xhr.status + '错误', "error");
            }
        })
    }
}

//@param userID:没有该参数则为自己的信息
function GetUserInfo (userId = '')
{
    let data;
    $.ajax({
        type: 'GET',
        url: apiBase + '/user/profile/' + userId,
        async: false,
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            data = res;
        },
        error: function (xhr) {
            console.log('加载指定用户信息失败：' + xhr.status + '错误');
        }
    });
    return data;
}

function GetItemInfo (id) 
{
    let data;
    $.ajax({
        type: 'GET',
        url: apiBase + '/item/' + id,
        async: false,
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            data = res;
        },
        error: function (xhr) {
            swal('加载指定用户信息失败', xhr.status + '错误', 'error');
        }
    });
    return data;
}

function PromptLogin ()
{
    swal({
        title: "还未登陆",
        text: "请先登录账号", 
        icon: "error",
        buttons: ["再看看", "去登陆!"]
    }).then((value) => {
        if (value) {
            $('#share-column-all').click();
            $('#share-user-info__name').click();
        }
    });
}

function ToggleLike (el)
{
    const liked = $(el).hasClass('goods-like--marked');
    const id = el.parentNode.dataset.id;
    $.ajax({
        type: liked ? 'DELETE' : 'POST',
        url: apiBase + '/user/favorite/' + id,
        headers: {
            Authorization: AuthorizationText ()
        },
        success: function (res) {
            if (liked) {
                $(el).removeClass('goods-like--marked');
                layer.msg('取消收藏', {
                    time: 1000
                });
            }
            else {
                $(el).addClass('goods-like--marked animated bounceIn');
                setTimeout(() => {
                    $(el).removeClass('animated bounceIn');
                }, 1000);
                layer.msg('收藏成功', {
                    time: 1000
                });
            }
        },
        error: function (xhr) {
            if (xhr.status == 401)
                swal('收藏失败', '登陆后才可以收藏！', 'error');
            else
                swal('收藏失败', xhr.status + '错误', 'error');
        }
    });
}




