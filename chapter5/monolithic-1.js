const http = require('http');
const url = require('url');
const querystring = require('querystring');

var server = http.createServer((req, res) => {
    var method = req.method;
    var uri = url.parse(req.url, true);
    var pathname = uri.pathname;

    if (method === "POST" || method === "PUT") {                        //1. POST�� PUT�ϰ�� �����͸� ����
        var body = "";

        req.on('data', function (data) {                                
            body += data;
        });
        req.on('end', function () {
            var params;
            if (req.headers['content-type'] == "application/json") {        //2. ��������� json�� ��� ó��
                params = JSON.parse(body);
            } else {
                params = querystring.parse(body);
            }

            onRequest(res, method, pathname, params);
        });
    } else {
        onRequest(res, method, pathname, uri.query);                    //3. GET�� DELETE�� ��� query������ ����
    }
}).listen(8000);

function onRequest(res, method, pathname, params) {
    res.end("response!");                                           //4. ��� ��û�� ���� "response!"�� �޼����� ����
}
