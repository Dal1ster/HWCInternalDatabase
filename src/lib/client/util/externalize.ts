

type WindowUnion = Window & typeof globalThis;
/**
 * Helper function to externalize objects to the window object
 * because we have a bunch of ugly context separation that we need to work around
 * 
 * @param name 
 * @param externalModule 
 */
export default function externalize<T extends keyof WindowUnion>(name: T, externalModule: WindowUnion[T], overwriteModules = false) {
    if(typeof window !== 'undefined') { // prevent from being called during SSR
        if(Object.prototype.hasOwnProperty.call(window, name) && !overwriteModules) {
            console.error(`Cannot externalize ${name}, will overwrite an existing object on the global scope`);
        } else {
            window[name] = externalModule;
        }
    }
}