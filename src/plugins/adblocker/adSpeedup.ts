const playerSelector = ".player-wrapper.ytmusic-player";
const skipButtonSelector = "button.ytp-ad-skip-button-modern";
const adShowingSelectors = [
  "ad-showing",
  "ad-interrupting"
]

function skipAd(target: Element) {
  const skipButton = target.querySelector<HTMLButtonElement>(
    skipButtonSelector
  );
  if (skipButton) {
    skipButton.click();
  }
}

function isAdShowing(element: Element): boolean {
  for (const selector of adShowingSelectors) {
    if (element.classList.contains(selector)) return true;
  }
  return false;
}

function speedUpAndMute(player: Element, isAdShowing: boolean) {
  const video = player.querySelector<HTMLVideoElement>('video');
  if (!video) return;
  if (isAdShowing) {
    if (video.paused) {
      video.play();
    }
    video.playbackRate = 16;
    video.muted = true;
  } else if (!isAdShowing) {
    video.playbackRate = 1;
    video.muted = false;
  }
}

export const loadAdSpeedup = () => {
  const player = document.querySelector<HTMLDivElement>(playerSelector);
  if (!player) return;

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
        const target = mutation.target as HTMLElement;

        speedUpAndMute(target, isAdShowing(target));
      }
      if (
        mutation.type === 'childList' &&
        mutation.addedNodes.length &&
        mutation.target instanceof HTMLElement
      ) {
        skipAd(mutation.target);
      }
    }
  }).observe(player, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  speedUpAndMute(player, isAdShowing(player));
  skipAd(player);
};