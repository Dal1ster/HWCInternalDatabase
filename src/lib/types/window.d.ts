import sfx from "../client/sfx";
import { UIExternals } from "../client/interactables/HWCWindow";
import { AssetCacheExternals } from "../client/stores/assetCache";
import mouseStore from "../client/stores/mouse";
import branding from '../client/stores/branding';
import _debug from "../client/_debug";
import windowStore from "../client/stores/windowStore";
import resourceStore from "../client/stores/resourceStore";
import { reloadDirectoryByPath } from "../client/util/reloadReference";
declare global {
    interface Window { 
        sfx: typeof sfx;
        ui: typeof UIExternals;
        assets: typeof AssetCacheExternals;
        mouse: typeof mouseStore;
        branding: typeof branding;
        reloadDirectory: typeof reloadDirectoryByPath;
        reloadRoot: any;
        _debug: typeof _debug;
        windowStore: typeof windowStore;
        resourceStore: typeof resourceStore
    }

}