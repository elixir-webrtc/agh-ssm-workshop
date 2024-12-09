let pc;

const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');
const button = document.getElementById('button');
button.onclick = start;

// 1. Uzupełnij nr swojej grupy
const groupId = 1;

// Setup signaling socketu
const sock = connectSignaling(groupId);
sock.addEventListener("message", (msg) => {
  const data = JSON.parse(msg.data);
  switch(data.type) {
    case 'answer':
      handleAnswer(data);
      break;
    case 'candidate':
      handleCandidate(data);
      break;
    default:
      break;
  }
})

// 2. Gdy otrzymasz od drugiej strony kandydata, dodaj go do swojego pc
async function handleCandidate(candidate) {
  if (candidate.candidate == null) {
    await pc.addIceCandidate(null);
  } else {
    await pc.addIceCandidate(candidate);
  }
}

// 3. Gdy otrzymasz odpowiedź, zaaplikuj ją
async function handleAnswer(answer) {
  await pc.setRemoteDescription(answer);
}

async function init() {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  pc = new RTCPeerConnection();

  pc.onicecandidate = (ev) => {
    // 4. Gdy wygenerujemy kandydata, przekaż go drugiej stronie
    const msg = candidateEventToMsg(ev);
    sock.send(msg);
  };

  pc.ontrack = (ev) => {
    remotePlayer.srcObject = ev.streams[0];
  };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
}

// 5. Po kliknięciu  przycisku `Start`:
async function start() {
  // 5.1. Wygeneruj ofertę i zaaplikuj ją
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // 5.2. Przekaż ofertę drugiej stronie
  const offerMsg = offerToMsg(offer);
  sock.send(offerMsg);
}

init();


// Funkcje pomocnicze

function connectSignaling(id) {
  const sock = new WebSocket(`wss://bigfish.jellyfish.ovh/signaling/${id}`);
  sock.addEventListener("open", () => {
    console.log(`Signaling socket open (server ${id})`);
  });

  return sock;
}

function offerToMsg(offer) {
  return JSON.stringify({
    type: 'offer',
    sdp: offer.sdp
  })
}

function answerToMsg(answer) {
  return JSON.stringify({
    type: 'answer',
    sdp: answer.sdp
  })
}

function candidateEventToMsg(event) {
  const message = {
    type: 'candidate',
    candidate: null,
  };

  if (event.candidate) {
    message.candidate = event.candidate.candidate;
    message.sdpMid = event.candidate.sdpMid;
    message.sdpMLineIndex = event.candidate.sdpMlineIndex;
  }

  return JSON.stringify(message);
}
