;
(function($) {
    web_VideoPlayer = function(_container) {
        this.container = _container;
        this.video = document.createElement("audio");
        this.video.setAttribute("webkit-playsinline", "true");
        this.video.setAttribute("x-webkit-airplay", "true");

        if (this.container == undefined) {
            document.body.appendChild(this.video);
            this.video.style.display = "none";
        } else {
            this.container.appendChild(this.video);
        }
        this.video.innerHTML = "Your browser does not support the video element.";


        this._preload = "auto";
        this._autoplay = true;
        this._loop = true;
        this._volume = 1;
        this._width = 100;
        this._height = 100;
        this._poster = "";
        this._currentTime = 0;
        this._canPlay = false;

        this.status_stop = true;


        this.progressTimer = undefined;
        this.enterFrameTimer = undefined;
        this.urlList = [];
        this._index = 0;
        this.url = "";
        this.isStart = false;


        this.errorInt = 0;


        this.bindList = {};
        this.bindList.loadStart = this.loadStart.bind(this);
        this.bindList.progress = this.progress.bind(this);
        this.bindList.loadedMetadata = this.loadedMetadata.bind(this);
        this.bindList.loadCanplay = this.loadCanplay.bind(this);
        this.bindList.loadCanplaythrough = this.loadCanplaythrough.bind(this);
        this.bindList.loadError = this.loadError.bind(this);

        this.bindList.video_play = this.video_play.bind(this);
        this.bindList.video_stop = this.video_stop.bind(this);
        this.bindList.video_pause = this.video_pause.bind(this);
        this.bindList.video_ended = this.video_ended.bind(this);
        this.bindList.video_playing = this.video_playing.bind(this);
        this.bindList.video_waiting = this.video_waiting.bind(this);
        this.bindList.video_abort = this.video_abort.bind(this);
        this.bindList.video_seeked = this.video_seeked.bind(this);
        this.bindList.video_seeking = this.video_seeking.bind(this);
        this.bindList.video_suspend = this.video_suspend.bind(this);
        this.bindList.video_stalled = this.video_stalled.bind(this);
        this.bindList.video_timeupdate = this.video_timeupdate.bind(this);
        this.bindList.video_volumechange = this.video_volumechange.bind(this);


        this.listenerList = {};
        this.events = {
            play: "play", //在媒体回放被暂停后再次开始时触发。即，在一次暂停事件后恢复媒体回放
            stop: "stop", //播放停止
            pause: "pause", //播放暂停时触发
            ended: "ended", //播放结束时触发

            playing: "playing", //在媒体开始播放时触发（不论是初次播放、在暂停后恢复、或是在结束后重新开始）。
            waiting: "waiting", //在一个待执行的操作（如回放）因等待另一个操作（如跳跃或下载）被延迟时触发。

            abort: "abort", //当音频/视频的加载已放弃时
            seeked: "seeked", //在跳跃操作完成时触发
            seeking: "seeking", //在跳跃操作开始时触发
            suspend: "suspend", //在媒体资源加载终止时触发，这可能是因为下载已完成或因为其他原因暂停
            // timeupdate:"timeupdate",//元素的currentTime属性表示的时间已经改变
            stalled: "stalled", //当浏览器尝试获取媒体数据，但数据不可用时

            loadstart: "loadstart", //下载开始            
            loadedmetadata: "loadedmetadata", //媒体的元数据已经加载完毕
            canplay: "canplay", //在媒体数据已经有足够的数据（至少播放数帧）可供播放时触发。这个事件对应CAN_PLAY的readyState。
            loadend: "loadend", //下载完成
            loadprogress: "loadprogress", //下载进度
            errors: "errors", //错误信息

            eventEnterFrame: "EventEnterFrame", //帧循环事件

            muted: "muted", //静音
            timeupdate: "timeupdate", //当目前的播放位置已更改时
            volumechange: "volumechange" //当音量已更改时
        };


        this.video.addEventListener("loadstart", this.bindList.loadStart, false);
        this.video.addEventListener("progress", this.bindList.progress, false);
        this.video.addEventListener("loadedmetadata", this.bindList.loadedMetadata, false);
        this.video.addEventListener("canplay", this.bindList.loadCanplay, false);
        this.video.addEventListener("canplaythrough", this.bindList.loadCanplaythrough, false);
        this.video.addEventListener("error", this.bindList.loadError, false);

        this.video.addEventListener("play", this.bindList.video_play, false);
        this.video.addEventListener("pause", this.bindList.video_pause, false);
        this.video.addEventListener("ended", this.bindList.video_ended, false);
        this.video.addEventListener("playing", this.bindList.video_playing, false);
        this.video.addEventListener("waiting", this.bindList.video_waiting, false);
        this.video.addEventListener("abort", this.bindList.video_abort, false);
        this.video.addEventListener("seeked", this.bindList.video_seeked, false);
        this.video.addEventListener("seeking", this.bindList.video_seeking, false);
        this.video.addEventListener("suspend", this.bindList.video_suspend, false);
        this.video.addEventListener("stalled", this.bindList.video_stalled, false);
        this.video.addEventListener("timeupdate", this.bindList.video_timeupdate, false);
        this.video.addEventListener("volumechange", this.bindList.video_volumechange, false);


        this.init();
    };
    web_VideoPlayer.prototype = {
        constructor: web_VideoPlayer,

        init: function() {
            this.preload = "auto";
            this.autoplay = true;
            this.loop = true;
            this.volume = 1;
            this.video.muted = false;
            // this.enterFrameStart();
        },

        //====================================public        
        set poster(_url) {
            this._poster = _url;
            this.video.poster = this._poster;
        },
        get poster() {
            return this._poster;
        },
        set preload(_type) {
            this._preload = _type;
            this.video.preload = this._preload;
        },
        get preload() {
            return this._preload;
        },
        set autoplay(_bo) {
            this._autoplay = _bo;
            this.video.autoplay = this._autoplay;
        },
        get autoplay() {
            return this._autoplay;
        },
        set loop(_type) {
            this._loop = _type;
            // this.video.loop = this._loop;
        },
        get loop() {
            return this._loop;
        },

        set volume(_num) {
            this._volume = _num || 0;
            this.video.volume = this._volume;
            // console.log("set volume:", this._volume)
            if (this._volume <= 0) {
                this.soundClose();
            } else {
                this.soundOpen();
            }
        },
        get volume() {
            return this._volume;
        },
        set height(_num) {
            this._height = _num || 0;
            this.video.height = this._height;
        },
        get height() {
            return this._height;
        },
        set width(_num) {
            this._width = _num || 0;
            this.video.width = this._width;
        },
        get width() {
            return this._width;
        },
        set currentTime(_num) {
            this._currentTime = parseFloat(_num) || 0;
            this.video.currentTime = this._currentTime;
        },
        get currentTime() {
            return this.video.currentTime;
        },
        set canPlay(_bo) {
            this._canPlay = _bo;
        },
        get canPlay() {
            return this._canPlay;
        },
        set index(_index) {
            this._index = _index || 0;
            if (this.urlList.length == 0) {
                // alert("播放列表为空");
                this.restore();
                return;
            }
            if (this._index >= this.urlList.length) {
                // alert("列表播放完成");
                this._index = 0;
            }
            if (this._index < 0) {
                // alert("已是第1首");
                this._index = this.urlList.length - 1;
            }
            this.url = this.urlList[this._index];
            this.video.pause();
            this.canPlay = false;
            // console.log("开始第 " + this._index + " 首:", this.url)            
            this.video.src = this.url;
            this.video.load();
            if (this.autoplay) {
                this.status_stop = false;
            }
        },
        get index() {
            return this._index;
        },
        //总时长
        get duration() {
            return this.video.duration;
        },
        get paused() {
            return this.video.paused;
        },
        get muted() {
            return this.video.muted;
        },




        restore: function() {
            this.stop();
            this.isStart = false;
            this._index = 0;
        },

        load: function(_list) {
            this.urlList = this.urlList.concat(_list);
            if (this.isStart == false) {
                this.isStart = true;
                this.index = 0;
            }
        },
        removeLoad: function(_list) {
            var _isjumps = false;
            for (var i = 0; i < _list.length; i++) {
                var _url = _list[i];
                var _index = this.urlList.indexOf(_url);
                if (_index > -1) {
                    this.urlList.splice(_index, 1);
                    if (this._index > _index) {
                        this._index--;
                    }
                    _isjumps = true;
                }
            }
            if (_isjumps == true) {
                this.index = this._index;
            }
        },

        play: function() {
            this.status_stop = false;
            if (this._currentTime == 0) {
                this.currentTime = this._currentTime;
            }
            if (this.video.paused == true) {
                this.video.play();
            }
        },
        pause: function() {
            this.video.pause();
            this._currentTime = this.video.currentTime;
        },
        stop: function() {
            this.status_stop = true;
            this.video.pause();
            this.currentTime = 0;
            this.video_stop();
        },
        playPrev: function() {
            this.index--;
        },
        playNext: function() {
            this.index++;
        },
        soundOpen: function() {
            this.video.muted = false;
            this.triggerEvent(this.events.muted, false);
        },
        soundClose: function() {
            this.video.muted = true;
            this.triggerEvent(this.events.muted, true);
        },

        setCurrentTime: function(_num) {
            this.currentTime = _num;
        },
        setCurrentTimePer: function(_per) {
            this.currentTime = this.duration * _per;
        },

        clear: function() {
            this.enterFrameStop();
            this.restore();
            this.removeEvents();
        },
        //===================================play
        video_play: function(e) {
            // console.log("video_play:");
            this.triggerEvent(this.events.play);
        },
        video_pause: function(e) {
            // console.log("video_pause:");
            this.triggerEvent(this.events.pause);
        },
        video_stop: function() {
            // console.log("video_stop");
            this.triggerEvent(this.events.stop);
        },
        video_ended: function(e) {
            // console.log("video_ended:", this.video.paused);
            this.triggerEvent(this.events.ended);
            if (this._loop == true) {
                this.index++;
            }
        },
        video_playing: function(e) {
            // console.log("video_playing:");
            this.triggerEvent(this.events.playing);
        },
        video_waiting: function(e) {
            // console.log("video_waiting:");
            this.triggerEvent(this.events.waiting);
        },
        video_abort: function(e) {
            // console.log("video_abort:");
            this.triggerEvent(this.events.abort);
        },
        video_seeked: function(e) {
            // console.log("video_seeked:");
            this.triggerEvent(this.events.seeked);
        },
        video_seeking: function(e) {
            // console.log("video_seeking:");
            this.triggerEvent(this.events.seeking);
        },
        video_suspend: function(e) {
            // console.log("video_suspend:");
            this.triggerEvent(this.events.suspend);
        },
        video_stalled: function(e) {
            // console.log("video_stalled:");
            this.triggerEvent(this.events.stalled);
        },
        video_timeupdate: function(e) {
            var _param = {};
            _param.duration = this.duration;
            _param.currentTime = this.currentTime;
            this.triggerEvent(this.events.timeupdate, _param);
            // console.log("video_timeupdate:", this.duration, this.currentTime);
        },
        video_volumechange: function(e) {
            // console.log("video_volumechange:", this.video.volume)
            var _param = {};
            _param.volume = this.video.volume;
            this.triggerEvent(this.events.volumechange, _param);
        },


        enterFrameStart: function() {
            enterFrameTimer = setInterval(this.enterFrameUpdate.bind(this), 100);
        },
        enterFrameUpdate: function() {
            var _param = {};
            _param.duration = this.duration;
            _param.currentTime = this.currentTime;
            this.triggerEvent(this.events.eventEnterFrame, _param);
        },
        enterFrameStop: function() {
            if (this.enterFrameTimer) clearInterval(this.enterFrameTimer);
        },

        //===================================load
        loadStart: function(e) {
            // console.log("loadStart:");
            this.triggerEvent(this.events.loadstart);
        },
        progress: function(e) {
            // console.log("video progress:", e.target.currentTime, e.target.duration);
        },
        loadedMetadata: function(e) {
            // console.log("loadedMetadata:", e);
            this.triggerEvent(this.events.loadedmetadata);
            this.progressTimer = setTimeout(this.triggerProgress.bind(this), 100);
        },
        triggerProgress: function() {
            var timeRanges = this.video.buffered;
            var time = this.video.currentTime;
            if (timeRanges.length == 0) {
                this.progressTimer = setTimeout(this.triggerProgress.bind(this), 100);
                return;
            }
            // console.log(timeRanges);
            var range = 0;
            while (!(timeRanges.start(range) <= time && time <= timeRanges.end(range))) {
                if (range < timeRanges.length - 1) {
                    range++;
                } else {
                    break;
                }
                // console.log("range:",range)
            }
            // console.log("triggerProgress",timeRanges, time, timeRanges.start(range), timeRanges.end(range), this.video.duration)

            var percentStart = timeRanges.start(range) / this.video.duration;
            var percentEnd = timeRanges.end(range) / this.video.duration;
            var percent = percentEnd - percentStart;
            if (percent > 1) {
                percent = 1;
            }
            var param = {};
            param.loadPerStart = percentStart;
            param.loadPerEnd = percentEnd;
            param.loadPercent = percent;
            param.duration = this.video.duration;
            param.rangeStart = timeRanges.start(range);
            param.rangeEnd = timeRanges.end(range);
            this.triggerEvent(this.events.loadprogress, param);
            if (percent >= 1 || param.rangeEnd >= this.video.duration) {
                // console.log("下载完成！");
                this.triggerEvent(this.events.loadend);

                if (this.status_stop == false && this.video.paused == true && this.video.currentTime == 0) {
                    // console.log("triggerProgress方法 -> this.play()");
                    // this.play();
                }

            } else {
                this.progressTimer = setTimeout(this.triggerProgress.bind(this), 100);
            }
        },
        //文件可以流播放
        loadCanplay: function(e) {
            // console.log("loadCanplay:");
            this.canPlay = true;
            this.triggerEvent(this.events.canplay);
        },
        //在媒体的readyState变为CAN_PLAY_THROUGH时触发，表明媒体可以在保持当前的下载速度的情况下不被中断地播放完毕。注意：手动设置currentTime会使得firefox触发一次canplaythrough事件，其他浏览器或许不会如此。
        loadCanplaythrough: function(e) {
            // console.log("loadCanplaythrough:");
        },
        loadError: function(e) {
            // console.log("loadError:");
            this.triggerEvent(this.events.errors, e);

            this.errorInt++;
            console.log(this.vedioUrl + " 加载错误：" + this.errorInt + "   error:", JSON.stringify(e));
            if (this.errorInt >= 5) {
                window.location.reload(true);
                return;
            }
            this.stop();
            this.video.load();
        },


        //==================================events
        addEvent: function(_type, _fn) {
            if (typeof this.listenerList[_type] === "undefined") {
                this.listenerList[_type] = [];
            }
            if (typeof _fn === "function") {
                this.listenerList[_type].push(_fn.bind(this));
            }
            return this;
        },
        triggerEvent: function(_type, _arg) {
            //arguments
            var _arrayEvent = this.listenerList[_type];
            if (_arrayEvent instanceof Array) {
                for (var i = 0; i < _arrayEvent.length; i++) {
                    if (typeof _arrayEvent[i] === "function") {
                        _arrayEvent[i](_arg);
                    }
                }
            }
        },
        removeEvent: function(_type, _fn) {
            var _arrayEvent = this.listenerList[_type];
            if (_arrayEvent instanceof Array) {
                if (typeof _fn === "function") {
                    for (var i = 0; i < _arrayEvent.length; i++) {
                        if (_arrayEvent[i] === _fn) {
                            this.listenerList[_type].splice(i, 1);
                            break;
                        }
                    }
                } else {
                    delete this.listenerList[_type];
                }
            }
            return this;
        },
        removeEvents: function() {
            for (var type in this.listenerList) {
                this.removeEvent(type);
            }
        }

    }
})(jQuery);