import WebView, { WebViewMessageEvent } from "react-native-webview";
import { Recipe } from "../../models/recipe";
import { saveRecipe } from "../../components/saveRecipe";

export default function Home() {
  const handleMessage = (event: WebViewMessageEvent) => {
    const { name, data }: { name: string; data: Recipe } = JSON.parse(
      event.nativeEvent.data
    );
    if (name !== "Recipe") return;
    const recipe = data;
    console.log("Downloaded Recipe : ", recipe);
    saveRecipe(recipe);
    alert("레시피 저장 완료");
  };
  return (
    <WebView
      source={{
        uri: "https://gpttuie.web.app/",
        headers: { "Cache-Control": "no-cache" },
      }}
      onMessage={handleMessage}
    />
  );
}
