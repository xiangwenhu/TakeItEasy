const DEFAULT_OPTION = {
    inTime: 1000,
    pauseTime: 1000,
    outTime: 1000,
    className: "upslide-item",
    animationClass: "upslide-item-animation",
    animationInClass: "slideup-animation-in",
    animationPauseClass: "slideup-animation-pause",
    animationOutClass: "slideup-animation-out"
};

class UpSlide {
    constructor(options) {
        this.el = options.el;
        this.options = Object.assign(DEFAULT_OPTION, options);
        this.changeStatus = 0;
        this.currentContents = null;

        const { inTime, pauseTime, outTime } = this.options;
        this.totalTime = inTime + pauseTime + outTime;
        this.inPausePercent = (inTime + pauseTime) / this.totalTime;
        this.init();
    }

    createItems(datas, baseDelay = 0) {
        const { className, animationInClass, animationClass } = this.options;
        const { totalTime, inPausePercent, inTime } = this;
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

    init() {
        const { el, totalTime, inPausePercent } = this;
        const {
            animationInClass,
            animationPauseClass,
            animationOutClass,
            className,
            animationClass,
            pauseTime,
            outTime
        } = this.options;
        el.addEventListener("animationstart", e => {
            // 开启新的轮回
            if (e.animationName === animationInClass && e.target.dataset.isLast == 1) {
                this.start(this.currentContents, totalTime * inPausePercent);
            }
        });

        el.addEventListener("animationend", e => {
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
                        // 移除前面节点
                        while (el.previousElementSibling) {
                            parent.removeChild(el.previousElementSibling);
                        }
                        // 移除后面的节点
                        while (el.nextElementSibling) {
                            parent.removeChild(el.nextElementSibling);
                        }
                        // 标记
                        el.classList.add("__deleting__");
                        // 切换
                        this.start(this.currentContents, 0);
                        this.changeStatus = 0;
                    }
                    break;
                case animationOutClass:
                    e.target.classList.remove(animationClass);
                    e.target.style.animationDelay = "";

                    if (el.classList.contains("__deleting__")) {
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
        });
    }

    start(content, delay = 0) {
        this.currentContents = content;
        const c = this.createItems(content, delay);
        this.el.appendChild(c);
    }

    switch(content) {
        this.changeStatus = 1;
        this.currentContents = content;
    }

    destroy() {
        // TODO::
        this.el.innerHTML = null;
        this.el = null;
        this.options = null;
    }
}

window.UpSlide = UpSlide;
