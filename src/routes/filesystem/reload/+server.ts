import { getSystemData } from "$lib/server/loadFilesystem";
import { loadPresistentState } from "$lib/server/util/getPresistentState";
import getQuiz from "$lib/server/util/getQuiz";
import { respond } from "$lib/server/util/respond";

export function GET() {
    getSystemData(true);
    getQuiz(true);
    loadPresistentState();
    return respond(200, {}, "Reloaded the filesystem, if you somehow see this message its not part of an arg this is just an endpoint to reload the filesystem data without restarting the server. fun fact we dont have any databases for this project as its running off a potato so every time we have to reload the filesystem all your sessions are gone.")
}