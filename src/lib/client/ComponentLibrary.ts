export class ComponentLibrary {
    components: Record<string, Promise<string>> = {};

    async load(url: string) {
        if(url in this.components) {
            if(await this.components[url]) {
                return this.components[url];
            }
        }

        return this.components[url] = import(url).then((module: any) => module.default);
    }
}

const componentLibrary = new ComponentLibrary();
export default componentLibrary;