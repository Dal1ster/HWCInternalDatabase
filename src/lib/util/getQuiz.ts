import Quiz from "$lib/classes/Quiz";
import { plainToClass } from "class-transformer";
import { readJSON } from "./betterfs";

const QUIZ_PATH = 'quiz.json';

let quiz: Quiz;
function loadQuiz() {
    return plainToClass(Quiz, readJSON(QUIZ_PATH) || { answers: [] });
}

export default function getQuiz(reload = false) {
    if(!quiz || reload) {
        quiz = loadQuiz();
    }
    return quiz;
}