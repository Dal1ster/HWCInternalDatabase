import { Client } from "../../classes/resource/client";
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

export default resourceStore;
