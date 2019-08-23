const DEFAULT_OPTION = {
    inTime: 1000,
    pauseTime: 1500,
    outTime: 1000,
    className: "upslide-item",
    animationClass: "upslide-item-animation",
    animationInClass: "slideup-animation-in",
    animationPauseClass: "slideup-animation-pause",
    animationOutClass: "slideup-animation-out"
};

const DELETING_CLASS_NAME = "__deleting__";

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

class UpSlide {
    constructor(options) {
        this.el = options.el;
        this.options = Object.assign(DEFAULT_OPTION, options);
        this.changeStatus = 0;
        this.currentContents = null;

        const { inTime, pauseTime, outTime } = this.options;
        this.totalTime = inTime + pauseTime + outTime;
        this.inPausePercent = (inTime + pauseTime) / this.totalTime;
        this.animationstartEvent = this.animationstartEvent.bind(this);
        this.animationendEvent = this.animationendEvent.bind(this);
        this.init();
    }

    createItems(datas, baseDelay = 0) {
        const { className, animationInClass, animationClass, inTime } = this.options;
        const { totalTime, inPausePercent } = this;
        const fragment = document.createDocumentFragment();
        datas.forEach((c, i) => {
            const newEl = document.createElement("div");
            newEl.dataset.isLast = i === datas.length - 1 ? 1 : 0;
            newEl.innerText = c;
            newEl.className = className + " " + animationClass;
            newEl.style.animationName = animationInClass;
            newEl.style.animationDelay = baseDelay + i * totalTime * inPausePercent + "ms";
            newEl.style.animationDuration = inTime + "ms";
            fragment.appendChild(newEl);
        });
        return fragment;
    }

    animationstartEvent(e) {
        const { totalTime, inPausePercent } = this;
        const { animationInClass } = this.options;
        // 开启新的轮回
        if (e.animationName === animationInClass && e.target.dataset.isLast == 1) {
            this.innerStart(this.currentContents, totalTime * inPausePercent);
        }
    }

    animationendEvent(e) {
        const {
            animationInClass,
            animationPauseClass,
            animationOutClass,
            className,
            animationClass,
            pauseTime,
            outTime
        } = this.options;

        const { changeStatus } = this;
        const el = e.target;
        const parent = el.parentElement;
        const animationName = e.animationName;

        switch (animationName) {
            case animationInClass:
                el.style.animationName = animationPauseClass;
                el.style.animationDuration = pauseTime + "ms";
                el.style.animationDelay = "0ms";
                break;
            case animationPauseClass:
                el.style.animationName = animationOutClass;
                el.style.animationDuration = outTime + "ms";
                el.style.animationDelay = "0ms";

                // 切换
                if (changeStatus === 1) {
                    clearSiblings(el);
                    // 标记
                    el.classList.add(DELETING_CLASS_NAME);
                    // 切换
                    this.innerStart(this.currentContents, 0);
                    this.changeStatus = 0;
                }
                break;
            case animationOutClass:
                e.target.classList.remove(animationClass);
                e.target.style.animationDelay = "";

                if (el.classList.contains(DELETING_CLASS_NAME)) {
                    parent.removeChild(el);
                }
                // 轮回结束-清除节点
                if (e.target.dataset.isLast == 1) {
                    const parent = e.target.parentElement;
                    const delItems = parent.querySelectorAll(
                        `.${className}:not(.${animationClass})`
                    );
                    if (delItems.length > 0) {
                        for (let i = delItems.length - 1; i >= 0; i--) {
                            parent.removeChild(delItems[i]);
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

    init() {
        const { el } = this;
        el.addEventListener("animationstart", this.animationstartEvent);
        el.addEventListener("animationend", this.animationendEvent);
    }

    innerStart(content, delay = 0) {
        this.currentContents = content;
        const c = this.createItems(content, delay);
        this.el.appendChild(c);
    }

    start(content, delay = 0) {
        if (this.currentContents != null) {
            this.changeStatus = 1;
            this.currentContents = content;
            return;
        }
        this.innerStart(content, delay);
    }

    destroy() {
        this.el.removeEventListener("animationstart", this.animationstartEvent);
        this.el.removeEventListener("animationend", this.animationendEvent);
        this.el.innerHTML = null;
        this.el = null;
        this.options = null;
    }
}

window.UpSlide = UpSlide;
