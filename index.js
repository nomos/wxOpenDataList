var Consts = {
    DomainAction: {
        FetchFriend: "FetchFriend",
        FetchGroup: "FetchGroup",
        Paging: "Paging",
        Scrolling: "Scrolling",
        Style: "Style"
    },
    ListType:{
        Embed:"Embed",
        Horizontal:"Horizontal",
        Vertical:"Vertical"
    }
};

var Item = function (scrollview,ctx,data,index) {
    this.scrollView = scrollview;
    this.ctx = ctx;
    this.data = data;
    this.avatar = data.avatarUrl;
    this.text  = data.text;




    this.updateTransform = function () {

    };

    this.render = function () {
        this.avatar&&this.avatar.render();
        this.text&&this.text.render();
    };
};

var Avatar = function (item,avatar) {
    this.item = item;
    this.avatarUrl = avatar;
    this.style = item.getAvatarStyle();

    this.updateTransform = function () {
        this.x = this.item.x+this.item.scrollView.x+this.style.x;
        this.y = this.item.y+this.item.scrollView.y+this.style.y;
    };

    this.render = function () {
        if (!this.item.ctx.isWithIn(this.x,this.y,this.w,this.h)) {
            return;
        }
        this.updateTransform();
        this.image = wx.createImage();
        this.image.src = this.avatarUrl;
        this.image.onLoad = function () {
              this.item.ctx.drawImage(this.image,this.x,this.y,this.w,this.h);
        }.bind(this);

    };
};

var Text = function (item,str) {
    this.item = item;
    this.str = str;
    this.style = item.ctx.getTextStyle();

    this.updateTransform = function () {
        this.x = this.item.x+this.item.scrollView.x+this.style.x;
        this.y = this.item.y+this.item.scrollView.y+this.style.y;
    };

    this.render = function () {
        if (!this.item.ctx.isWithIn(this.x,this.y,str.length*10,this.style.size)) {
            return;
        }
        this.item.ctx.fillStyle = this.style.fillStyle;
        this.item.ctx.textAlign = this.style.textAlign;
        this.item.ctx.baseLine = this.style.baseLine;
        this.item.ctx.font = ""+this.style.size+"px "+this.style.font;
        this.item.ctx.fillText(this.str,this.x,this.y);
    }
};

var ScrollView = function (style,x,y) {
    this.style = style;
    this.x = x;
    this.y = y;
    this.w=style.w;
    this.h=style.h;
    this.content = {};
    this.content.x = 0;
    this.content.y = 0;
    this.content.width = 0;
    this.content.height = 0;
    this.items = [];
    this.offset = 0;
    this.offsetMin = 0;
    this.offsetMax = 0;

    this.setStyle = function (style) {
        this.style = style;
        if (this.items&&this.items.length>0) {
            this.reset();
            this.render();
        }
    };

    this.init = function (data) {
        this.reset();
        this.sharedCanvas = wx.getSharedCanvas();
        this.ctx = this.shareCanvas.getContext('2d');
        this.initWithData(data)
    };

    this.initWithData = function (data) {
        this.reset();
        for (var i=0;i<data.length;i++) {
            this.addItem(data[i],i);
        }
    };

    this.addItem = function (data,index) {
        var item = new Item(this,this.ctx,data,index);
        this.items.push(item);
    };

    this.reset = function () {
        this.items = [];
        this.scrollView.clear();
    };

    this.render = function () {
        for (var i=0;i<this.items.length;i++) {
            this.items[i]&&this.items[i].render();
        }
    };

    this.isWithIn = function (x,y,w,h) {
        return x
    };

    this.scroll = function (delta) {

    };

    this.getTextStyle = function () {
        return this.style['text'];
    };

    this.getAvatarStyle = function () {
        return this.style['avatar'];
    };
};

var WxOpenDataList = function () {
    this.dirtyFlag = false;
    this.playerAvatarUrl = '';
    this.data = {};
    this.style = {};
    this.type = Consts.ListType.Embed;
    this.scrollView = new ScrollView();
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
        }
    });
};

WxOpenDataList.prototype.render = function () {
    this.clear();
    this.scrollView.render();
};

WxOpenDataList.prototype.clear = function () {
    this.scrollView.reset();
};

WxOpenDataList.prototype.setStyle = function (style) {
    this.style = style;
    this.scrollView.setStyle(style);
};

WxOpenDataList.prototype.fetchGroup = function (type,shareTicket,key) {
    this.scrollView.setStyle(this.style[type]);
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
    this.scrollView.setStyle(this.style[type]);
    wx&&wx.getFriendCloudStorage({
        KeyList:[key],
        success:function (res) {

        },
        fail:function (res) {
            console.log("wx.getFriendCloudStorage fail", res);
        }
    });

};

WxOpenDataList.prototype.paging = function (page) {
    this.scrollView.setPageIndex(page);
};

WxOpenDataList.prototype.scrolling = function (delta) {
    this.scrollView.scroll(delta);
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