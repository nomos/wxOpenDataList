var ListRenderer = function () {

};



var WxOpenDataList = function () {
    this.dirtyFlag = false;
    this.playerAvatarUrl = '';
    this.data = {};
    this.style = {};
    this.type = Consts.ListType.Embed;
    this.listRenderer = new ListRenderer();
    this.init();
};

WxOpenDataList.prototype.init = function () {
    this.fetchSelfInfo();

};

WxOpenDataList.prototype.fetchSelfInfo = function () {
    wx&&wx.getUserInfo({
        openIdList: ["selfOpenId"],
        success: function(res) {
            console.log("fetchSelfCloudData success res=>", res);
            this.selfUserInfo = res.data[0];
            this.listRenderer.setSelfInfo(res.data[0]);
        }.bind(this)
    });
};

WxOpenDataList.prototype.render = function () {
    this.clear();
    this.listRenderer.render();
};

WxOpenDataList.prototype.clear = function () {
    this.listRenderer.reset();
};

WxOpenDataList.prototype.setStyle = function (style) {
    this.style = style;
    this.listRenderer.setStyle(style);
};

WxOpenDataList.prototype.fetchGroup = function (type,shareTicket,key) {
    this.listRenderer.setStyle(this.style[type]);
    wx&&wx.getGroupCloudStorage({
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
    this.listRenderer.setStyle(this.style[type]);
    wx&&wx.getFriendCloudStorage({
        KeyList:[key],
        success:function (res) {

        },
        fail:function (res) {
            console.log("wx.getFriendCloudStorage fail", res);
        }
    });

};

WxOpenDataList.prototype.listen = function () {
    console.log('startListen');
    wx&&wx.onMessage(function (msg) {
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