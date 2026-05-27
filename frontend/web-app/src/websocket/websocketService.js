import SockJS from "sockjs-client";

import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (

  documentId,

  onMessageReceived

) => {

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

      stompClient.subscribe(

        `/topic/document/${documentId}`,

        (message) => {

          const body =
            JSON.parse(message.body);

          onMessageReceived(body);
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

export const disconnectWebSocket = () => {

  if (stompClient) {

    stompClient.deactivate();
  }
};