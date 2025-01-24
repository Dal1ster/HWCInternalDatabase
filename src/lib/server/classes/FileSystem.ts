import { getSystemData } from "$lib/server/loadFilesystem";
import { tokenize } from "$lib/util/tokenize";
import { Server } from '../../classes/resource/server';
import User from "./User";
import { notifyCanary } from "../util/notifyCanary";
import { getPresistentState } from "$lib/server/util/getPresistentState";
import { PresistentState } from "./PresistentState";

type FileSystemErrorCodes = 'NOT_FOUND' | 'NOT_A_DIRECTORY' | 'NOT_A_FILE' | 'NOT_A_URL' | 'NOT_A_VIDEO' | 'NOT_A_AUDIO' | 'NOT_A_DOCUMENT' | 'NOT_AN_IMAGE' | 'PASSWORD_PROTECTED' | 'NO_PASSWORD_PROVIDED' | 'WRONG_PASSWORD';

export class FileSystemError extends Error {
    constructor(message: string, public code: FileSystemErrorCodes) {
        super(message);
        this.name = 'FilesystemError';
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message
        }
    }
}
export class FileSystem {
    constructor(private data: Server.SystemData, private user: User, private state: PresistentState) {}

    static create(user: User) {
        const data = getSystemData();
        const fs = new FileSystem(data, user, getPresistentState());
        return fs;
    }

    async accessPath(location: string) {
        const resource = await this._accessPath(location, this.data.filesystem);
        const setConditionalOnLoad = resource.getAttribute('setConditionalOnLoad', this.user, this.state);

        if(typeof setConditionalOnLoad !== 'undefined') {
            await this.user.setConditional(setConditionalOnLoad, true);
        }

        return resource;
    }

    async clientAccessPath(location: string) {
        const resouce = await this._accessPath(location, this.data.filesystem);
        return resouce.toClient(this.user, this.state);
    }

    private async _accessPath(location: string | string[], data: Server.Entity[]) : Promise<Server.Entity> {
        const parts = Array.isArray(location) ? location : tokenize(location);
        if(parts.length === 0) {
            throw new FileSystemError('File not found', 'NOT_FOUND');
        }

        const lowercaseName = parts[0].toLowerCase();
        for(const resource of data) {
            if(resource.name?.toLowerCase() === lowercaseName) {
                if(parts.length === 1) {
                    // gaslight users into thinking this file does not exist if accessed directly
                    if(resource.getAttribute('unmounted', this.user, this.state)) { 
                        throw new FileSystemError('File not found', 'NOT_FOUND');
                    }

                    return resource;
                } else if(resource instanceof Server.Directory) {
                    const directoryChildren = await this.accessChildren(resource, true);
                    return this._accessPath(parts.slice(1), directoryChildren);
                } else {
                    throw new FileSystemError('Not a directory', 'NOT_A_DIRECTORY');
                }
            }
        }
        
        throw new FileSystemError('File not found', 'NOT_FOUND');
    }

    public async accessContents(file: Server.File) {
        const locked = file.getAttribute('locked', this.user, this.state);
        if(locked) {
            throw new FileSystemError('Password protected', 'PASSWORD_PROTECTED');
        }

        const content = file.getAttribute('content', this.user, this.state) || file.content;

        return content;
    }

    public async accessChildren(directory: Server.Directory, hiddenEntities = false) {
        const locked = directory.getAttribute('locked', this.user, this.state);
        if(locked) {
            throw new FileSystemError('Password protected', 'PASSWORD_PROTECTED');
        }

        const children = new Array<Server.Entity>();

        for(const childResource of directory.children) {
            const child = childResource;
            if(child.getAttribute('canary', this.user, this.state)) {
                // send canary message
                notifyCanary();
            }
            if(!hiddenEntities && child.getAttribute('hidden', this.user, this.state)) continue; // remove hidden children

            children.push(child);
        }

        return children;
    }

    public clientAccessChildren(directory: Server.Directory) {
        return directory.children.map(child => child.toClient(this.user, this.state));
    }
}

