/* eslint-disable @typescript-eslint/no-namespace */
// using namespaces to prevent accidental cross-contamination of client and server version of resources

import { SharedResource, type ResourceAttribute } from "./shared";

export namespace Client {
    export type Entity = Directory | File;

    export class Resource extends SharedResource {
        attribute: ResourceAttribute = {};
    }
    export class File extends Client.Resource {
        declare type: 'file';

        // contents of the file
        content!: string;
        
        shouldBypassCache() {
            return this.attribute.cacheBuster || this.attribute.content !== 'undefined';
        }
    }
    export class Directory extends Client.Resource {
        declare type: 'directory';

        children: Entity[] = [];
    }
}