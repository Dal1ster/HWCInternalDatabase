import Quiz from "$lib/server/classes/Quiz";
import { plainToClass } from "class-transformer";
import { readJSON } from "../util/fsutils";

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