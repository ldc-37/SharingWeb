'use strict'
const apiBase = "https://api.hs.rtxux.xyz";
const tempToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5IiwiaWF0IjoxNTM1NTM5OTI1LCJleHAiOjE1MzYxNDQ3MjV9.AGKPMEYxarEWr6cMUtKLmCQOzRN3Z72MPis0wHl3ajV3Xfh4LdI9AVN5b8zUyC7H1OK6qSc3lHLX3f_wpIaCYA";
//@test13
function AuthorizationText ()
{
    return getCookie("tokenType") + " " + getCookie("accessToken");
} 

/**
 * 跳转及网址传参
 */
$(function () {
    if (isMobile ()) {
        alert('移动端请暂时使用app');
        document.execCommand("stop");
        window.stop();
    }
    const searchWords = GetQueryVariable ("s");
    if (searchWords) {
        $('#searchBox').val('ID:' + searchWords);
        $('#mainSearchBtn').click();
    }
})


/**
 * Sidebar控制
 */
//用户名
$.ajax({
    type: 'GET',
    url: apiBase + '/user/profile',
    contentType: 'application/json',
    dataType: 'json',
    headers: {
        Authorization: 'Bearer ' + tempToken
    },
    success: function (res) {
        $('#share-user-info__name').text(res.nickName);
    },
    error: function (xhr) {
        alert('加载用户信息失败：' + xhr.status + '错误');
    }
});
$('.share-column-list__item').click(function () {
    $('.share-column-list__item').removeClass('share-column-list__item--act');
    $(this).addClass('share-column-list__item--act');
})
$('#share-column-all').click(function () {
    LoadMain ();
})
$('#share-column-my-lend').click(function () {
    LoadMyLend ();
})
$('#share-column-my-borrow').click(function () {

})
$('#share-column-my-like').click(function () {

});

/**
 * Content-main
 */
//搜索相关
$('#searchBox').keypress(function (e) {
    if (e.keyCode == "13") 
        $('#mainSearchBtn').click();
})
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
            headers: {//TODO:Test account:test13
                Authorization: "Bearer " + tempToken
                // Authorization: AuthorizationText ()
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
                    alert('物品id搜索失败：' + xhr.status + '错误');
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
                alert('搜索失败：' + xhr.status + '错误');
            }
        });
    }
})

//点击物品地址 TODO:Better solution?
$('.l-main').change(function () {
    setTimeout(function () {
        $('.goods-position__txt').click(function () {
            let idx = this.parentNode.parentNode.parentNode.parentNode.dataset.index;
            let lon = this.parentNode.parentNode.parentNode.parentNode.dataset.lon;
            let lat = this.parentNode.parentNode.parentNode.parentNode.dataset.lat;
            ShowItemMap(lon, lat, idx);
        });
    }, 1000)

})


