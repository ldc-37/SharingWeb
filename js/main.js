'use strict'
const apiBase = "https://api.hs.rtxux.xyz";
const tempToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5IiwiaWF0IjoxNTM1NzI3MjUwLCJleHAiOjE1MzYzMzIwNTB9.8hkwYSK8OI72HgCAhzUUHny0TwNSp2vB2BuThgFLnpSw0H54tO5BaUz6UYcJ9InPuZV4Hl0c9j3v3oWsWcHTGA";
//@test13
let AuthorizationText = () => {
    return getCookie("tokenType") + " " + getCookie("accessToken");
};

/**
 * 跳转及网址传参
 */
$(function () {
    if (isMobile ()) {
        alert('移动端请暂时使用app');
        // document.execCommand("stop");
        // window.stop();
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

//用户类型选择栏
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
    LoadMyLend ();
})
$('#share-column-my-borrow').click(function () {
    $('.l-content>div').hide();
    $('.l-my-borrow').show();
    LoadMyBorrow ();
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
// $('.l-main').change(function () {
//     setTimeout(function () {
//         $('.goods-position__txt').click(function () {
//             let idx = this.parentNode.parentNode.parentNode.parentNode.dataset.index;
//             let lon = this.parentNode.parentNode.parentNode.parentNode.dataset.lon;
//             let lat = this.parentNode.parentNode.parentNode.parentNode.dataset.lat;
//             ShowItemMap(lon, lat, idx);
//         });
//     }, 2000)
// })


//展示item地图
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


function FillMain (data)
{
    $('.goods-list').empty();
    const itemHTML = 
    `<div class="goods-item__hd">
        <span class="goods-owner">物主UID:
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
                <a class="goods-position__txt position-txt" title="点击查看地图"></a>
            </div>
        </div>
        <div class="goods-item__enter">
            <button class="goods-enter">租用</button>
        </div>
        <div class="position-map goods-position-map"></div>
    </div>`;
    //TODO:better parse single object
    let name, price, desc, positionText, time, imgId, ownerId, lon , lat;
    for (let i = 0; i < (data.length ? data.length : 1); ++i) {
        if (data.length == undefined) {
            //传入的是单个item的对象
            name = data.name;
            price = data.price;
            desc = data.description;
            positionText = data.location.locationDescription;
            time = data.duration;
            imgId = data.images; //@temp
            ownerId = data.owner_id;
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
            ownerId = data[i].owner_id;
            lon = data[i].location.longitude;
            lat = data[i].location.latitude;
        }
        let newIdx = $('.goods-list__item').length;
        $('.goods-list').append('<div class="goods-list__item" data-index="' + newIdx + '"></div>');
        let $newItem = $('.goods-list__item').last();
        $newItem.append(itemHTML);
        $newItem.attr('data-lon', lon);
        $newItem.attr('data-lat', lat);
        $newItem.find('.goods-owner__name').text(ownerId);
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
    //加载完成后，点击地址
    $('.goods-position__txt').click(function () {
        let idx = this.parentNode.parentNode.parentNode.parentNode.dataset.index;
        let lon = this.parentNode.parentNode.parentNode.parentNode.dataset.lon;
        let lat = this.parentNode.parentNode.parentNode.parentNode.dataset.lat;
        ShowItemMap(lon, lat, idx);
    });
}

function LoadMain ()
{
    let i = 0, endFlag = 0;
    let data = [];
    let interval = setInterval (function () {
        $.ajax({
            type: 'GET',
            url: apiBase + '/item/' + ++i,
            dataType: 'json',
            headers: {//TODO:Test account
                Authorization: "Bearer " + tempToken
                // Authorization: AuthorizationText ()
            },
            async: false,
            success: function (res) {
                // FillMain (res);
                if (res.status == 0 || res.status == 1) // 可租借
                    data.push(res);
            },
            error: function (xhr) {
                // alert('加载主页失败：' + xhr.status + '错误');
                endFlag += 1;
                return;
            }
        });
        if (endFlag == 2) {
            clearInterval(interval);
            FillMain (data);
        }
        if (i == 100) {
            clearInterval(interval);
            return;
        }
    }, 10);
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
            $newItem.find('.my-item-img').attr('src', apiBase + '/image/' + imgId[0]); //@temp
        }
        $newItem.find('.my-lend-item-description__txt').text(desc);
        $newItem.find('.my-lend-item-name__txt').text(name);
        $newItem.find('.my-lend-item-price__txt').text(price + ' 元');
        $newItem.find('.my-lend-item-duration__txt').text(duration / 86400 + '天');
        $newItem.find('.my-lend-item-publish-id__txt').text(itemId);
    }
}

function LoadMyLend ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/item',
        headers: {//TODO:Test account
            Authorization: "Bearer " + tempToken
            // Authorization: AuthorizationText ()
        },
        success: function (res) {
            FillMyLend (res);
        },
        error: function (xhr) {
            alert('加载已借出列表失败：' + xhr.status + '错误');
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
        <span class="my-property">物品地址</span>
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
    }

    //加载完成后，点击地址
    //TODO:闭包？
    $('.my-borrow-item-position__txt').click(function () {
        let idx = this.parentNode.parentNode.dataset.index;
        let lon = this.parentNode.parentNode.dataset.lon;
        let lat = this.parentNode.parentNode.dataset.lat;
        ShowMyBorrowMap(lon, lat, idx);
    });
}

function LoadMyBorrow ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/item?borrowed',
        headers: {//TODO:Test account
            Authorization: "Bearer " + tempToken
            // Authorization: AuthorizationText ()
        },
        success: function (res) {
            console.log(res);
            FillMyBorrow(res);
        },
        error: function (xhr) {
            alert('加载已借入列表失败：' + xhr.status + '错误');
        }
    });
}