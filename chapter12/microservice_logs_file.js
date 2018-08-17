
'use strict';

const cluster = require('cluster');                     // Cluster 모듈 로드
const fs = require('fs');                               // fs 모듈 로드

class logs extends require('./server.js') {
    constructor() {
        super("logs"
            , process.argv[2] ? Number(process.argv[2]) : 9040
            , ["POST/logs"]
        );

        this.writestream = fs.createWriteStream('./log.txt', { flags: 'a' }); // writestream 생성

        this.connectToDistributor("127.0.0.1", 9000, (data) => {
            console.log("Distributor Notification", data);
        });
    }

    onRead(socket, data) {
        const sz = new Date().toLocaleString() + '\t' + socket.remoteAddress + '\t' + socket.remotePort + '\t' + JSON.stringify(data) + '\n';
        console.log(sz);
        this.writestream.write(sz);                     // 로그 파일 저장
    }
}

if (cluster.isMaster) {                                 // 자식 프로세스 실행
    cluster.fork();

    cluster.on('exit', (worker, code, signal) => {      // Exit 이벤트 발생시 새로운 자식프로세스 실행
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    new logs();
}
