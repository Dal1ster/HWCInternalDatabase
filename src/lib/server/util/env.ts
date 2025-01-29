import { config } from 'dotenv'
import { IsInt, IsOptional, IsString } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';
import { Type } from 'class-transformer';
import 'reflect-metadata';

config();

class ENV {
    @IsString()
    FILESYSTEM_PATH: string = "./filesystem.json";

    @IsString()
    @IsOptional()
    NODE_ENV?: string;

    @IsString()
    @IsOptional()
    CANARY_WEBHOOK_URL?: string;

    @IsString()
    @IsOptional()
    CANARY_MESSAGE?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    PRERELEASE?: 1;

    @IsString()
    @IsOptional()
    PRERELEASE_PASSCODE?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    WINTER_BREAK?: 1;

    @IsString()
    @IsOptional()
    GROUP_CHALLENGE_CODE!: string;

    @IsString()
    @IsOptional()
    ARG_PEANUT_GALLERY_WEBHOOK_URL?: string
}


export default transformAndValidateSync(ENV, process.env);