var fmList = {
    init: function () {
        this.$listTitle = $('.listTitle')
        this.$listRadio = $('#list_Radio')
        this.$listChild = $("header ul li:nth-child(2)")
        this.$cateBtn = $('#more_list')
        this.$cateCt = $('#list_Radio')
        this.bindEvents()
        this.render()
    },
    bindEvents: function () {
        var _this = this
        _this.$cateBtn.on('click', function () { //显示列表       

            if (_this.$listTitle.hasClass('show')) {
                _this.$listTitle.removeClass('show')
                _this.$listRadio.removeClass('show')
            } else {
                _this.$listTitle.addClass('show')
            }
        })
        _this.$listChild.on('click', function () {
            if (_this.$listRadio.hasClass('show')) {
                _this.$listRadio.removeClass('show')
            } else {
                _this.$listRadio.addClass('show')
            }
        })
    },
    render() {
        var _this = this
        $.ajax({
            url: "http://api.jirengu.com/fm/getChannels.php",
            method: "get",
            dataType: "json"
        }).done(function (ret) {
            _this.renderList(ret.channels)
        }).fail(function () {
            $(".channel-list").append("<li>请检查网络连接</li>");
        })

    },
    renderList: function (channels) {
        var _this = this
        var html = ''
        channels.forEach(function (channel) { //将电台列表写入cateCt[0]
            html += '<li data-channel-id="' +
                channel.channel_id + '">' +
                channel.name + '</li>'
        })
        _this.$cateCt[0].innerHTML = html
        _this.renderMusic()
    },
    renderMusic() {
        var _this = this
        let channels = _this.$cateCt.find('li')
        for (let i = 0; i < channels.length; i++) {
            let channelAttr = channels[i]
            $(channelAttr).on('click', function (ret) {
                if (ret.target.tagName.toLowerCase() !== 'li') return;
                EventCenter.fire('select-albumn', {
                    channelId: $(channelAttr).attr('data-channel-id'),
                    channelName: $(channelAttr).attr('data-channel-name')
                })
            })
        }
    },
}


