const DEFAULT_OPTION = {
    inTime: 1000,
    pauseTime: 1000,
    className: "upslide-item",
    animationClass: "upslide-frame",
    animationPlaceholderClass: "upslide-placeholder-animation",
    animationName: "slide-animation",
    animationOutName: "slide-animation-out",
    animationPlaceholderInName: "slideup-animation-placeholder-in",
    animationPlaceholderPauseName: "slideup-animation-placeholder-pause",
    animationPlaceholderOutName: "slideup-animation-placeholder-out"
};

function clearSiblings(el) {
    const parent = el.parentElement;
    // 移除前面节点
    while (el.previousElementSibling) {
        parent.removeChild(el.previousElementSibling);
    }
    // 移除后面的节点
    while (el.nextElementSibling) {
        parent.removeChild(el.nextElementSibling);
    }
}

function hideSiblings(el) {
    if (!el) {
        return;
    }
    let temp = el;
    temp.style.visibility = "hidden";
    while (temp.nextElementSibling) {
        temp.style.visibility = "hidden";
        temp = temp.nextElementSibling;
    }
}

class UpSlide {
    constructor(options) {
        this.el = options.el;
        this.options = Object.assign({}, DEFAULT_OPTION, options);
        this.changeStatus = 0;
        this.currentContents = null;

        const { inTime, pauseTime } = this.options;
        this.totalTime = inTime + pauseTime;
        this.animationendEvent = this.animationendEvent.bind(this);
        this.frame = null;
        this.preFrame = null;
        this.isLast = 0;
        this.currentIndex = 0;
        this.status = "running";
        this.init();
    }

    createItems(datas) {
        const { className } = this.options;
        const fragment = document.createDocumentFragment();
        datas.forEach((c, i) => {
            const newEl = document.createElement("div");
            newEl.dataset.isLast = i === datas.length - 1 ? 1 : 0;
            newEl.dataset.index = i;
            newEl.innerText = c;
            newEl.className = className;
            fragment.appendChild(newEl);
        });
        return fragment;
    }

    getDuration() {
        const { inTime, outTime } = this.options;
        return this.currentContents.length * inTime;
    }

    createframe(duration, delay = 0) {
        const { animationClass } = this.options;
        const frame = document.createElement("div");
        frame.classList.add(animationClass);
        frame.style.animationDuration = duration + "ms";
        frame.style.animationDelay = delay + "ms";
        return frame;
    }

    animationendEvent(e) {
        const {
            animationName,
            animationOutName,
            animationPlaceholderInName,
            animationPlaceholderPauseName,
            inTime,
            pauseTime
        } = this.options;

        const { frame } = this;
        const el = e.currentTarget;
        const aName = e.animationName;
        const current = e.target;
        const dataLength = this.currentContents.length;

        switch (aName) {
            case animationPlaceholderInName:
                this.currentIndex = (this.currentIndex + 1) % dataLength;

                if (this.changeStatus === 2) {
                    this.el.removeChild(this.preFrame);
                    this.preFrame = null;
                    this.changeStatus = 0;
                    console.log("切换完毕");
                }

                el.style.animationName = animationPlaceholderPauseName;
                el.style.animationDuration = pauseTime + "ms";
                frame.style.animationPlayState = "paused";
                this.status = "paused";
                console.log("name:", aName, "index:", this.currentIndex);

                break;
            case animationPlaceholderPauseName:
                el.style.animationName = animationPlaceholderInName;
                el.style.animationDuration = inTime + "ms";
                frame.style.animationPlayState = "running";
                this.status = "running";

                // 切换
                if (this.changeStatus === 1) {
                    const aniItem = this.getCurrentItem();
                    hideSiblings(aniItem);
                    this.innerStart(this.currentContents);
                    this.changeStatus = 2;
                    this.isLast = false;
                    return;
                }

                // 正常结束
                if (this.isLast > 0) {
                    frame.style.animationPlayState = "running";
                    frame.style.transform = "translateY(-100%)";
                    frame.style.animationName = animationOutName;
                    frame.style.animationDuration = inTime + "ms";
                    this.innerStart(this.currentContents);
                    this.isLast = 0;
                    return;
                }

                break;
            case animationName:
                if (this.changeStatus !== 2) {
                    this.isLast = 1;
                }
                break;
            case animationOutName:
                if (this.preFrame != null) {
                    this.el.removeChild(this.preFrame);
                    this.preFrame = null;
                }
            default:
                break;
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
        const { animationPlaceholderClass, inTime, animationPlaceholderInName } = this.options;
        this.currentContents = content;
        const c = this.createItems(content, delay);
        this.preFrame = this.frame;
        this.frame = this.createframe(this.getDuration());
        this.frame.appendChild(c);
        this.el.appendChild(this.frame);
        this.el.classList.add(animationPlaceholderClass);
        this.el.style.animationDuration = inTime + "ms";
        this.el.style.animationName = animationPlaceholderInName;
        if (this.preFrame) {
            this.frame.style.zIndex = +this.preFrame.style.zIndex + 1;
        }
    }

    start(content, delay = 0) {
        if (this.changeStatus !== 0) {
            console.log("正在切换中");
            return;
        }
        console.log("开始切换", this.currentIndex);
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
        if (this.frame) {
            this.frame = null;
        }
        if (this.preFrame) {
            this.preFrame = null;
        }
        this.el.innerHTML = null;
        this.el = null;
        this.options = null;
    }
}

window.UpSlide = UpSlide;
