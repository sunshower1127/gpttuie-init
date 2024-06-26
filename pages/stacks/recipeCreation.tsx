import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import HR from "../../components/hr";
import theme from "../../constants/theme";
import { Recipe } from "../../models/recipe";
import { MyNavigation, StackRouteProp } from "../../models/stackNav";
import { getNewRecipe } from "../../utils/gpt";

// 유저가 고른 3개중 하나의 레시피에 대한 조리순서 정보를 GPT에게서 가져옴.
// 가져온 정보를 보여주고, 요리하기 버튼을 누르면 RecipeProcess 페이지로 이동함
export default function RecipeCreation() {
  const navigation = useNavigation<MyNavigation>();
  const route = useRoute<RouteProp<StackRouteProp, "레시피_선택">>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect쓰면 단 한번만 실행됨
  useEffect(() => {
    const { recipe: recipeSetting, text: extraRequest } = route.params;
    console.log(recipeSetting, extraRequest);
    if (!recipeSetting) {
      alert("에러 : 선택한 레시피가 없습니다.");
      return;
    }

    const getRecipe = async () => {
      const newRecipe = await getNewRecipe(recipeSetting, extraRequest);
      if (!newRecipe) {
        alert("레시피 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }
      newRecipe.id = Date.now().toString();
      setRecipe(newRecipe);
      console.log("-- RecipeCreation --");
      console.log("Recipe: ", newRecipe);
      console.log("");
      setIsLoading(false);
    };

    getRecipe();
  }, []);

  const handleClick = () => {
    // 메인 스택창만 남기고 다 끄고, 레시피 프로세스로 이동하기
    navigation.reset({
      index: 1,
      routes: [{ name: "메인" }, { name: "레시피_프로세스", params: recipe }],
    });
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator animating={true} size="large" />
      <Text>AI에게 물어보는중...</Text>
    </View>
  ) : (
    <ScrollView style={styles.container}>
      <Text
        variant="headlineSmall"
        style={{
          textAlign: "center",
          color: "#303030",
        }}
      >{`${recipe?.title} ${recipe.servingSize}인분`}</Text>
      <HR />
      <Text variant="titleLarge" style={styles.subtitle}>
        재료
      </Text>
      <Text style={styles.ac}>{recipe.ingredients.join("\n")}</Text>
      <Text variant="titleLarge" style={styles.subtitle}>
        레시피
      </Text>
      <Markdown>
        {recipe.steps.map((step) => step.description).join("\n")}
      </Markdown>
      <HR />
      <Button
        mode={"contained"}
        onPress={handleClick}
        icon="chef-hat"
        style={styles.btn}
      >
        이 레시피로 요리하기
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    gap: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
    color: theme.colors.primary,
  },
  btn: {
    marginTop: 20,
    width: 200,
    alignSelf: "center",
  },
  ac: {},
});
