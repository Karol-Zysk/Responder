const { writeFile, rm } = require("fs/promises");
const { faker } = require("@faker-js/faker");
const { makeQuestionRepository } = require("./question");
const AppError = require("../utils/appError");

describe("question repository", () => {
  const TEST_QUESTIONS_FILE_PATH = "test-questions.json";
  let questionRepo;
  let testQuestions;

  beforeAll(async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]));

    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH);
  });

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH);
  });

  test("should return a list of 0 questions", async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0);
  });

  test("should return a list of 2 questions", async () => {
    testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What kind of Bear is best?",
        author: "Jim Halpert",
        answers: [
          {
            author: "Dwight Shrut",
            summary: "Tricky question",
          },
          {
            author: "Jim Halpert",
            summary: "Black Bear",
          },
        ],
      },
      {
        id: faker.datatype.uuid(),
        summary: "Who are you?",
        author: "Tim Doods",
        answers: [],
      },
    ];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));

    expect(await questionRepo.getQuestions()).toHaveLength(2);
  });

  describe("getQuestionById", () => {
    test("should return the correct question for a given id", async () => {
      const testQuestion = testQuestions[0];
      const question = await questionRepo.getQuestionById(testQuestion.id);
      expect(question).toEqual(testQuestion);
    });

    test("should throw an error for a non-existing id", async () => {
      const nonExistingId = faker.datatype.uuid();
      await expect(questionRepo.getQuestionById(nonExistingId)).rejects.toThrow(
        AppError
      );
    });
  });
  describe("addQuestion", () => {
    test("should add a question and return it", async () => {
      const newQuestionData = {
        summary: "What kind of Bear is best?",
        author: "Jim Halpert",
      };
      const newQuestion = await questionRepo.addQuestion(newQuestionData);
      expect(newQuestion.summary).toEqual(newQuestionData.summary);
      expect(newQuestion.author).toEqual(newQuestionData.author);
    });

    test("should throw an error when author or summary is invalid", async () => {
      const invalidQuestionData = {
        summary: 1234,
        author: "Creed Branton",
      };
      await expect(
        questionRepo.addQuestion(invalidQuestionData)
      ).rejects.toThrow(AppError);
    });
  });

  describe("getAnswers", () => {
    test("should return answers for a given question id", async () => {
      const questionId = testQuestions[0].id;
      const answers = await questionRepo.getAnswers(questionId);
      expect(answers).toEqual(testQuestions[0].answers);
    });

    test("should throw an error for a non-existing question id", async () => {
      const nonExistingId = faker.datatype.uuid();
      await expect(questionRepo.getAnswers(nonExistingId)).rejects.toThrow(
        AppError
      );
    });
  });

  describe("addAnswer", () => {
    test("should add an answer to the question and return the added answer", async () => {
      const questionId = testQuestions[0].id;
      const newAnswerData = {
        summary: "This is a new answer",
        author: "Jane Doe",
      };

      const newAnswer = await questionRepo.addAnswer(questionId, newAnswerData);

      expect(newAnswer).toMatchObject(newAnswerData);
    });

    test("should throw an error when author or summary is invalid", async () => {
      const questionId = testQuestions[0].id;
      const invalidAnswerData = {
        summary: 123,
        author: "Creed Branton",
      };

      await expect(
        questionRepo.addAnswer(questionId, invalidAnswerData)
      ).rejects.toThrow(AppError);
    });

    test("should throw an error when questionId is invalid", async () => {
      const invalidQuestionId = faker.datatype.uuid();
      const validAnswerData = {
        summary: "That's what she said",
        author: "Michael Scott",
      };

      await expect(
        questionRepo.addAnswer(invalidQuestionId, validAnswerData)
      ).rejects.toThrow(AppError);
    });
  });

  describe("getAnswer", () => {
    test("should return the correct answer for a given id", async () => {
      const questionId = testQuestions[0].id;
      const answerId = testQuestions[0].answers[0].id;
      const answer = await questionRepo.getAnswer(questionId, answerId);
      expect(answer).toEqual(testQuestions[0].answers[0]);
    });

    test("should throw an error for a non-existing id", async () => {
      const questionId = testQuestions[0].id;
      const nonExistingId = faker.datatype.uuid();
      await expect(
        questionRepo.getAnswer(questionId, nonExistingId)
      ).rejects.toThrow(AppError);
    });
  });
});
