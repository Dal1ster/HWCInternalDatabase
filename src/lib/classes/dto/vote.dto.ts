import { IsNumberString, IsString, Length } from "class-validator";

export default class VoteDto {
    @IsString()
    @Length(5, 5)
    @IsNumberString()
    vote!: string;
}