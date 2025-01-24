

type WindowUnion = Window & typeof globalThis;
/**
 * Helper function to externalize objects to the window object
 * because we have a bunch of ugly context separation that we need to work around
 * 
 * @param name 
 * @param object 
 */
export default function externalize<T extends keyof WindowUnion>(name: T, object: WindowUnion[T]) {
    if(typeof window !== 'undefined') { // prevent from being called during SSR
        window[name] = object;
    }
}