/* eslint-disable @typescript-eslint/no-namespace */

import type User from "$lib/server/classes/User";
import { omit } from "$lib/util/omit";
import { Type, Transform, plainToInstance } from "class-transformer";
import type { PresistentState } from "$lib/server/classes/PresistentState";
import { Challenge, ResourceAttribute, SharedResource } from "./shared";
import { Client } from "./client";

export namespace Server {
    export type Entity = Directory | File;

    export class Resource extends SharedResource {
        @Type(() => Challenge)
        challenge?: Challenge;
    
        @Type(() => ResourceAttribute)
        @Transform(({ value: attributes, obj: parent}) => {
            if(typeof parent['challenge'] !== 'undefined') {
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
         *     { hidden: false, conditionalId: 'showHiddenFiles' }
         * ]
         * 
         * Will result is a resource with the hidden property set to false if the user has the 'showHiddenFiles' conditional, otherwise it will be true.
         * 
         */
        attributes = new Array<ResourceAttribute>(); 
        getAttribute<AttribueName extends keyof ResourceAttribute>(name: AttribueName, user: User, presistentState: PresistentState): ResourceAttribute[AttribueName] {
            const currentAttributes = this.flattenAttributes(user, presistentState);
            return currentAttributes[name];
        }
    
        /**
         * Flatten the attributes of a resource into a single object, while applying the conditionals of a given user
         * 
         * @param user User whose conditionals to use for flattening
         * @returns Flattened attributes
         */
        flattenAttributes(user: User, presistentState: PresistentState) {
            if(!this.attributes) return new ResourceAttribute();
    
            let currentAttributes: ResourceAttribute = new ResourceAttribute();
            function merge(current: ResourceAttribute, next: ResourceAttribute) {
                const stripped = omit(next, 'conditionalId', 'presistentConditionalId');
                const keys = Object.keys(stripped) as (keyof typeof stripped)[];
                for(const key of keys) {
                    if(typeof stripped[key] !== 'undefined') {
                        current[key] = stripped[key] as any;
                    }
                }

                return Object.assign(current, omit(next, 'conditionalId', 'presistentConditionalId'));
            }
    
            for(const attribute of this.attributes) {
                if(attribute.locked) {
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

    export class File extends Server.Resource {
        declare type: 'file';

        // contents of the file
        content!: string;

        toClient(user: User, presistentState: PresistentState): Client.File {
            const clientFile = plainToInstance(Client.File, this, { excludeExtraneousValues: true });
            clientFile.attribute = this.flattenAttributes(user, presistentState);

            return clientFile;
        }
    }

    export class Directory extends Server.Resource {
        declare type: 'directory';

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
        children!: (Directory | File) [];

        toClient(user: User, presistentState: PresistentState): Client.Directory {
            const clientDirectory = plainToInstance(Client.Directory, this, { excludeExtraneousValues: true });
            clientDirectory.attribute = this.flattenAttributes(user, presistentState);

            // temporary
            clientDirectory.children = [];

            return clientDirectory;
        }
    }

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
        filesystem!: Entity[];

        generateLocations() {
            function generateLocationsRecursive(entity: Entity, prefix: string) {
                entity.location = prefix + entity.name;
                if(entity.type === 'directory') {
                    for(const child of entity.children) {
                        generateLocationsRecursive(child, prefix + entity.name + '/');
                    }
                }
            }

            for(const entity of this.filesystem) {
                generateLocationsRecursive(entity, '/');
            }
        }
    }
}