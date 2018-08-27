'use strict'
const apiBase = "https://api.hs.rtxux.xyz";
const tempToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI5IiwiaWF0IjoxNTM1Mzg2NzIxLCJleHAiOjE1MzU5OTE1MjF9.Qz-8QHb6dpx5xYBcTnXx6CHXG8ZZJvYeK5tq4ubKQqXzW6Pu9WD_mBKhWG30tSB_ze9rRTjgpWWiQ_GLVN9C-Q";
/**
 * Column控制
 */
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

})

/**
 * Content-main控制
 */

//点击物品地址
$('.goods-position__txt').click(function () {
    let idx = this.parentNode.parentNode.parentNode.parentNode.dataset.index;
    let lon;
    let lat;
    ShowItemMap(idx);
})

//展示地图
function ShowItemMap (/* lon, lat, */ idx)
{
    if ($('#goods-map').length) {
        $('.goods-position-map').empty();
        $('.goods-position-map').hide();
    }
    $('.goods-position-map').eq(idx).append('<div id="goods-map"></div>');
    $('.goods-position-map').eq(idx).show();
    var mapObj = new AMap.Map('goods-map', {
        zoom:12,
        // center:[lon, lat]
    });
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
    for (let i = 0; i < data.length; ++i) {
        let name = data[i].name;
        let price = data[i].price;
        let desc = data[i].description;
        let positionText = data[i].location.locationDescription;
        let time = data[i].duration;
        let imgId = data[i].images; //@temp
        console.log(!imgId.length, imgId[0])
        let newIdx = $('.goods-list__item').length - 1;
        $('.goods-list').append('<div class="goods-list__item" data-index="' + newIdx + '"></div>');
        let $newItem = $('.goods-list__item').last();
        $newItem.append(itemHTML);
        $newItem.find('.goods-owner__name').text('example');
        $newItem.find('.goods-owner-lend-num').text('test');
        $newItem.find('.goods-owner-borrow-num').text('test');
        if (imgId.length) {
            $newItem.find('.goods-img').attr('src', apiBase + '/image/' + imgId[0]); //@temp
        }
        $newItem.find('.goods-img-intro').text(desc);
        $newItem.find('.goods-name__txt').text(name);
        $newItem.find('.goods-price__txt').text(price);
        $newItem.find('.goods-time__txt').text(time);
        $newItem.find('.goods-position__txt').text(positionText);
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
    for (let i = 0; i < data.length; ++i) {
        let name = data[i].name;
        let price = data[i].price;
        let desc = data[i].description;
        let positionText = data[i].location.locationDescription;
        let time = data[i].duration;
        let imgId = data[i].images; //@temp
        console.log(!imgId.length, imgId[0])
        let newIdx = $('.goods-list__item').length - 1;
        $('.my-lend-list').append('<div class="goods-list__item" data-index="' + newIdx + '"></div>');
        let $newItem = $('.goods-list__item').last();
        $newItem.append(itemHTML);
        $newItem.find('.goods-owner__name').text('example');
        $newItem.find('.goods-owner-lend-num').text('test');
        $newItem.find('.goods-owner-borrow-num').text('test');
        if (imgId.length) {
            $newItem.find('.goods-img').attr('src', apiBase + '/image/' + imgId[0]); //@temp
        }
        $newItem.find('.goods-img-intro').text(desc);
        $newItem.find('.goods-name__txt').text(name);
        $newItem.find('.goods-price__txt').text(price);
        $newItem.find('.goods-time__txt').text(time);
        $newItem.find('.goods-position__txt').text(positionText);
    }
}

function LoadMyLend ()
{
    $.ajax({
        type: 'GET',
        url: apiBase + '/item',
        headers: {//TODO:Test account:test13
            Authorization: "Bearer " + tempToken
            // Authorization: authorizationText
        },
        success: function (res) {
            FillMyLend (res);
        },
        error: function (xhr) {
            alert('加载已借出列表失败：' + xhr.status + '错误');
        }
    })
}