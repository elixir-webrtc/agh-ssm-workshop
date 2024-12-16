import { FishjamClient, TrackContext } from '@fishjam-cloud/ts-client';

const usernameInput = document.getElementById('usernameInput')! as HTMLInputElement;
const button = document.getElementById('button')!;
const localUsername = document.getElementById('localUsername')!;
const localPlayer = document.getElementById('localPlayer')! as HTMLVideoElement;
const videoContainers = document.getElementById('videoContainers')!;

button.onclick = connect;

// Typ metadanych peera, którego będziemy używać
//     W metadanych można używać własnych typów, jeżeli tylko są serializowalne
type PeerMetadata = {
  name: string;
};

// Główny token Fishjam Cloud używany do tworzenia peerTokenów
const FISHJAM_CLOUD_TOKEN = '79cefca530b24f6e82e01f8a57dbc721';

// Zapasowy token -- gdyby coś nie działało :)
// const FISHJAM_CLOUD_TOKEN = '5ca6fc07ebab4ccaa57086fa9ffa4447';

// Nazwa pokoju -- zmiana spowoduje dorzucenie Cię do innego pokoju niż pozostali
const ROOM_NAME = 'super-fun-room';


// Funkcja wywoływana po wciśnięciu przycisku "Join room"
async function connect() {
  // Odczytaj `username` z inputu
  const username = `${usernameInput.value}`;
  if (username === '') {
    return console.error("Error: Room name and username cannot be empty");
  }

  // Podpisz kafelek z naszym wideo
  localUsername.textContent = `${username} (You)`;

  // Wygeneruj dla siebie `peerToken`, którego użyjesz do podłączenia się do pokoju
  //     Korzystamy tu z API do developmentu i testowania --
  //     jeżeli pisalibyśmy pełnoprawną aplikację do wideokonferencji,
  //     zarządzanie `peerToken`ami byłoby zadaniem logiki biznesowej backendu
  //        (i odbywałoby się przy użyciu serwerowego SDK).
  const response = await fetch(
    `https://cloud.fishjam.work/api/v1/connect/${FISHJAM_CLOUD_TOKEN}/room-manager/?roomName=${ROOM_NAME}&peerName=${username}`
  );
  if (response.status !== 200) {
    return console.error("Error: failed to create peer token", response);
  }
  console.log(`Generated peer token for user ${username}, room ${ROOM_NAME}`);

  // Odczytaj token i URL pokoju z odpowiedzi
  const { peerToken: token, url: url } = await response.json();

  const client = new FishjamClient<PeerMetadata>();

  /////////////////////////////////////////////////////////////////////////////
  // TWOJA KOLEJ
  // 1. Połącz się z serwerem Fishjam
  //      - użyj `peerToken` i `url` odczytanych wyżej
  //      - wykorzystaj pole `peerMetadata`, by poinformować innych o swoim `username`
  //          (hint: zrób obiekt pasujący do typu zdefiniowanego w linii 13.)
  client.connect({
    peerMetadata: { name: username },
    token: token,
    url: url,
  });

  // 2. Zaimplementuj handler eventu `joined`, emitowanego po poprawnym dołączeniu do pokoju
  client.on('joined', async (_peerId, _peersInRoom) => {
    // 2.1. Uzyskaj stream z kamery (tylko wideo, bez audio)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });

    // 2.2. Ustaw stream jako źródło dla `localPlayer`
    localPlayer.srcObject = stream;

    // 2.3. Poinformuj `client`, że chciałbyś przesłać track wideo znajdujący się w streamie
    stream.getTracks().forEach((track) => client.addTrack(track));

  });

  // 3. Zaimplementuj handler eventu `trackReady`, emitowanego w momencie, gdy zdalny track stanie się gotowy do odtworzenia
  //      (~= gdy ktoś dołączy do rozmowy)
  client.on('trackReady', createVideoTile);

  // 4. Zaimplementuj handler eventu `trackRemoved`, emitowanego po usunięciu zdalnego tracka
  //      (~= gdy ktoś odłączy się z rozmowy)
  client.on('trackRemoved', removeVideoTile);

  /////////////////////////////////////////////////////////////////////////////
}


// Funkcje pomocnicze

// Stwórz nowy kafelek i dodaj go do grida
function createVideoTile(ctx: TrackContext) {
  // `peerId` to identyfikator peera generowany przez serwer Fishjam
  //   Ma postać UUID, więc nie ma po co go wyświetlać,
  //   ale świetnie się nada jako `id` kafelka, który tworzymy
  const peerId = ctx.endpoint.id;
  document.getElementById(peerId)?.remove(); // Usuń poprzedni kafelek (jeśli istnieje)

  // Stwórz nowego `div`a na element wideo i nazwę użytkownika
  const newVideoContainer = document.createElement('div');
  newVideoContainer.style.padding = '2px';
  newVideoContainer.id = peerId;

  // Stwórz nowy element wideo i przypnij do niego stream
  const videoPlayer = document.createElement('video');
  videoPlayer.oncanplaythrough = function () {
    // Chrome domyślnie blokuje autoodtwarzanie niewyciszonego wideo
    videoPlayer.muted = true;
    videoPlayer.play();
  };
  videoPlayer.srcObject = ctx.stream;
  newVideoContainer.appendChild(videoPlayer);

  // Podpisz kafelek nazwą użytkownika przesłaną w metadanych
  const label = document.createElement('p');
  label.textContent = "(Unknown name)";
  if (ctx.endpoint.metadata) {
    const metadata = (ctx.endpoint.metadata as any);
    if (metadata.peer && metadata.peer.name) {
      label.textContent = metadata.peer.name;
    }
  }
  newVideoContainer.appendChild(label);

  // Dodaj nowy element do grida
  videoContainers.appendChild(newVideoContainer);
}

// Usuń kafelek z grida
function removeVideoTile(ctx: TrackContext) {
  const peerId = ctx.endpoint.id;
  document.getElementById(peerId)?.remove();
}
