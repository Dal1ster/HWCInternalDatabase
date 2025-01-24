/* eslint-disable @typescript-eslint/no-namespace */
// using namespaces to prevent accidental cross-contamination of client and server version of resources

import 'reflect-metadata';
import { Expose, Type } from "class-transformer";
import { SharedResource, ResourceAttribute } from "./shared";

export namespace Client {
    export type Entity = Directory | File;

    export class Resource extends SharedResource {
        @Expose()
        @Type(() => ResourceAttribute)
        attribute: ResourceAttribute = new ResourceAttribute();
    }
    export class File extends Client.Resource {
        declare type: 'file';

        // contents of the file
        @Expose()
        content!: string;
        
        shouldBypassCache() {
            return this.attribute.cacheBuster || this.attribute.content !== 'undefined';
        }
    }
    export class Directory extends Client.Resource {
        declare type: 'directory';

        @Expose()
        children: Entity[] = [];
    }
}