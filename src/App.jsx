import "./App.css";
import Body from "./components/Body.jsx"; // Body 컴포넌트를 import합니다.
import { useState, useEffect } from "react"; //
import io from "socket.io-client"; // socket.io 클라이언트 라이브러리 import

function App() {
  const [output, setOutput] = useState(""); //text로 받을 데이터 상태
  //output 상태는 서버에서 오는 데이터를 저장하는 용도로 사용
  //setOutput 함수는 output 상태를 업데이트하는 함수
  const [command, setCommand] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:3000"); // 서버와 연결
    setSocket(socket);
    return () => {
      socket.disconnect(); // 컴포넌트 언마운트 시 소켓 연결 해제
      console.log("소켓 연결 해제");
    };
  }, []); // [] 컴포넌트가 마운트될 때 한 번만 실행
  return (
    <div className="app">
      <Body // Body 컴포넌트를 추가하여
        output={output} // Body 컴포넌트에 output 상태를 전달
        setOutput={setOutput} // Body 컴포넌트에 setOutput 함수를 전달
        command={command}
        setCommand={setCommand}
        socket={socket}
      />
    </div>
  );
}

export default App;
