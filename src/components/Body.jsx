import "./Body.css"; // CSS 파일을 import합니다.
// JSX 주의사항
//1. 중괄호 내부에는 자바스크립트 표현식만 넣을 수 있다.
//2. 숫자, 문자열, 배열 값만 렌더링 된다.
//3. 모든 태그는 닫혀있어야 한다.
//4. 최상위 태그는 반드시 하나여야만 한다.

const Main = () => {
  return (
    <main>
      <h1 className="body">SSH Terminal</h1>
      <div id="terminal">
        
      </div>
    </main>
  );
};

export default Main;
