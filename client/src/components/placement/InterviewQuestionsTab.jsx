import QuestionList from "./QuestionList";

const InterviewQuestionsTab = ({ company }) => {
  return (
    <div>
      <QuestionList company={company} type="interview" />
    </div>
  );
};

export default InterviewQuestionsTab;
