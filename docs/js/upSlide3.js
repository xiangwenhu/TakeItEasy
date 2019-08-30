const DEFAULT_OPTION = {
    inTime: 1000,
    pauseTime: 1000,
    className: "upslide-item",
    animationClass: "upslide-frame",
    animationInName: "slide-animation-in",
    animationPauseName: "slide-animation-pause",
    animationOutName: "slide-animation-out"
};

class UpSlide {
    constructor(options) {
        this.el = options.el;
        this.options = Object.assign({}, DEFAULT_OPTION, options);
        // 切换状态
        this.changeStatus = 0;
        this.currentContents = null;
        this.animationendEvent = this.animationendEvent.bind(this);
        const { inTime, pauseTime } = this.options;
        this.totalTime = inTime + pauseTime;
        this.frame1 = null;
        this.frame2 = null;
        this.currentIndex = 0;
        this.status = "running";
        this.init();
    }

    createFrame() {
        const { className, animationClass } = this.options;
        const newEl = document.createElement("div");
        newEl.className = className + " " + animationClass;
        return newEl;
    }

    getNextIndex() {
        if (this.changeStatus === 1) {
            this.currentIndex = 0;
            this.changeStatus = 0;
            return 0;
        }
        return this.currentIndex % this.currentContents.length;
    }

    getNextContent() {
        const nextIndex = this.getNextIndex();
        const content = this.currentContents[nextIndex];
        console.log("nextIndex:", nextIndex, "content", content);

        return content;
    }

    setNextIndex() {
        this.currentIndex = (this.currentIndex + 1) % this.currentContents.length;
    }

    animationendEvent(e) {
        const {
            animationInName,
            animationPauseName,
            animationOutName,
            inTime,
            pauseTime
        } = this.options;

        const { frame1, frame2 } = this;
        const aName = e.animationName;
        const current = e.target;
        if (frame1 === current) {
            switch (aName) {
                case animationInName:
                    this.setNextIndex();

                    frame2.innerText = this.getNextContent();

                    frame1.style.animationName = animationPauseName;
                    frame1.style.animationDuration = pauseTime + "ms";
                    break;
                case animationPauseName:
                    frame1.style.animationName = animationOutName;
                    frame1.style.animationDuration = pauseTime + "ms";

                    //fram1开始out，唤起fram2 in
                    frame2.style.animationName = animationInName;
                    frame1.style.animationDuration = inTime + "ms";
                    break;
                case animationOutName:
                    break;
                default:
                    break;
            }
        } else {
            switch (aName) {
                case animationInName:
                    this.setNextIndex();
                    frame1.innerText = this.getNextContent();

                    frame2.style.animationDelay = "0ms";
                    frame2.style.animationName = animationPauseName;
                    frame2.style.animationDuration = pauseTime + "ms";
                    break;
                case animationPauseName:
                    frame2.style.animationName = animationOutName;
                    frame2.style.animationDuration = pauseTime + "ms";

                    //fram2开始out，唤起fram1 in
                    frame1.style.animationName = animationInName;
                    frame1.style.animationDuration = inTime + "ms";
                    break;
                case animationOutName:
                    break;
                default:
                    break;
            }
        }
    }

    getCurrentItem() {
        return Array.from(this.frame.children).find(el => el.dataset.index == this.currentIndex);
    }

    init() {
        const { el } = this;
        el.addEventListener("animationend", this.animationendEvent);
    }

    innerStart(content, delay = 0) {
        this.currentIndex = 0;
        this.currentContents = content;
        this.frame1.innerText = this.currentContents[0];
    }

    ensureFrames() {
        if (!this.frame1) {
            this.frame1 = this.createFrame();
            this.frame1.dataset.isFirst = 1;
            this.el.appendChild(this.frame1);
        }
        if (!this.frame2) {
            this.frame2 = this.createFrame();
            this.frame2.style.animationDelay = this.totalTime + "ms";
            this.el.appendChild(this.frame2);
        }
    }

    start(content, delay = 0) {
        this.ensureFrames();
        // 替换
        if (this.currentContents != null) {
            this.currentContents = content;
            this.changeStatus = 1;
            return;
        }
        this.innerStart(content, delay);
    }

    destroy() {
        this.el.removeEventListener("animationend", this.animationendEvent);
        this.frame1 = null;
        this.frame2 = null;
        this.el.innerHTML = null;
        this.el = null;
        this.options = null;
    }
}

window.UpSlide = UpSlide;
