import { Directory, File } from "$lib/classes/resources";
import type { FileSystemEntity } from "$lib/classes/resources";
import { plainToInstance } from "class-transformer";
import { ApiError } from "./ApiError";
import apiFetch from "./apiFetch";

export function getResourceUrl(location: string) {
    return `/filesystem?${new URLSearchParams({ location }).toString()}`;
}

export function getContentUrl(location: string, cacheBuster = false) {
    return `${getResourceUrl(location)}&content=1${cacheBuster ? `&time=${Date.now()}` : ''}`;
}

export async function getResource(location: string) {
    const resourceUrl = getResourceUrl(location);
    const { data } = await apiFetch(resourceUrl);

    return transform(data);
}

export async function getFile(location: string) {
    const file = await getResource(location);

    if(file instanceof File) {
        return file;
    } else {
        throw ApiError.from({
            message: 'Not a file',
            data: file
        });
    }
}

export async function getDirectory(location: string) {
    const directory = await getResource(location);

    if(directory instanceof Directory) {
        return directory;
    } else {
        throw ApiError.from({
            message: 'Not a directory',
            data: directory
        });
    }
}

export async function getDirectoryChildren(location: string): Promise<FileSystemEntity[]> {
    const url = `/filesystem/directory?${new URLSearchParams({ location }).toString()}`;
    const { data } = await apiFetch(url);

    return data.map(transform);
}

export function transform(resource: FileSystemEntity) {
    if(resource.type === 'directory') {
        resource = plainToInstance(Directory, resource);
    } else {
        resource = plainToInstance(File, resource);
    }

    resource.attributes = [resource.flattenAttributes()];

    return resource;
}