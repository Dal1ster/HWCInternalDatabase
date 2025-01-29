import { config } from 'dotenv'
import { IsInt, IsOptional, IsString } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';
import { Type } from 'class-transformer';
import 'reflect-metadata';

config();

class ENV {
    @IsString()
    FILESYSTEM_PATH!: string;

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

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    WINTER_BREAK?: 1;

    @IsString()
    @IsOptional()
    @Type(() => String)
    GROUP_CHALLENGE_CODE?: string;

    @IsString()
    @IsOptional()
    @Type(() => String)
    ARG_PEANUT_GALLERY_WEBHOOK?: string
}


export default transformAndValidateSync(ENV, process.env);