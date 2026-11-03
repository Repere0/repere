/* Capture la carte story (9:16) puis ouvre la feuille de partage native avec l'image.
   Si la capture echoue (web, appareil sans capture), on partage le texte seul. */
import { useRef, type ComponentRef } from "react";
import { Share, View } from "react-native";
import { captureRef } from "react-native-view-shot";

export function usePartageStory(repli: string) {
  const carte = useRef<ComponentRef<typeof View>>(null);
  const partager = async () => {
    try {
      const url = await captureRef(carte, { format: "png", quality: 1, result: "tmpfile", width: 1080, height: 1920 });
      await Share.share({ url, message: repli });
    } catch {
      await Share.share({ message: repli });
    }
  };
  return { carte, partager };
}
