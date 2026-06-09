import SockJS from "sockjs-client";

import { Client }

  from "@stomp/stompjs";

let stompClient = null;

/*
    CONNECT
*/

export const connectWebSocket = (documentId, onDocumentUpdate, onPresenceUpdate, onTypingUpdate) => {

  const socket = new SockJS(

    "http://localhost:8083/ws"
  );

  stompClient = new Client({

    webSocketFactory: () => socket,

    reconnectDelay: 5000,

    onConnect: () => {

      console.log(
        "Connected to WebSocket"
      );

      /*
          DOCUMENT CHANGES
      */

      stompClient.subscribe(

        `/topic/document/${documentId}`,

        (message) => {

          const body =
            JSON.parse(message.body);

          onDocumentUpdate(body);
        }
      );

      /*
          PRESENCE UPDATES
      */

      stompClient.subscribe(

        `/topic/presence/${documentId}`,

        (message) => {

          const body =
            JSON.parse(message.body);

          onPresenceUpdate(body);
        }
      );
      stompClient.subscribe(

        `/topic/typing/${documentId}`,

        (message) => {

          const body =
            JSON.parse(message.body);

          onTypingUpdate(body);
        }
      );
    },

    onStompError: (frame) => {

      console.error(
        "STOMP Error:",
        frame
      );
    },
  });

  stompClient.activate();
};

/*
    SEND EDIT
*/

export const sendDocumentChange = (

  message

) => {

  if (
    stompClient &&
    stompClient.connected
  ) {

    stompClient.publish({

      destination:
        "/app/document.edit",

      body: JSON.stringify(message),
    });
  }
};

/*
    JOIN DOCUMENT
*/

export const joinDocument = (

  message

) => {

  if (
    stompClient &&
    stompClient.connected
  ) {

    stompClient.publish({

      destination:
        "/app/document.join",

      body: JSON.stringify(message),
    });
  }
};

/*
    LEAVE DOCUMENT
*/

export const leaveDocument = (

  message

) => {

  if (
    stompClient &&
    stompClient.connected
  ) {

    stompClient.publish({

      destination:
        "/app/document.leave",

      body: JSON.stringify(message),
    });
  }
};

/*
    DISCONNECT
*/

export const disconnectWebSocket = () => {

  if (stompClient) {

    stompClient.deactivate();
  }
};

export const sendTypingEvent = (

  typingMessage

) => {

  if (
    stompClient &&
    stompClient.connected
  ) {

    stompClient.publish({

      destination:
        "/app/document.typing",

      body: JSON.stringify(
        typingMessage
      ),
    });
  }
};