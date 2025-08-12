const express = require("express"); // express 모듈
const http = require("http");
const { Client } = require("ssh2"); // ssh모듈
const SocketIO = require("socket.io");
const path = require("path"); // 경로 모듈
const app = express();
const server = http.createServer(app);
const io = SocketIO(server);

const linux = {
  host: "192.168.105.131",
  port: 22,
  username: "hjg",
  password: "1234",
};
// Express메서드로 "/" 경로로 접속한 클라이언트에게 파일을 직접 서빙
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "App.jsx"));
}); // 클라이언트가 접속할 때 제공할 HTML 파일 경로

io.on("connection", (socket) => {
  console.log("클라이언트 접속", socket.id); // 클라이언트가 접속했을 때 로그 출력, 접속할 때마다 새로운 소켓id가 생성됨

  const conn = new Client(); // ssh2 모듈의 Client 클래스를 사용하여 SSH 클라이언트 인스턴스를 생성
  let currentStream = null; // 현재 스트림을 저장할 변수 선언

  conn.on("ready", () => {
    // SSH 연결이 성공하면 실행
    console.log("SSH 연결 완료");
    socket.emit("status", "SSH 연결 완료"); // SSH 연결이 완료되면 클라이언트에 상태 메시지 전송

    conn.shell((err, stream) => {
      // SSH 서버에 셸을 열고 스트림을 가져옴
      if (err) {
        socket.emit("error", "shell 시작 오류:" + err.message); //오류가 발생하면 클라이언트에 오류 메시지 전송
        return;
      }
      currentStream = stream; // 현재 스트림을 저장

      //서버에서 오는 데이터를 클라이언트로 전송
      stream.on("data", (data) => {
        socket.emit("output", data.toString());
      });

      //오류 출력 스트림, stderr은 쉘에서 발생하는 에러 메세지는 stderr 스트림을 통해 출력된다
      stream.stderr.on("data", (data) => {
        socket.emit("error", data.toString()); //에러 메세지를 클라이언트로 전송
      });

      // 클라이언트에서 명령어를 보내면 실행
      socket.on("command", (command) => {
        if (currentStream && !currentStream.destroyed) {
          // 스트림이 존재하는지 확인하고 아직 파괴되지 않았는지 확인
          currentStream.write(command + "\n"); // ssh shell에 명령어 전달
        }
      });

      socket.on("close", () => {
        console.log("ssh 스트림 종료");
        socket.emit("status", "SSH 스트림 종료"); // 클라이언트가 연결을 종료하면 스트림을 종료
      });

      socket.on("error", () => {
        console.log("ssh 연결 오류" + err.message);
        socket.emit("error", "ssh 연결 오류" + err.message); // 에러가 발생하면 클라이언트에 전달
      });

      socket.on("disconnect", () => {
        console.log("클라이언트 연결 종료", socket.id);
        if (currentStream) {
          // 현재 스트림이 존재하면
          currentStream.end(); // SSH 스트림 종료
        }
        conn.end();
      });
    });
  });
  conn.connect(linux); // SSH 서버에 연결
});
server.listen(3000, () => {
  console.log("서버가 3000 포트에서 실행");
});
