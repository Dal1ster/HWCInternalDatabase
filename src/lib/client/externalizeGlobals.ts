import _debug from './_debug';
import { UIExternals } from './interactables/HWCWindow';
import globalSFX from './sfx';
import { AssetCacheExternals } from './stores/assetCache';
import brandingStore from './stores/branding';
import mouseStore from './stores/mouse';
import resourceStore from './stores/resourceStore';
import windowStore from './stores/windowStore';
import externalize from './util/externalize';
import { reloadDirectoryByPath } from './util/reloadReference';

export default function externalizeGlobals(overwriteModules: boolean = false) {
    externalize('sfx', globalSFX, overwriteModules);
    externalize('resourceStore', resourceStore, overwriteModules);
    externalize('_debug', _debug, overwriteModules);
    externalize('windowStore', windowStore, overwriteModules);
    externalize('ui', UIExternals, overwriteModules);
    externalize('assets', AssetCacheExternals, overwriteModules);
    externalize('branding', brandingStore, overwriteModules)
    externalize('mouse', mouseStore, overwriteModules);
    externalize('reloadDirectory', reloadDirectoryByPath, overwriteModules);
}

if(import.meta.hot) {
    import.meta.hot.accept(() => {
        console.log('HMR: Reloading globals');
        externalizeGlobals(true);
    });
    import.meta.hot.dispose(() => {
        externalizeGlobals(true);
    });
}
