let pc;

const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');
const button = document.getElementById('button');
button.onclick = start;

// 1. Uzupełnij nr swojej grupy
const groupId = undefined;

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

// 3. Gdy otrzymasz od drugiej strony kandydata, dodaj go do swojego pc
async function handleCandidate(candidate) {
}

// 6. Gdy otrzymasz odpowiedź, zaaplikuj ją
async function handleAnswer(answer) {
}

async function init() {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  pc = new RTCPeerConnection();

  pc.onicecandidate = (ev) => {
    // 2. Gdy wygenerujemy kandydata, przekaż go drugiej stronie
  };

  pc.ontrack = (ev) => {
    remotePlayer.srcObject = ev.streams[0];
  };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
}

// 4. Po kliknięciu  przycisku `Start`:
async function start() {
  // 4.1. Wygeneruj ofertę i zaaplikuj ją

  // 4.2. Przekaż ofertę drugiej stronie
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
