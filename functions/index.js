const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const {onCall} = require("firebase-functions/v2/https");
const {getAuth} = require("firebase-admin/auth");

admin.initializeApp();

exports.setTeacherRole = onCall({cors: true}, async (request) => {
  const context = request.context;
  const data = request.data;

  if (!context.auth || !context.auth.token.admin) {
    throw new Error("Unauthorized");
  }

  await getAuth().setCustomUserClaims(data.uid, {
    role: "teacher",
    teacherId: data.uid
  });

  return {success: true};
});

exports.gradeQuiz = onDocumentCreated("submissions/{submissionId}", async (event) => {
  const snapshot = event.data;
  const submission = snapshot.data();

  const quizRef = admin.firestore().doc(`quizzes/${submission.quizId}`);
  const quizDoc = await quizRef.get();
  const quiz = quizDoc.data();

  let totalMarks = 0;
  let scoredMarks = 0;

  submission.answers.forEach((studentAnswer, index) => {
    const question = quiz.questions[index];
    const questionType = question.type;
    totalMarks += question.marks;

    const processedAnswer = questionType === "multi_select"
      ? studentAnswer.split("|")
      : studentAnswer;

    let isCorrect = false;

    switch (questionType) {
    case "text":
      isCorrect = processedAnswer.toLowerCase().trim() === 
                    question.correctAnswer.toLowerCase().trim();
      break;

    case "multiple_choice":
      isCorrect = processedAnswer === question.correctAnswer;
      break;

    case "multi_select": {
      const correctSet = new Set(question.correctAnswers);
      const answerSet = new Set(processedAnswer);
      isCorrect = correctSet.size === answerSet.size &&
                    [...correctSet].every(a => answerSet.has(a));
      break;
    }
    }

    if (isCorrect) {
      scoredMarks += question.marks;
    }
  });

  await snapshot.ref.update({
    score: scoredMarks,
    totalMarks: totalMarks,
    quizTitle: quiz.title
  });
});