//展示地图
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
            $('.goods-position-map').eq(idx).prepend('<span id="goods-map-close">×</span>');
            $('#goods-map-close').click(function () {
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

/**
 * Content-my-lend
 */
//类别控制
$('.my-lend-type__item').click(function () {
    $('.my-lend-type--act').removeClass('my-lend-type--act');
    $(this).addClass('my-lend-type--act');
    $('.my-lend__item').show();
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


function FillMain (data)
{
    $('.goods-list').empty();
    const itemHTML = 
    `<div class="goods-item__hd">
        <span class="goods-owner">物主:
            <span class="goods-owner__name"></span>
        </span>
        <span class="goods-owner-info">主人已借出:
            <span class="goods-owner-lend-num"></span>
        </span>
        <span class="goods-owner-info">主人已借入:
            <span class="goods-owner-borrow-num"></span>
        </span>
    </div>
    <i class="goods-like"></i>
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
                <a class="goods-position__txt" title="点击查看地图"></a>
            </div>
        </div>
        <div class="goods-item__enter">
            <button class="goods-enter">租用</button>
        </div>
        <div class="goods-position-map"></div>
    </div>`;
    //TODO:better parse single object
    for (let i = 0; i < data.length || 1; ++i) {
        let name, price, desc, positionText, time, imgId, lon , lat;
        if (data.length == undefined) {
            //传入的是单个item的对象
            name = data.name;
            price = data.price;
            desc = data.description;
            positionText = data.location.locationDescription;
            time = data.duration;
            imgId = data.images; //@temp
            lon = data.location.longitude;
            lat = data.location.latitude;
        }
        else {
            name = data[i].name;
            price = data[i].price;
            desc = data[i].description;
            positionText = data[i].location.locationDescription;
            time = data[i].duration;
            imgId = data[i].images; //@temp
            lon = data[i].location.longitude;
            lat = data[i].location.latitude;
        }
        let newIdx = $('.goods-list__item').length;
        $('.goods-list').append('<div class="goods-list__item" data-index="' + newIdx + '"></div>');
        let $newItem = $('.goods-list__item').last();
        $newItem.append(itemHTML);
        $newItem.attr('data-lon', lon);
        $newItem.attr('data-lat', lat);
        $newItem.find('.goods-owner__name').text('example');
        $newItem.find('.goods-owner-lend-num').text('test');
        $newItem.find('.goods-owner-borrow-num').text('test');
        if (imgId.length) {
            $newItem.find('.goods-img').attr('src', apiBase + '/image/' + imgId[0]); //@temp
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
}

function LoadMain ()
{
    $.ajax({
        type: 'GET',
        url: apiBase,
        dataType: 'json',
        success: function (res) {
            FillMain (res);
        },
        error: function (xhr) {
            alert('加载主页失败：' + xhr.status + '错误');
        }
    });
}

function FillMyLend (data)
{
    $('.my-lend-list').empty();
    const itemHTML = 
    `<div class="my-lend-status-color"></div>
    <div class="my-lend-item__pic">
        <img src="./images/no-picture.jpg" alt="物品图片" class="my-lend-item-img">
    </div>
    <div class="my-lend-item__basic-info">
        <div class="my-lend-item-name">
            <span class="my-lend-property">物品名称</span>
            <span class="my-lend-item-name__txt"></span>
        </div>
        <div class="my-lend-item-duration">
            <span class="my-lend-property">租借时长</span>
            <span class="my-lend-item-duration__txt"></span>
        </div>
        <div class="my-lend-item-price">
            <span class="my-lend-property">租借价格</span>
            <span class="my-lend-item-price__txt"></span>
        </div>
    </div>
    <div class="my-lend-item__publish-info">
        <div class="my-lend-item-publish-id">
                <span class="my-lend-property">物品ID</span>
                <span class="my-lend-item-publish-id__txt"></span>
        </div>
        <div class="my-lend-item-publish-time">
                <span class="my-lend-property">发布时间</span>
                <span class="my-lend-item-publish-time__txt">2018/8/8 08:09</span>
        </div>
    </div>
    <div class="my-lend-item__description">
        <span class="my-lend-property">物品描述</span>
        <p class="my-lend-item-description__txt"></p>
    </div>
    <div class="my-lend-item__op">
        <span class="my-lend-item-status__txt" title="当前状态">发布中</span>
        <button class="my-lend-btn my-lend-btn__edit">编辑</button>
        <button class="my-lend-btn my-lend-btn__del">删除</button>
    </div>`;
    for (let i = 0; i < data.length; ++i) {
        let name = data[i].name;
        let price = data[i].price;
        let desc = data[i].description;
        // let positionText = data[i].location.locationDescription;
        let duration = data[i].duration;
        let itemId = data[i].id;
        let ownerId = data[i].owner_id;
        let imgId = data[i].images; //@temp
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
            $newItem.find('.my-lend-status-color').addClass('my-lend-color-finished');
            $newItem.find('.my-lend-item-status__txt').addClass('my-lend-color-finished').text('已完成');
        }
        else if (ParseBitSet (status, 2)) {
            // 已借出
            $newItem.addClass('my-lend__item--lending');
            $newItem.find('.my-lend-status-color').addClass('my-lend-color-lending');
            $newItem.find('.my-lend-item-status__txt').addClass('my-lend-color-lending').text('已借出');
        }
        else if (ParseBitSet (status, 0) || status == 0 || ParseBitSet (status, 1)) {
            // 已发布&待审核
            $newItem.addClass('my-lend__item--waiting');
            $newItem.find('.my-lend-status-color').addClass('my-lend-color-waiting');
            $newItem.find('.my-lend-item-status__txt').addClass('my-lend-color-waiting').text('待借出');
        }
        else {
            // 已下架
        }
        // $newItem.attr('data-lon', lon);
        // $newItem.attr('data-lat', lat);
        if (imgId.length) {
            $newItem.find('.my-lend-item-img').attr('src', apiBase + '/image/' + imgId[0]); //@temp
        }
        $newItem.find('.my-lend-item-description__txt').text(desc);
        $newItem.find('.my-lend-item-name__txt').text(name);
        $newItem.find('.my-lend-item-price__txt').text(price + ' 元');
        $newItem.find('.my-lend-item-duration__txt').text(duration);
        $newItem.find('.my-lend-item-publish-id__txt').text(itemId);
    }
}

function LoadMyLend ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/item',
        headers: {//TODO:Test account:test13
            Authorization: "Bearer " + tempToken
            // Authorization: AuthorizationText ()
        },
        success: function (res) {
            FillMyLend (res);
        },
        error: function (xhr) {
            alert('加载已借出列表失败：' + xhr.status + '错误');
        }
    })
}