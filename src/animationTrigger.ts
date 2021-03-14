export function registerAnimationTriggers(): void {
    const options: IntersectionObserverInit = {
        threshold: 0.5
    };

    const intersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
            if (!entry.isIntersecting) {
                return;
            }
            const element = <HTMLElement>entry.target;
            element.style.animationPlayState = "unset";
            observer.unobserve(entry.target);
        });
    }, options);

    const elements: HTMLElement[] = Array.prototype.slice.call(document.querySelectorAll("body *"));

    elements.forEach((element: HTMLElement) => {
        const styles = getComputedStyle(element);

        if (styles.animationPlayState === "paused") {
            intersectionObserver.observe(element);
        }
    });
}