import { useState, useEffect, useRef } from "react";
import "./Body.css"; // CSS 파일을 import합니다.
import stripAnsi from "strip-ansi"; // ANSI escape 코드 제거를 위한 라이브러리 import

const Body = ({ output, setOutput, command, setCommand, socket }) => {
  const inputRef = useRef(null); //입력창
  const terminalRef = useRef(null); //터미널
  const [prompt, setPrompt] = useState("$"); //동적 프롬포트

  const focusInput = () => inputRef.current?.focus(); // 입력창에 포커스 함수
  //inputRef.current가 null 또는 undefined가 아닐 때만 focus() 메서드를 호출

  useEffect(() => {
    focusInput(); // 컴포넌트가 마운트될 때 입력창에 포커스
    const onClick = () => focusInput(); // 클릭 시 입력창에 포커스
    document.addEventListener("click", onClick);

    return () => document.removeEventListener("click", onClick); // 컴포넌트 언마운트 시 이벤트 리스너 제거
  }, []);

  command.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      socket.emit("command", command); // Enter 키를 누르면 서버로 명령어 전송
      setOutput((prev) => prev + `${prompt} ${command}\n`); //
      setCommand(""); // 명령어 입력 후 입력창 비우기
    }
    setTimeout(focusInput, 50);
  });

  useEffect(() => {
    if (socket) {
      socket.on("output", (data) => {
        const cleanData = stripAnsi(data); // 제어 문자 제거
        setOutput((prev) => prev + cleanData); // 서버에서 받은 데이터를 출력 영역에 추가
      });
      socket.on("error", (msg) => {
        setOutput((prev) => prev + `[ERROR] ${msg}\n`);
      });
      socket.on("status", (msg) => {
        setOutput((prev) => prev + `[STATUS] ${msg}\n`);
      });
      return () => {
        socket.off("output"); // 컴포넌트 언마운트 시 소켓 이벤트 해제
        console.log("소켓 해제"); // 소켓 해
      };
    }
  }, [socket, setOutput]);
  //의존성 배열
  //무엇을 넣느냐에 따라 useEffect가 언제 실행될지 결정된다.
  //deps
  return (
    <body>
      <input type="text" />

      <h1 className="body">SSH Terminal</h1>
      <div id="terminal"></div>
    </body>
  );
};

export default Body;
