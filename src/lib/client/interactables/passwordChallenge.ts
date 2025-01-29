import PasswordPrompt from "../../../components/ExtensionDelegate/PasswordPrompt.svelte"
import { openWindow } from "./HWCWindow"

export async function passwordChallenge(location: string) {
    return new Promise<boolean>((resolve) => {
        let resolved = false;
        const doResolve = (result: boolean) => {
            if(resolved) {
                return;
            }

            resolved = true;
            resolve(result);
        }

        const prompt = openWindow(PasswordPrompt, {
            title: 'Password Challenge',
            width: 500,
            height: -1,
            props: {
                onSuccess() {
                    doResolve(true);
                    prompt.close();
                },
                onDismiss() {
                    doResolve(false);
                },
                location
            },
        })
    })
}