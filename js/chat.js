'use strict'

let client, nowChatter;
ChatInit();

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
        $(`.chat-contacts__item[data-uid="${nowChatter}"]`)
            .find('.chat-contacts-lastmsg').text(data().message);
        $('#chatMessage').val('');
    }
    else {
        swal('发送失败', '聊天连接异常断开，请重新发送', 'error');
        ChatInit();
    }
})

function ChatInit ()
{
    LoadContactList ();
    const header = {
        login: '',
        passcode: '',
        'Authorization': AuthorizationText()
    }
    const ws = new SockJS(apiBase + '/chat');
    client = Stomp.over(ws);
    let MsgCallback = (message) => {
        if (message.body) {
            let data = {};
            data.message = JSON.parse(message.body).message;
            data.timestamp = JSON.parse(message.body).timestamp * 1000;
            FillNewMsg (data, 1);
            $(`.chat-contacts__item[data-uid="${nowChatter}"]`)
                .find('.chat-contacts-lastmsg').text(data.message);
        } else {
            alert("got empty message");
        }
    }
    client.connect(header, () => {
        client.subscribe('/user/queue/message', MsgCallback);
        // client.unsubscribe();
    });
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
    $newItem.hide().fadeIn(1500);
    let i = 0, incHeight = $('.chat-history')[0].scrollHeight - $('.chat-history').scrollTop() - $('.chat-history').height();
    let msgCycle = setInterval(() => {
        $('.chat-history').scrollTop($('.chat-history').scrollTop() + incHeight / 100);
        if (++i == 100) clearInterval(msgCycle);
    },5);
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
    for (let i = 1; i < data.contacts.length; i++) {
        $('.chat-contacts').append('<div class="chat-contacts__item" data-uid=' + data.contacts[i] + '></div>');
        let $newItem = $('.chat-contacts__item').last();
        $newItem.html(itemHTML);
        $newItem.find('.chat-contacts-name').text(GetUserInfo(data.contacts[i]).nickName);
        $newItem.find('.chat-contacts-lastmsg').text(data.lastMsg[i]);
    }
    $('.chat-contacts__item').click(function () {
        nowChatter = this.dataset.uid;
        $('.chatter-name').text(GetUserInfo(nowChatter).nickName)
        LoadChatHistory(nowChatter);
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
    $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight)
}



function LoadChatAssist ()
{

}