import { openWindow } from "./HWCWindow";
import Message from "../../../components/ExtensionDelegate/Message.svelte";

export function createErrorDialog(title: string, message: string) {
    return openWindow(title, Message, { message, width: 300, height: -1 });
}