var myFm = {
    init: function () {
        this.$songCt = $('.songName>dl')
        this.audio = new Audio()
        this.audio.autoplay = true
        console.log(2)
        this.$voice = $('#voice_Music')
        this.$silence = $('#silence_Music')
        this.$last = $('#last_Music')
        this.$next = $('#next_Music')
        this.$play = $('#play_Music')
        this.$pause = $('#pause_Music')
        this.$loop = $('#loop_Music')
        this.$cycle = $('#cycle_Music')
        this.$cover = $('.cover')
        this.$currentTime = $('#currentTime')
        this.$durationTime = $('#durationTime')
        this.$actualprogress = $('#actualprogress')

        this.bind()
        this.endMusic()
        this.playMusic()
        this.pauseMusic()
    },
    bind: function () {
        _this = this
        EventCenter.on('select-albumn', function (e, channelObj) { //事件监听
            _this.channelId = channelObj.channelId
            _this.channelName = channelObj.channelName
            _this.loadMusic()
        })
        _this.$voice.on('click', function () { //静音
            if (_this.$voice.hasClass('show')) {
                _this.$voice.removeClass('show')
                _this.$silence.addClass('show')
            }
            _this.audio.volume = 0
        })
        _this.$silence.on('click', function () {
            if (_this.$silence.hasClass('show')) {
                _this.$silence.removeClass('show')
                _this.$voice.addClass('show')
            }
            _this.audio.volume = 1
        })
        _this.$play.on('click', function () { //播放暂停

            _this.audio.play()

        })
        _this.$pause.on('click', function () {

            _this.audio.pause()

        })
        _this.$last.on('click', function () { //上一曲
            _this.loadMusic()
        })
        _this.$next.on('click', function () { //下一曲
            _this.loadMusic()
        })
        _this.$loop.on('click', function () { //单曲循环
            if (_this.$loop.hasClass('show')) {
                _this.$loop.removeClass('show')
                _this.$cycle.addClass('show')
                _this.audio.loop = true

            }
        })
        _this.$cycle.on('click', function () {
            if (_this.$cycle.hasClass('show')) {
                _this.$cycle.removeClass('show')
                _this.$loop.addClass('show')
                _this.audio.loop = false

            }
        })
        _this.defaultURL()
    },
    loadMusic(callback) { //获取歌曲URL
        var _this = this
        $.getJSON('http://api.jirengu.com/fm/getSong.php', {
            channel: this.channelId
        }).done(function (ret) {
            _this.song = ret['song'][0]
            _this.setMusic()
            _this.$play.removeClass('show')
            _this.$pause.addClass('show')
        })
    },
    setMusic() { //载入歌曲URL
        var _this = this
        _this.audio.src = _this.song.url
        console.log(_this.song.url)
        _this.setSonginfo()
    },
    setSonginfo() { //获取歌曲信息
        var _this = this
        let songSinger = _this.song.artist
        let songName = _this.song.title
        _this.$songCt[0].innerHTML = '<dt>' + songName + '</dt>' + "<dd>" + songSinger + "</dd>"
        _this.setRevolve()
    },
    setRevolve() { //获取歌曲图片
        var _this = this
        let songPicture = _this.song.picture
        _this.$cover[0].style.background = 'url("' + songPicture + '")'
    },
    endMusic: function () { //播放结束后
        var _this = this
        _this.audio.addEventListener('ended', function () {
            _this.loadMusic()
        })
    },
    playMusic: function () { //播放状态
        var _this = this
        _this.audio.addEventListener('playing', function () {
            _this.$cover[0].classList.add('revolve')
            _this.$play.removeClass('show')
            _this.$pause.addClass('show')
            clearInterval(_this.statusClock)
            _this.statusClock = setInterval(() => {
                _this.updataStatus()
            }, 10)
        })
    },
    pauseMusic: function () { //暂停状态
        var _this = this
        _this.audio.addEventListener('pause', function () {
            _this.$cover[0].classList.remove('revolve')
            _this.$pause.removeClass('show')
            _this.$play.addClass('show')
            clearInterval(_this.statusClock)
        })
    },
    updataStatus() { //歌曲时间及进度条更新
        var _this = this
        //播放时间
        var min = Math.floor(_this.audio.currentTime / 60)
        var second = Math.floor(_this.audio.currentTime % 60) + ''
        second = second.length === 2 ? second : '0' + second
        min = min.length === 1 ? min : '0' + min
        _this.$currentTime.text(min + ':' + second)
        //歌曲长度
        var maxmin = Math.floor(_this.audio.duration / 60)
        var maxsecond = Math.floor(_this.audio.duration % 60) + ''
        maxsecond = maxsecond.length === 2 ? maxsecond : '0' + maxsecond
        maxmin = maxmin.length === 1 ? maxmin : '0' + maxmin
        _this.$durationTime.text(maxmin + ':' + maxsecond)
        //进度条
        _this.$actualprogress.css('width', _this.audio.currentTime / _this.audio.duration * 100 + '%')
    },
    defaultURL() {
        var _this = this
        $(document).ready(function () {
            let defaultURL = 'http://audio01.dmhmusic.com/71_53_T10049728025_128_4_1_0_sdk-cpm/0208/M00/53/E1/ChR461xlLX2AFIMqAETdLMFzUtU756.mp3?xcode=1a6b740dc50717784c4b2955482b7c5cbb32705'
            _this.audio.src = defaultURL
            console.log(1)
        })
    }


}
var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}

myFm.init()
fmList.init()
/* window.onload=function(){
    var _this = this
    let aaaa = 'http://zhangmenshiting.qianqian.com/data2/music/0fcfa137ee191c29a9192ba1ca90d756/599629637/599629637.mp3?xcode=4f64cb3973daf2ee5fa4084c7da1aa86'
    console.log(aaaa)
    _this.audio.src=aaaa
} */