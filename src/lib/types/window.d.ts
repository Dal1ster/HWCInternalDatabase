import sfx from "../client/sfx";
import ui from "../client/interactables/HWCWindow";
import { ExternalizedAssetCache } from "../client/stores/assetCache";
import mouse from "../client/stores/mouse";
import branding from '../client/stores/branding';
import _debug from "../client/_debug";
import windowStore from "../client/stores/windowStore";
import resourceStore from "../client/stores/resourceStore";
import { reloadDirectoryByPath } from "$lib/util/reloadReference";
declare global {
    interface Window { 
        sfx: typeof sfx;
        ui: typeof ui;
        assets: ExternalizedAssetCache;
        mouse: typeof mouse;
        branding: typeof branding;
        reloadDirectory: typeof reloadDirectoryByPath;
        reloadRoot: any;
        _debug: typeof _debug;
        windowStore: typeof windowStore;
        resourceStore: typeof resourceStore
    }

}