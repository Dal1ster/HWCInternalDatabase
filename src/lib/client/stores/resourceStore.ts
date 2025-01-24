import { Client } from "../../classes/resource/client";
import externalize from "../util/externalize";
import { writable } from "svelte/store";

export type ManagedDirectory = {
    type: 'directory';
} & ({ promise: Promise<Client.Directory>, entity: undefined } | { promise: undefined, entity: Client.Directory; });

export type ManagedFile = {
    type: 'file';
} & ({ promise: Promise<Client.File>, entity: undefined } | { promise: undefined, entity: Client.File; });

type ManagedFileSystemEntity = ManagedDirectory | ManagedFile;

const resourceStore = writable<{
    [path: string]: ManagedFileSystemEntity | undefined;
}>({});

externalize('resourceStore', resourceStore);
export default resourceStore;
