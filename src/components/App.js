import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";

const initialState = {
  questions: [],
  //loading,error,ready,active,finished
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };
    case "dataFailed":
      return {
        ...state,
        status: "error",
      };
    case "start":
      return { ...state, status: "active" };
    case "newAnswer":
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return { ...state, status: "ready", index: 0, answer: null, points: 0 };
    default:
      throw new Error("action unknow");
  }
}

function App() {
  const [{ questions, status, index, answer, points, highscore }, dispatch] =
    useReducer(reducer, initialState);
  const numQustions = questions.length;
  const maxPossiblePoints =
    questions.length > 0
      ? questions.reduce((prev, cur) => prev + cur.points, 0)
      : 0;
  //   https://wendy2022.github.io/mock-data/questions.json payload:data.questions
  //http://localhost:8000/questions  json-server automatically set the json title to route. payload:data
  useEffect(function () {
    fetch("https://wendy2022.github.io/mock-data/questions.json")
      .then((res) => res.json())
      .then((data) => {
        //    console.log(data);
        dispatch({ type: "dataReceived", payload: data.questions });
      })
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);
  return (
    <div className="app">
      <Header></Header>

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQustions={numQustions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQustions={numQustions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />

            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />

            <NextButton
              dispatch={dispatch}
              answer={answer}
              index={index}
              numQuestions={numQustions}
            ></NextButton>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}

export default App;
