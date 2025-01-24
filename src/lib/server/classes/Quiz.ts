import { Type } from "class-transformer";
import { IsOptional, IsString, IsBoolean } from "class-validator";

export class Answer {
    @IsString()
    keyword!: string;
    
    @IsString()
    conditionalId!: string;
    
    @IsString()
    @IsOptional()
    text?: string;

    @IsString()
    @IsOptional()
    refreshTarget?: string;

    @IsBoolean()
    @IsOptional()
    caseInsensitive?: boolean;

    checkAnswer(keyword: string) {
        if (this.caseInsensitive) {
            return keyword.toLowerCase() === this.keyword.toLowerCase();
        }
        return keyword === this.keyword;
    }
}

export default class Quiz {
    @Type(() => Answer)
    answers: Answer[] = [];

    check(keyword: string) {
        return this.answers.find(answer => answer.checkAnswer(keyword));
    }
}

