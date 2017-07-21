/* global clients */

const messageToAll = msg => {
  self.clients.matchAll().then(allClients => {
    allClients.forEach(client => {
      messageToClient(client, msg).then(m => console.log(`SW Received Message: ${m}`));
    });
  });
};

function messageToClient(client, msg) {
  return new Promise((resolve, reject) => {
    const msgChannel = new MessageChannel();
    msgChannel.port1.onmessage = event => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    client.postMessage(`SW Says: ${msg}`, [msgChannel.port2]);
  });
}

const sendMessageToClient = (client, msg) => {
  return new Promise((resolve, reject) => {
    const msgChan = new MessageChannel();

    msgChan.port1.onmessage = event => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    client.postMessage(`SW Says: ${msg}`, [msgChan.port2]);
  });
};

self.addEventListener('message', event => {
  // event.source.postMessage("Responding to " + event.data);
  self.clients.matchAll().then(all => all.forEach(client => {
    client.postMessage(`Responding to ${event.data}`);
  }));
});

self.onnotificationclick = event => {
  // TODO window is not defined
  console.log('On notification click: ', event.action, clients);
  console.log(clients, event);

  event.waitUntil(clients.matchAll({
    includeUncontrolled: true, type: 'all'
  }).then(clientList => {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      // TODO: remove hardcode
      console.log('client.url', client.url);
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));

  self.clients.matchAll().then(all => all.forEach(client => {
    client.postMessage(`Responding to ${event.data}`);
  }));
};

self.addEventListener('message', event => {
  const sender = (event.ports && event.ports[0]) || event.source;
  sender.postMessage('Here are your queued notifications!');
});

