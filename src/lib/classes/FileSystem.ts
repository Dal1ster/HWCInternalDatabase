import { getSystemData } from "$lib/loadFilesystem";
import { tokenize } from "$lib/util/tokenize";
import { instanceToInstance } from "class-transformer";
import { Directory, File, FileSystemEntity, SystemData } from "./resources";
import User from "../User";
import { notifyCanary } from "../util/notifyCanary";
import { getPresistentState } from "$lib/util/getPresistentState";
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
    constructor(private data: SystemData, private user: User, private state: PresistentState) {}

    static create(user: User) {
        const data = getSystemData();
        const fs = new FileSystem(data, user, getPresistentState());
        return fs;
    }

    accessPath(location: string) {
        return this._accessPath(location, this.data.filesystem);
    }

    private async _accessPath(location: string | string[], data: FileSystemEntity[]) : Promise<FileSystemEntity> {
        const parts = Array.isArray(location) ? location : tokenize(location);
        if(parts.length === 0) {
            throw new FileSystemError('File not found', 'NOT_FOUND');
        }

        const lowercaseName = parts[0].toLowerCase();
        for(const resource of data) {
            if(resource.name?.toLowerCase() === lowercaseName) {
                if(parts.length === 1) {
                    return this._accessResource(resource);
                } else if(resource instanceof Directory) {
                    const directoryChildren = await this.accessChildren(resource, true);
                    return this._accessPath(parts.slice(1), directoryChildren);
                } else {
                    throw new FileSystemError('Not a directory', 'NOT_A_DIRECTORY');
                }
            }
        }
        
        throw new FileSystemError('File not found', 'NOT_FOUND');
    }

    public async accessContents(file: File) {
        const locked = file.getAttribute('locked', this.user);
        if(locked) {
            throw new FileSystemError('Password protected', 'PASSWORD_PROTECTED');
        }

        const content = file.getAttribute('content', this.user) || file.content;

        return content;
    }

    public async accessChildren(directory: Directory, hiddenEntities = false) {
        const locked = directory.getAttribute('locked', this.user);
        if(locked) {
            throw new FileSystemError('Password protected', 'PASSWORD_PROTECTED');
        }

        const children = new Array<FileSystemEntity>();

        for(const childResource of directory.children) {
            const child = await this._accessResource(childResource);
            if(child.attribute.canary) {
                // send canary message
                notifyCanary();
            }
            if(!hiddenEntities && child.attribute.hidden) continue; // remove hidden children

            children.push(child);
        }

        return children;
    }

    private async _accessResource(resource: FileSystemEntity) {
        const clone = instanceToInstance(resource, { groups: ['server'] });
        const returnValue = clone;

        // gaslight users into thinking this file does not exist if accessed directly
        if(returnValue.getAttribute('unmounted', this.user)) { 
            throw new FileSystemError('File not found', 'NOT_FOUND');
        }

        // flatten attributes for the frontend
        returnValue.attributes = [returnValue.flattenAttributes(this.user, this.state)];

        return returnValue;
    }
}

