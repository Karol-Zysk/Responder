const express = require("express");
const { urlencoded, json } = require("body-parser");
const makeRepositories = require("./middleware/repositories");
const errorMiddleware = require("./middleware/errorMiddleware");
const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");

const STORAGE_FILE_PATH = "questions.json";
const PORT = 3000;

const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(makeRepositories(STORAGE_FILE_PATH));

app.get("/", (_, res) => {
  res.json({ message: "Welcome to responder!" });
});

app.get(
  "/questions",
  catchAsync(async (req, res) => {
    const questions = await req.repositories.questionRepo.getQuestions();
    res.json(questions);
  })
);

app.get(
  "/questions/:questionId",
  catchAsync(async (req, res) => {
    const questionId = req.params.questionId;
    const question = await req.repositories.questionRepo.getQuestionById(
      questionId
    );

    res.json(question);
  })
);

app.post(
  "/questions",
  catchAsync(async (req, res) => {
    const newQuestion = await req.repositories.questionRepo.addQuestion(
      req.body
    );
    res.status(201).json(newQuestion);
  })
);

app.get(
  "/questions/:questionId/answers",
  catchAsync(async (req, res) => {
    const answers = await req.repositories.questionRepo.getAnswers(
      req.params.questionId
    );
    res.status(200).json(answers);
  })
);

app.post(
  "/questions/:questionId/answers",
  catchAsync(async (req, res) => {
    const newAnswer = await req.repositories.questionRepo.addAnswer(
      req.params.questionId,
      req.body
    );
    res.status(201).json(newAnswer);
  })
);

app.get(
  "/questions/:questionId/answers/:answerId",
  catchAsync(async (req, res) => {
    const { questionId, answerId } = req.params;
    const answer = await req.repositories.questionRepo.getAnswer(
      questionId,
      answerId
    );
    res.status(200).json(answer);
  })
);

app.all("*", (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server`));
});
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`);
});
