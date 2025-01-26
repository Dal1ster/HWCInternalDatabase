import ProficiencyDTO from '$lib/classes/dto/proficiency.dto';
import logger from '$lib/server/util/logger';
import { respond } from '$lib/server/util/respond';
import type { RequestEvent } from '@sveltejs/kit';
import { transformAndValidateSync } from 'class-transformer-validator';

const PROFICIENCY_ANSWERS = [
    'mat', 'chess',
    'seaborgium', 'sans',
    'yoyo', 'cucumber',
    'voyageur', 'five',
    'polaris', 'signals',
]

export async function POST(ctx: RequestEvent) {
    try {
        const data = transformAndValidateSync(ProficiencyDTO, await ctx.request.json()) as ProficiencyDTO;
        logger.info('Proficiency request', data);

        // was gonna have feedback but it would encourage brute force
        // rip arg players
        //const response = [];
        let correctness = 0;

        for(let i = 0; i < data.answer.length; i++) {
            if(data.answer[i].toLowerCase() === PROFICIENCY_ANSWERS[i].toLowerCase()) {
                correctness++;
                 // response.push({ state: 'correct' });
            } else {
                 // response.push({ state: 'incorrect' });
            }
        }
        
        if(correctness >= 8) {
            return respond(200, { prize: '/ghwetxzwtgTAVBHWWEDS.zip'}, `Sufficient proficiency demonstrated. Enjoy your spoils.`);
        }
        
        return respond(400, {}, `Try again.`);
    } catch(ex) {
        logger.error('Invalid request', ex);
        return respond(400, {}, 'Invalid request');   
    }
}