import User from "$lib/User";
import { omit } from "$lib/util/omit";
import { Expose, Transform, Type } from "class-transformer";
import 'reflect-metadata';
import type { PresistentState } from "./PresistentState";

/**
 * Represents a resource in the filesystem
 */
export class Resource {
    location: string = ''; // location name, empty by default but set on the frontend for convenience

    name!: string;
    type!: 'file' | 'directory'; // type of the resource, used as a discriminator for class-transformer

    @Type(() => Challenge)
    @Expose({ groups: ['server'] })
    challenge?: Challenge;

    @Type(() => Object)
    @Transform(({ value: attributes, obj: parent}) => {
        if(parent['challenge'] instanceof Challenge) {
            attributes.unshift({ locked: true });
        }
        return attributes;
    })
    /**
     * Attributes are additional metadata that can be attached to a resource.
     * They add additional properties to a resource in layers, with the last attribute taking precedence.
     * If an attribute has a conditionalId, it will only be available if the user has the conditional.
     * 
     * attributes: [
     *     { hidden: true },
     *    { hidden: false, conditionalId: 'showHiddenFiles' }
     * ]
     * 
     * Will result is a resource with the hidden property set to false if the user has the 'showHiddenFiles' conditional, otherwise it will be true.
     * 
     */
    attributes: ResourceAttribute[] = [] 
    getAttribute<AttribueName extends keyof ResourceAttribute>(name: AttribueName, user?: User, presistentState?: PresistentState): ResourceAttribute[AttribueName] {
        const currentAttributes = this.flattenAttributes(user, presistentState);
        return currentAttributes[name];
    }

    
    get attribute() {
        return this.attributes[0];
    }

    /**
     * Flatten the attributes of a resource into a single object, while applying the conditionals of a given user
     * 
     * @param user User whose conditionals to use for flattening
     * @returns Flattened attributes
     */
    flattenAttributes(user?: User, presistentState?: PresistentState) {
        if(!this.attributes) return {};

        let currentAttributes: ResourceAttribute = {};

        function merge(current: ResourceAttribute, next: ResourceAttribute) {
            return Object.assign(current, omit(next, 'conditionalId', 'presistentConditionalId'));
        }

        for(const attribute of this.attributes) {
            if(attribute.locked) {
                if(!user) {
                    currentAttributes = merge(currentAttributes, attribute);
                    continue;
                }

                if(user.hasChallenge(this.location)) {
                    currentAttributes = merge(currentAttributes, { locked: false });
                } else {
                    currentAttributes = merge(currentAttributes, attribute);
                }
                
                continue;
            }

            if(attribute.presistentConditionalId && presistentState) {
                if(presistentState.get(attribute.presistentConditionalId)) {
                    currentAttributes = merge(currentAttributes, omit(attribute, 'presistentConditionalId', 'conditionalId'));
                    continue;
                }
            }

            if(attribute.conditionalId) {
                if(!user) continue;

                if(user.hasConditional(attribute.conditionalId)) {
                    currentAttributes = merge(currentAttributes, omit(attribute, 'presistentConditionalId', 'conditionalId'));
                }
            }
            
            if(attribute.conditionalId === undefined && attribute.presistentConditionalId === undefined) {
                currentAttributes = merge(currentAttributes, attribute);
            }
        }

        return currentAttributes;
    }


}

export type FileSubTypes = 'image' | 'video' | 'audio' | 'document' | 'url';

class Challenge {
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
 * Represents a file in the filesystem
 */
export class File extends Resource {
    declare type: 'file';

    // contents of the file
    content!: string;

    /**
     * Get the subtype of the file based on its extension
     */
    get subtype() {
        const ext = this.name.split('.').pop()?.toLowerCase();
        
        if(!ext) return 'document';
        
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

    shouldBypassCache() {
        return this.getAttribute('c') || typeof this.getAttribute('content') !== 'undefined';
    }

}

export class Directory extends Resource {
    @Type(() => Resource, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: File, name: 'file' },
                { value: Directory, name: 'directory' },
            ],
        },
        keepDiscriminatorProperty: true
    })
    @Transform(({ value: children, obj: parent}) => {
        for(const child of children) {
            child.location = `${parent.location || parent.name}/${child.name}`;
        }
        return children;
    }, { toClassOnly: true })
    @Expose({ groups: ['server'] })
    children!: FileSystemEntity[];

    declare type: 'directory';
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

    c?: boolean // if true, this file will always trigger a cache reload, obfuscated name to not leak the purpose of the attribute
    evil?: boolean // this file locks up the frontend when opened, for smile.jpg

    
    setConditionalOnLoad?: string // sets a conditional when the directory loads its contents
    unmounted?: boolean // if true, directory will not be directly accessible in the filesystem
}

export type FileSystemEntity = File | Directory;

export type FileSystem = FileSystemEntity[];

export class SystemData {
    @Type(() => Resource, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: File, name: 'file' },
                { value: Directory, name: 'directory' },
            ],
        },
        keepDiscriminatorProperty: true,
    })
    filesystem!: FileSystemEntity[];
}