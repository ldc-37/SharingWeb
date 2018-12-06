'use strict'

let client, nowChatter;

$(function () {
    //连接聊天ws
    const header = {
        login: '',
        passcode: '',
        'Authorization': AuthorizationText()
    }
    const ws = new SockJS(apiBase + '/chat');
    client = Stomp.over(ws);
    let MsgCallback = (message) => {
        let msgData = {};
        msgData.message = JSON.parse(message.body).message;
        msgData.timestamp = JSON.parse(message.body).timestamp * 1000;
        msgData.nickName = JSON.parse(message.body).fromNickname;
        msgData.fromId = JSON.parse(message.body).from;
        if ($('.button-chat').css('display') == "none") {
            //聊天窗口打开
            if (msgData.fromId == nowChatter) {
                //收到正在聊天的用户的消息，填充主聊天窗口
                FillNewMsg (msgData, 1);
            }
            const $chatter = $(`.chat-contacts__item[data-uid="${msgData.fromId}"]`);
            //更新最后消息
            $chatter.find('.chat-contacts-lastmsg').text(msgData.message);
            //联系人窗口移至顶部
            $('.chat-contacts').prepend($chatter);
            // $chatter.remove();
        }
        else {
            //聊天窗口关闭的情况下，通过Snarl通知
            Snarl.addNotification({
                title: msgData.nickName,
                text: msgData.message,
                icon: '<i class="fa fa-comment"></i>',
                timeout: settings.chatAlertDismiss,
                action: function () {
                    $('.button-chat').click();
                    let chkCycle = setInterval(() => {
                        if ($(`.chat-contacts__item`).length) {
                            $(`.chat-contacts__item[data-uid="${msgData.fromId}"]`).click()
                            clearInterval(chkCycle);
                        }
                    }, 50)
                }
            });
        }
    }
    client.connect(header, () => {
        Snarl.editNotification(chatFirstSnarlId, {
            title: '聊天连接已建立',
            text: '可以实时与其他用户聊天了！',
            icon: '<i class="fa fa-check"></i>',
            timeout: 3000,
        });
        $('.button-chat--waiting').removeClass('button-chat--waiting');
        client.subscribe('/user/queue/message', MsgCallback);
        // client.unsubscribe();
    });
})

function ChatInit ()
{
    $('#chatMessage').keypress((e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            $('#chatSend').click()
        }
    })
    $('#chatSend').click(() => {
        if (client.connected) {
            let chatBody = () => ({
                to: nowChatter,
                message: $('#chatMessage').val(),
            });
            let data = () => ({
                message: $('#chatMessage').val(),
                timestamp: new Date().getTime(),
            });
            client.send('/chat/send', {}, JSON.stringify(chatBody()));
            FillNewMsg(data(), 0);
            const $chatter = $(`.chat-contacts__item[data-uid="${nowChatter}"]`);
            $chatter.find('.chat-contacts-lastmsg').text(data().message);
            $('#chatMessage').val('');
            //联系人窗口移至顶部
            $('.chat-contacts').prepend($chatter);
            // $chatter.remove();
        }
        else {
            swal('发送失败', '聊天连接异常断开，请刷新重试', 'error');
        }
    })
    LoadContactList ();


}

function LoadContactList ()
{
    $.ajax({
        type: "GET",
        url: apiBase + "/message",
        headers: {
            Authorization: AuthorizationText ()
        },
        dataType: "json",
        success: function (res) {
            let contacts = [], lastMsg = [], nickname = [];
            for (let i = 0; i < res.length; i++) {
                // if (res[i].from == 0) continue;
                if (contacts.indexOf(res[i].from) < 0) {
                    contacts.push(res[i].from);
                    nickname.push(res[i].fromNickname);
                }
                lastMsg[contacts.indexOf(res[i].from)] = res[i].message;
            }
            let data = {};
            data.contacts = contacts;
            data.nickname = nickname;
            data.lastMsg = lastMsg;
            FillContactList (data);
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                PromptLogin ();
            }
            else {
                swal('加载联系人列表失败', xhr.status + '错误', 'error');
            }
        }
    });
}

