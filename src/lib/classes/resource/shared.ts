
import type { Client } from "./client";
import type { Server } from "./server";

export class SharedResource {
    location: string = ''; // location name, empty by default but set on the frontend for convenience
    
    name!: string;
    type!: 'file' | 'directory'; // type of the resource, used as a discriminator for class-transformer
}

export class Challenge {
    password!: string;
    passwords?: string[]; // for multiple passwords

    caseInsensitive = false;

    isPasswordCorrect(password: string) {
        if(this.caseInsensitive) {
            password = password.toLowerCase();
        }

        if(this.passwords) {
            if(this.passwords.includes(password)) {
                return true;
            }
        }

        return password === this.password;
    }
}


/**
 * Get the subtype of the file based on its extension
 */
export function getFileSubtype(file: Client.File | Server.File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
        
    if(!ext) return 'archive';
    
    switch(ext) {
        case 'exe':
        case 'm3u': /** for the 000001_hqr_surveillance.m3u file*/
            return 'executable';
        case 'rar':
        case 'zip':
        case '7z':
            return 'archive';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
            return 'image';
        case 'mp4':
        case 'webm':
        case 'avi':
        case 'mkv':
            return 'video';
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'ogg':
            return 'audio';
        case 'doc':
        case 'docx':
        case 'txt':
            return 'document';
        case 'url':
            return 'url';
        case 'pdf':
            return 'pdf';
        default:
            return 'archive';
    }
}
export type ResourceAttribute = {
    conditionalId?: string  // if present, attribute is only available if user has the conditional
    presistentConditionalId?: string // if present attribute is only active if the global presistent conditional with this name is set

    hidden?: boolean // makes resource not appear as a child of a directory
    content?: string // alternate content 
    locked? : boolean // challenge required to access

    hiddenWindow?: boolean // executables with this property will not create a visible window
    synchronous?: boolean // if true, executable windows will be initialized synchronously without waiting for the callback

    canary?: boolean // if true file will post a message to a discord webhook specified in CANARY_WEBHOOK_URL
    hotlinked?: boolean // if true, requests to this file will redirect to the url specified in content !! USERS CAN SEE THE URL, DONT USE WITH PASSWORD PROTECTED RESOURCES!!

    cacheBuster?: boolean // if true, this file will always trigger a cache reload, obfuscated name to not leak the purpose of the attribute
    evil?: boolean // this file locks up the frontend when opened, for smile.jpg

    
    setConditionalOnLoad?: string // sets a conditional when the directory loads its contents
    unmounted?: boolean // if true, directory will not be directly accessible in the filesystem
}