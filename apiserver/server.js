var request = require('request');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    host: '0.0.0.0',
    port: 8080
});

var d = {};

//ヘッダーを定義
var headers = {
    'Content-Type': 'application/json'
};

//オプションを定義
var options = {
    url: 'https://www6.arche.blue/api/v1/c59ebf7864cb61/edge',
    method: 'POST',
    headers: headers,
    json: true,
};

connect();
wss.on('connection', function (ws) {
    // console.log(connect());

    ws.on('message', function (message) {
        // console.log('received: %s', message);
        // const result = connect(message);
        ws.send(send(message));
    });
});

function connect() {
    request(options, function (error, response, body) {
        d.edge_id = response.body.edge_id;

        const option2 = {
            url: `https://www6.arche.blue/api/v1/c59ebf7864cb61/edge/${response.body.edge_id}`,
            method: 'GET',
            headers: headers,
            json: true
        };


        const req = () => {
            request(option2, function (error, response2, body) {
                if (!response2.body.ready) {
                    req();
                } else {
                    d.ip_address = response2.body.ip_address;

                    const option3 = {
                        url: `http://${d.ip_address}/sounddetect/v1/c59ebf7864cb61/edge/${d.edge_id}`,
                        method: 'GET',
                        headers: headers,
                        json: true
                    };

                    request(option3, function (error, response3, body) {
                        d.session = response3.body.session;
                    });
                }
            })
        };

        req();
    });
}

function send(message) {
    const option4 = {
        url: `http://${d.ip_address}/sounddetect/v1/c59ebf7864cb61/edge/${d.edge_id}/session/${d.session}`,
        method: 'POST',
        headers: headers,
        json: true,
        post: {data: message}
    };
    request(option4, function (error, response4, body) {
        const option5 = {
            url: `http://${d.ip_address}/v1/c59ebf7864cb61/event`,
            method: 'GET',
            headers: headers,
            json: true
        };
        // console.log(response4);
        request(option5, function (error, response5, body) {
            console.log(response5);
            return response5;
        });
    });
}