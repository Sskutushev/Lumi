declare global {
  interface Window {
    ym: (counterId: number, method: string, ...params: any[]) => void;
  }
}

export const initYandexMetrika = (counterId: string) => {
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],
    k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  if (window.ym) {
    window.ym(counterId, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
    });
  }
};

export const trackEvent = (event: string, params?: object) => {
  const counterId = import.meta.env.VITE_YM_COUNTER_ID;
  if (counterId && window.ym) {
    window.ym(counterId, 'reachGoal', event, params);
  }
};

export const trackPageView = (url?: string) => {
  const counterId = import.meta.env.VITE_YM_COUNTER_ID;
  if (counterId && window.ym) {
    window.ym(counterId, 'hit', url || window.location.href);
  }
};