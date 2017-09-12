;
(function($) {
    web_VideoControl = function(_video) {
        this.userAgent = "pc";
        var _ua = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|ios|SymbianOS)/i);
        if (_ua != null) {
            this.userAgent = "moblie";
        }

        this.domTrack = null;
        this.domProgress = null;
        this.domSlide = null;
        this.domLoadProgress = null;

        this.video = _video;

        this._position = 0;
        this._positionMin = 0;
        this._positionMax = 0;
        this._slideSize = 0;
        this._left = 0;
        this._right = 0;
        this._top = 0;
        this._bottom = 0;

        this.slideIsDarg = false;
        this.slideStart = 0;
        this.slideTarget = 0;

        this.isInDomTrack = false;

        this._hidden = false;
        this.fadeOutTime = 300; //毫秒
        this.fadeInTime = 100;
        this.delayOutTime = 100;
        this.delayInTime = 100;

        this._domProgressSize = 0;

        this.controlBtnObj = {
            btn_prev: undefined,
            btn_pause: undefined,
            btn_play: undefined,
            btn_next: undefined,
            btn_stop: undefined,
            btn_soundOpen: undefined,
            btn_soundClose: undefined
        };


        //========================================volume contral
        this.soundProgress = null;


        this.bindList = {};
        this.bindList.slideMouseDown = this.slideMouseDown.bind(this);
        this.bindList.trackMouseDown = this.trackMouseDown.bind(this);
        this.bindList.mouseUp = this.mouseUp.bind(this);
        this.bindList.mouseMove = this.mouseMove.bind(this);
        this.bindList.trackMouseEnter = this.trackMouseEnter.bind(this);
        this.bindList.trackMouseLeave = this.trackMouseLeave.bind(this);

        this.bindList.fun_btn_prev = this.fun_btn_prev.bind(this);
        this.bindList.fun_btn_pause = this.fun_btn_pause.bind(this);
        this.bindList.fun_btn_play = this.fun_btn_play.bind(this);
        this.bindList.fun_btn_next = this.fun_btn_next.bind(this);
        this.bindList.fun_btn_stop = this.fun_btn_stop.bind(this);
        this.bindList.fun_btn_soundOpen = this.fun_btn_soundOpen.bind(this);
        this.bindList.fun_btn_soundClose = this.fun_btn_soundClose.bind(this);


        if (this.userAgent == "pc") {
            $(window).on("mouseup", this.bindList.mouseUp);
            $(window).on("mousemove", this.bindList.mouseMove);
        } else {
            $(window).on("touchend", this.bindList.mouseUp);
            $(window).on("touchmove", this.bindList.mouseMove);
        }


        this.video.addEvent(this.video.events.muted, this.video_iconSound.bind(this));
        this.video.addEvent(this.video.events.timeupdate, this.video_timeupdate.bind(this));
        this.video.addEvent(this.video.events.stop, this.video_stop.bind(this));
        this.video.addEvent(this.video.events.play, this.video_play.bind(this));
        this.video.addEvent(this.video.events.loadprogress, this.video_loadprogress.bind(this));

        this.init();
    };
    web_VideoControl.prototype = {
        constructor: web_VideoControl,
        init: function() {

        },
        initProgress: function(_domTrack, _domSlide, _domProgress, _domLoadProgress) {
            this.domTrack = _domTrack;
            this.domProgress = _domProgress;
            this.domSlide = _domSlide;
            this.domLoadProgress = _domLoadProgress;

            if (this.userAgent == "pc") {
                this.domSlide.on("mousedown", this.bindList.slideMouseDown);
                this.domTrack.on("mousedown", this.bindList.trackMouseDown);
                this.domTrack.on("mouseenter", this.bindList.trackMouseEnter);
                this.domTrack.on("mouseleave", this.bindList.trackMouseLeave);
            } else {
                this.domSlide.on("touchstart", this.bindList.slideMouseDown);
                this.domTrack.on("touchstart", this.bindList.trackMouseDown);
            }


            this.update();
        },
        initControl: function(_btncollection) {
            this.controlBtnObj.btn_prev = _btncollection.btn_prev;
            this.controlBtnObj.btn_pause = _btncollection.btn_pause;
            this.controlBtnObj.btn_play = _btncollection.btn_play;
            this.controlBtnObj.btn_next = _btncollection.btn_next;
            this.controlBtnObj.btn_stop = _btncollection.btn_stop;
            this.controlBtnObj.btn_soundOpen = _btncollection.btn_soundOpen;
            this.controlBtnObj.btn_soundClose = _btncollection.btn_soundClose;

            if (this.controlBtnObj.btn_prev) this.controlBtnObj.btn_prev.on("click", this.bindList.fun_btn_prev);
            if (this.controlBtnObj.btn_pause) {
                if (this.userAgent == "pc") {
                    this.controlBtnObj.btn_pause.on("click", this.bindList.fun_btn_pause);
                } else {
                    this.controlBtnObj.btn_pause.on("touchstart", this.bindList.fun_btn_pause);
                }

            }
            if (this.controlBtnObj.btn_play) {
                if (this.userAgent == "pc") {
                    this.controlBtnObj.btn_play.on("click", this.bindList.fun_btn_play);
                } else {
                    this.controlBtnObj.btn_play.on("touchstart", this.bindList.fun_btn_play);
                }
            }
            if (this.controlBtnObj.btn_next) this.controlBtnObj.btn_next.on("click", this.bindList.fun_btn_next);
            if (this.controlBtnObj.btn_stop) this.controlBtnObj.btn_stop.on("click", this.bindList.fun_btn_stop);
            if (this.controlBtnObj.btn_soundOpen) this.controlBtnObj.btn_soundOpen.on("click", this.bindList.fun_btn_soundOpen);
            if (this.controlBtnObj.btn_soundClose) this.controlBtnObj.btn_soundClose.on("click", this.bindList.fun_btn_soundClose);



            this.fun_btn_soundOpen();
            this.updateBtnStatus();
        },
        initSoundProgress: function(_dir, _track, _slide, _progress) {
            _dir = _dir || "horizontal";
            if (_dir == "vertical") {
                this.soundProgress = new web_ScrollBar("vertical");
                this.soundProgress.dir_invert = true;
            } else {
                this.soundProgress = new web_ScrollBar("horizontal");
            }
            this.soundProgress.init(_track, _slide, true, _progress);
            this.soundProgress.valueMax = 1;
            this.soundProgress.value = this.video.volume;
            this.soundProgress.wheelStep = 1;
            this.soundProgress.pageStep = 10;
            this.soundProgress.addEvent("scroll", this.soundProgressScroll.bind(this));
        },

        //==========================================================public
        set hidden(_bo) {
            this._hidden = _bo;
            if (this._hidden == true) {

            } else {

            }
        },
        get hidden() {
            return this._hidden;
        },


        update: function() {
            if (this.domTrack) {
                this._left = this.domTrack.offset().left;
                this._right = this._left + this.domTrack.width();
                // this._top = this.domTrack.offset().top;
                // this._bottom = this._top+this.domTrack.height();

                this.slideSize = this.domSlide.width();
                this.positionMin = this.domTrack.offset().left;
                this.positionMax = this.positionMin + this.domTrack.width() - this.slideSize;

                this.positionMin -= this.slideSize / 2;
                this.positionMax += this.slideSize / 2;

                // console.log("init:", this.positionMin, this.positionMax)

                this.GPS(0);
            }
        },


        //=========================this to video
        fun_btn_prev: function(e) {
            this.video.playPrev();
        },
        fun_btn_pause: function(e) {
            this.video.pause();
            this.updateBtnStatus();
        },
        fun_btn_play: function(e) {
            this.video.play();
            this.updateBtnStatus();
        },
        fun_btn_next: function(e) {
            this.video.playNext();
        },
        fun_btn_stop: function(e) {
            this.video.stop();
        },
        fun_btn_soundOpen: function(e) {
            this.video.soundOpen();
        },
        fun_btn_soundClose: function(e) {
            this.video.soundClose();
        },
        fun_setVideoCurrentPer: function() {
            var _per = (this.positionMax - this.positionMin) <= 0 ? 0 : (this.position - this.positionMin) / (this.positionMax - this.positionMin); //当前滑动比例
            this.video.setCurrentTimePer(_per);
        },
        //========================video to this
        video_iconSound: function(e) {
            this.updateBtnStatus();
        },
        video_timeupdate: function(e) {
            if (this.slideIsDarg == false) {
                var per = e.currentTime / e.duration;
                this.GPS(per);
            }
        },
        video_stop: function(e) {
            this.updateBtnStatus();
        },
        video_play: function(e) {
            this.updateBtnStatus();
        },
        video_loadprogress: function(e) {
            this.updateLoadProgress(e);
        },

        //=================================progress

        //================================soundProgress
        soundProgressScroll: function(e) {
            // console.log("soundProgress:", e.value)
            if (this.video.volume == e.value) return;
            this.video.volume = e.value;
        },


        //=======================================================mouse
        mouseMove: function(e) {
            var site = e.pageX;
            if (this.userAgent == "pc") {
                site = e.pageX;
            } else {
                site = e.originalEvent.targetTouches[0].pageX;
            }
            if (this.slideIsDarg) {
                if (site < this._left) {
                    site = this._left;
                } else if (site > this._right) {
                    site = this._right;
                }
                this.slideTarget += (site - this.slideStart);
                this.slideRun();
                this.slideStart = site;
            }
        },
        mouseUp: function(e) {
            if (this.slideIsDarg) {
                $(window).off("selectstart", this.noSelectStart);
                this.slideIsDarg = false;
                this.fun_setVideoCurrentPer();
            }
        },
        noSelectStart: function() {
            return false;
        },

        trackMouseEnter: function(e) {
            this.isInDomTrack = true;
        },
        trackMouseLeave: function(e) {
            this.isInDomTrack = false;
        },
        //======================================================
        set slideSize(_num) {
            this._slideSize = _num;
        },
        get slideSize() {
            return this._slideSize;
        },

        set position(_num) {
            // console.log("position:", _num)
            this._position = parseInt(_num);
            if (this._position < this._positionMin) this._position = this._positionMin;
            if (this._position > this._positionMax) this._position = this._positionMax;
            this.domSlide.offset({ left: this._position });
            this.updateProgress();
        },
        get position() {
            return this._position;
        },
        set positionMin(_num) {
            this._positionMin = _num;
        },
        get positionMin() {
            return this._positionMin;
        },
        set positionMax(_num) {
            this._positionMax = _num;
        },
        get positionMax() {
            return this._positionMax;
        },
        updateBtnStatus: function() {
            // console.log("updateBtnStatus:" + this.video.paused)
            if (this.video.paused == true) {
                this.setDOMHidden(this.controlBtnObj.btn_pause);
                this.setDOMVisible(this.controlBtnObj.btn_play);
            } else {
                this.setDOMHidden(this.controlBtnObj.btn_play);
                this.setDOMVisible(this.controlBtnObj.btn_pause);
            }
            if (this.video.muted == false) {
                this.setDOMHidden(this.controlBtnObj.btn_soundOpen);
                this.setDOMVisible(this.controlBtnObj.btn_soundClose);
            } else {
                this.setDOMHidden(this.controlBtnObj.btn_soundClose);
                this.setDOMVisible(this.controlBtnObj.btn_soundOpen);
            }
        },


        trackMouseDown: function(e) {
            // console.log(e);
            var _site = 0;
            if (this.userAgent == "pc") {
                _site = e.pageX;
            } else {
                // _site = e.touches[0].pageX;
                _site = e.originalEvent.targetTouches[0].pageX;
            }
            this.slideTarget = _site - this.slideSize / 2;
            this.slideRun();

            this.fun_setVideoCurrentPer();
        },

        slideMouseDown: function(e) {
            $(window).on("selectstart", this.noSelectStart);
            var _site = 0;
            if (this.userAgent == "pc") {
                _site = e.pageX;
            } else {
                _site = e.originalEvent.targetTouches[0].pageX;
            }
            this.slideStart = _site;
            this.slideTarget = this.position;
            this.slideIsDarg = true;
            // console.log("down  slideStart:", this.slideStart)
            return false;
        },
        slideLimit: function() {
            if (this.slideTarget < this.positionMin) {
                this.slideTarget = this.positionMin;
            } else if (this.slideTarget > this.positionMax) {
                this.slideTarget = this.positionMax;
            }
        },
        slideRun: function() {
            this.slideLimit();
            var _delta = this.slideTarget - this.position; //本次滑动距离
            this.position = this.slideTarget;
        },
        GPS: function(_per) {
            if (_per > 1) _per = 1;
            var _ty = _per * (this.positionMax - this.positionMin) + this.positionMin;
            this.slideTarget = _ty;
            this.slideLimit();
            this.position = this.slideTarget;
        },


        updateProgress: function() {
            if (this.domProgress == null) return;
            var _per = (this._position - this.positionMin) / (this.positionMax - this.positionMin) || 0;
            this.domProgress.width(Math.ceil(_per * this.domTrack.width()));
        },
        updateLoadProgress: function(e) {
            if (this.domLoadProgress == null) return;
            this.domLoadProgress.width(Math.ceil(e.loadPercent * this.domTrack.width()));
            this.domLoadProgress.offset({ left: Math.ceil(this._left + e.loadPerStart * this.domTrack.width()) });
        },


        setDOMVisible: function(_dom) {
            if (_dom) _dom.css({ display: "-webkit-box" })
        },
        setDOMHidden: function(_dom) {
            if (_dom) _dom.css({ display: "none" })
        },


        //=============================================tools
        //转成 00:00:00
        timeFormat: function(_num) {
            _num = _num || 0;
            var h = "0";
            var m = "0";
            var s = "0";
            var _time = "";
            if (_num > 3600) {
                h = parseInt(_num / 3600).toString();
                if (h.length == 1) {
                    h = "0" + h;
                }
                _time += h + ":";
            }
            m = parseInt(_num % 3600 / 60).toString();
            if (m.length == 1) {
                m = "0" + m;
            }
            _time += m + ":";

            s = parseInt(_num % 3600 % 60).toString();
            if (s.length == 1) {
                s = "0" + s;
            }
            _time += s;

            return _time;
        }

    };
})(jQuery);