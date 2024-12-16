(async function () {
  const localPlayer = document.getElementById('player');

  // 1. Uzyskaj dostęp do urządzeń
  //
  // Wystarczyłoby do `getUserMedia` podać `{audio: true, video: true}`,
  // ale w tym przypadku przekazaliśmy też dodatkowe ograniczenia na przesyłane media:
  //  - wideo: preferowana rozdzielczość 1280x720
  //  - audio: włączone tłumienie szumu i autoregulacja wzmocnienia, wyłączone niwelowanie echa
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 1280,
      height: 720
    },
    audio: {
      echoCancellation: false,
      autoGainControl: true,
      noiseSuppression: true,
    },
  });

  // 2. Wyświetl otrzymany stream w elemencie wideo
  localPlayer.srcObject = localStream;
})();
