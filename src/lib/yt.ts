let pending: Promise<unknown> | null = null;

export function loadYt(): Promise<unknown> {
  if (!pending) {
    pending = new Promise((resolve) => {
      const w = window as unknown as {
        YT?: { Player?: unknown };
        onYouTubeIframeAPIReady?: () => void;
      };
      if (w.YT && w.YT.Player) {
        resolve(w.YT);
        return;
      }
      w.onYouTubeIframeAPIReady = () => resolve(w.YT);
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }
  return pending;
}
