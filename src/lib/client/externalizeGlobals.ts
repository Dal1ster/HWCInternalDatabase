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

export default function externalizeGlobals() {
    externalize('sfx', globalSFX);
    externalize('resourceStore', resourceStore);
    externalize('_debug', _debug);
    externalize('windowStore', windowStore);
    externalize('ui', UIExternals);
    externalize('assets', AssetCacheExternals);
    externalize('branding', brandingStore)
    externalize('mouse', mouseStore);
    externalize('reloadDirectory', reloadDirectoryByPath);
}