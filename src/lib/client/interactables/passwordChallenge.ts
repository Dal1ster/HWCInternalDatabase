import PasswordPrompt from "../../../components/ExtensionDelegate/PasswordPrompt.svelte"
import { openWindow } from "./HWCWindow"

export async function passwordChallenge(location: string) {
    return new Promise<boolean>((resolve) => {
        const prompt = openWindow('Password Challenge', PasswordPrompt, {
            width: 500,
            height: -1,
            onSuccess() {
                resolve(true);
                prompt.close();
            },
            onDismiss() {
                resolve(false);
            },
            location
        })
    })
}