function FillContactList (data)
{
    $('.chat.contact').empty();
    const itemHTML = `
        <img src="./images/head.png" alt="头像" class="chat-contacts-head">
        <div class="chat-contacts-info">
            <span class="chat-contacts-name"></span>
            <span class="chat-contacts-lastmsg"></span>
        </div>`;
    for (let i = 0; i < data.contacts.length; i++) {
        if (data.contacts[i] == 0 || data.contacts[i] == GetUserInfo().user_id) continue;
        $('.chat-contacts').append('<div class="chat-contacts__item" data-uid=' + data.contacts[i] + '></div>');
        let $newItem = $('.chat-contacts__item').last();
        $newItem.html(itemHTML);
        $newItem.find('.chat-contacts-name').text(GetUserInfo(data.contacts[i]).nickName);
        $newItem.find('.chat-contacts-lastmsg').text(data.lastMsg[i]);
    }
    $('.chat-contacts__item').click(function () {
        nowChatter = this.dataset.uid;
        if ($('.chat-contacts__item--focus').length != 0)
            $('.chat-contacts__item--focus').removeClass('chat-contacts__item--focus');
        $(this).addClass('chat-contacts__item--focus');
        $('.chatter-name').text(GetUserInfo(nowChatter).nickName);
        $('.chat-history').empty();
        $('#chatMessage').val('');
        LoadChatHistory (nowChatter);
        LoadChatAssist (nowChatter);
    })
    $('.chat-contacts__item').first().click();
}

function LoadChatHistory (uid)
{
    $.ajax({
        type: "GET",
        url: apiBase + "/message?peer=" + uid,
        headers: {
            Authorization: AuthorizationText ()
        },
        dataType: "json",
        success: function (res) {
            FillChatHistory(res, uid)
        },
        error: function (xhr) {
            if (xhr.status == 401) {
                PromptLogin ();
            }
            else {
                swal('加载历史记录失败', xhr.status + '错误', 'error');
            }
        }
    })
}

function FillChatHistory (data, uid)
{
    $('.chat-history').empty();
    //data未按照时间排序
    data.sort((a, b) => a.id - b.id);
    for (let i = 0; i < data.length; i++) {
        //时间戳格式不一致
        data[i].timestamp *= 1000;
        FillNewMsg(data[i], data[i].from == uid);
    }
    $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
    let toBottom = $('.chat-history').outerHeight() + 
    $('.chat-history').scrollTop() == $('.chat-history')[0].scrollHeight
}

//@param data:message&time, p:person,0me 1other
function FillNewMsg (data, p)
{
    const itemHTML = `
        <div class="history-body">
            <div class="history-content"></div>
        </div>
        <div class="history-time"></div>`;
    $('.chat-history').append('<div class="history-line"></div>');
    const $newItem = $('.history-line').last();
    $newItem.html(itemHTML);
    if (p == 0) {
        //用户自己的消息
        $newItem.find('.history-body').addClass('history-body--me');
        $newItem.find('.history-time').addClass('history-time--right');
    }
    $newItem.find('.history-content').text(data.message);
    $newItem.find('.history-time').text(FormatTime(data.timestamp, 1));
    //if () to bottomed
    $newItem.hide().fadeIn(800);
    let i = 0, incHeight = $('.chat-history')[0].scrollHeight - $('.chat-history').scrollTop() - $('.chat-history').height();
    let msgCycle = setInterval(() => {
        $('.chat-history').scrollTop($('.chat-history').scrollTop() + incHeight / 100);
        if (++i == 100) clearInterval(msgCycle);
    },5);
    //else
    //收到新消息
}

function LoadChatAssist (uid)
{
    $('.chat-detail__cont').empty();
    let userInfo = GetUserInfo(uid);
    //出借人信息
    // const li = document.createElement('li');
    // li.innerHTML = '<span class="bold">性别：</span>' + userInfo.nickName == 'male' ? '男' : '女';
    // $('.chat-detail__cont').append(li);
    // li.innerHTML = '<span class="bold">手机号码：</span>' + userInfo.phone;
    // $('.chat-detail__cont').append(li);
    // li.innerHTML = '<span class="bold">电子邮箱：</span>' + userInfo.email;
    // $('.chat-detail__cont').append(li);
    // li.innerHTML = '<span class="bold">自我介绍：</span>' + userInfo.description;
    // $('.chat-detail__cont').append(li);

    let $li = $('<li><span class="bold">昵称：</span>' + userInfo.nickName + '</li>');
    $('.chat-detail__cont').append($li);
    $li = $('<li><span class="bold">用户ID：</span>' + userInfo.user_id + '</li>');
    $('.chat-detail__cont').append($li);
    $li = $(`<li><span class="bold">性别：</span>${userInfo.gender == 'male' ? '男' : '女'}</li>`);
    $('.chat-detail__cont').append($li);
    $li = $('<li><span class="bold">手机号码：</span>' + userInfo.phone + '</li>');
    $('.chat-detail__cont').append($li);
    $li = $('<li><span class="bold">电子邮箱：</span>' + userInfo.email + '</li>');
    $('.chat-detail__cont').append($li);
    $li = $('<li><span class="bold">自我介绍：</span>' + userInfo.description + '</li>');
    $('.chat-detail__cont').append($li);

    //出借人物品信息

}

