import { IsString } from "class-validator";

export default class ProficiencyDTO {
    @IsString({ each: true })
    answer!: string[];
}