import { Directory, File } from "$lib/classes/resources";
import externalize from "$lib/util/externalize";
import { writable } from "svelte/store";

export type ManagedDirectory = {
    type: 'directory';
} & ({ promise: Promise<Directory>, entity: undefined } | { promise: undefined, entity: Directory; });

export type ManagedFile = {
    type: 'file';
} & ({ promise: Promise<File>, entity: undefined } | { promise: undefined, entity: File; });

type ManagedFileSystemEntity = ManagedDirectory | ManagedFile;

const resourceStore = writable<{
    [path: string]: ManagedFileSystemEntity | undefined;
}>({});

externalize('resourceStore', resourceStore);
export default resourceStore;
