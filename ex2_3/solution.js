const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');
(async function () {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  // 1. Utwórz dwie instancje RTCPeerConnection
  //    pc1 będzie nadawać stream, pc2 wyłącznie go odbierać
  const pc1 = new RTCPeerConnection();
  const pc2 = new RTCPeerConnection();

  // 2. Zaimplementuj w obu PC `onicecandidate` tak, by przekazywały sobie nawzajem swoich kandydatów
  pc1.onicecandidate = async (ev) => {
    await pc2.addIceCandidate(ev.candidate);
  };
  pc2.onicecandidate = async (ev) => {
    await pc1.addIceCandidate(ev.candidate);
  };

  // 3. Zaimplementuj w pc2 callback `ontrack`, by przypiąć otrzymany stream do elementu wideo `remotePlayer`
  pc2.ontrack = (ev) => {
    remotePlayer.srcObject = ev.streams[0];
  };

  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

  const offer = await pc1.createOffer();
  await pc1.setLocalDescription(offer);

  // 4. Zaaplikuj ofertę w pc2
  await pc2.setRemoteDescription(offer);

  // 5. Utwórz i zaaplikuj odpowiedź w pc2
  const answer = await pc2.createAnswer();
  await pc2.setLocalDescription(answer);

  // 6. Zaaplikuj odpowiedź w pc1
  await pc1.setRemoteDescription(answer);
})();
