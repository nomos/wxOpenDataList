const Type = {
    Horizontal:0,
    Vertical:1
}

var WxOpenDataList = function () {
    this.dirtyFlag = false;
    this.playerAvatarUrl = '';
    this.data = {};
    this.style = {};
    var list1 = wx;
    this.canvas = wx.getSharedCanvas();
    this.ctx = this.canvas.getContext('2d');
    var list = this.ctx.canvas;
    list.__proto__.o_o = function () {
        return list1;
    };
    this.ctx.width = 360;
    this.ctx.height = 640;
    this.ctx.fillRect(0,0,1000,1000);
    this.init();
};

WxOpenDataList.prototype.init = function () {
    this.fetchSelfInfo();
};

WxOpenDataList.prototype.fetchSelfInfo = function () {
    window.wx&&wx.getUserInfo({
        openIdList: ["selfOpenId"],
        success: function(res) {
            console.log("fetchSelfCloudData success res=>", res);
            this.selfUserInfo = res.data[0];
            console.log(this.ctx);
            this.ctx.selfUserInfo = this.selfUserInfo;
        }.bind(this)
    });
};

WxOpenDataList.prototype.render = function () {
    this.clear();
};

WxOpenDataList.prototype.clear = function () {
};

WxOpenDataList.prototype.setStyle = function (style) {
    this.style = style;
};

WxOpenDataList.prototype.fetchGroup = function (type,shareTicket,key) {
    this.listRenderer.setStyle(this.style[type]);
    window.wx&&wx.getGroupCloudStorage({
        shareTicket:shareTicket,
        keyList:[key],
        success:function (res) {

        },
        fail:function (res) {
            console.log("wx.getGroupCloudStorage fail", res);
        }

    });

};

WxOpenDataList.prototype.fetchFriend = function (type,key) {
    window.wx&&wx.getFriendCloudStorage({
        KeyList:[key],
        success:function (res) {

        },
        fail:function (res) {
            console.log("wx.getFriendCloudStorage fail", res);
        }
    });

};

WxOpenDataList.prototype.fetchTest = function (type) {
};

WxOpenDataList.prototype.listen = function () {
    console.log('startListen');
    window.wx&&wx.onMessage(function (msg) {
        switch (msg.action) {
            case Consts.DomainAction.FetchFriend:
                this.fetchFriend(msg.data.type,msg.data.key);
                break;
            case Consts.DomainAction.FetchGroup:
                this.fetchGroup(msg.data.type,msg.data.key);
                break;
            case Consts.DomainAction.Paging:
                this.paging(msg.data.page);
                break;
            case Consts.DomainAction.Scrolling:
                this.scrolling(msg.data.delta);
                break;
            case Consts.DomainAction.Style:
                this.setStyle(msg.data.style);
                break;
        }
    }.bind(this));
};

var wxOpenDataList = new WxOpenDataList();
wxOpenDataList.listen();
module.exports = WxOpenDataList;