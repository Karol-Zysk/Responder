const { readFile, writeFile } = require("fs/promises");
const uuid = require("uuid");
const AppError = require("../utils/appError");

const makeQuestionRepository = (fileName) => {
  const getQuestions = async () => {
    try {
      const fileContent = await readFile(fileName, { encoding: "utf-8" });
      const questions = JSON.parse(fileContent);
      return questions;
    } catch (err) {
      throw new AppError(500, `Error reading from file: ${err.message}`);
    }
  };

  const getQuestionById = async (questionId) => {
    const questions = await getQuestions();
    const question = questions.find((x) => x.id === questionId);

    if (!question) throw new AppError(404, "No Question with this Id");

    return question;
  };

  const addQuestion = async (questionData) => {
    const { summary, author } = questionData;
    const id = uuid.v4();

    if (!author || typeof author !== "string")
      throw new AppError(400, "Invalid or missing author");
    if (!summary || typeof summary !== "string")
      throw new AppError(400, "Invalid or missing summary");

    const questions = await getQuestions();

    const newQuestion = { id, summary, author, answers: [] };
    questions.push(newQuestion);

    await writeFile(fileName, JSON.stringify(questions), {
      encoding: "utf-8",
    }).catch((err) => {
      throw new AppError(500, `Error writing to file: ${err.message}`);
    });

    return newQuestion;
  };

  const getAnswers = async (questionId) => {
    const questions = await getQuestions();
    const question = questions.find((q) => q.id === questionId);

    if (!question) throw new AppError(404, "No Question with this id");

    return question.answers;
  };

  const getAnswer = async (questionId, answerId) => {
    const answers = await getAnswers(questionId);
    const answer = answers.find((x) => x.id === answerId);

    if (!answer) throw new AppError(404, "No Answer with this id");

    return answer;
  };

  const addAnswer = async (questionId, answerData) => {
    const { summary, author } = answerData;
    const id = uuid.v4();

    if (!author || typeof author !== "string")
      throw new AppError(400, "Invalid or missing author");
    if (!summary || typeof summary !== "string")
      throw new AppError(400, "Invalid or missing summary");

    const questions = await getQuestions();
    const questionIndex = questions.findIndex((q) => q.id === questionId);

    if (questionIndex === -1)
      throw new AppError(404, "No Question with this id");

    const newAnswer = { id, author, summary };
    questions[questionIndex].answers.push(newAnswer);

    await writeFile(fileName, JSON.stringify(questions), {
      encoding: "utf-8",
    }).catch((err) => {
      throw new AppError(500, `Error writing to file: ${err.message}`);
    });

    return questions[questionIndex].answers.find((x) => x.id === id);
  };

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer,
  };
};

module.exports = { makeQuestionRepository };
