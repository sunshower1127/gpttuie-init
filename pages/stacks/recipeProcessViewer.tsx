import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  Vibration,
} from "react-native";
import { IconButton, MD3Colors, List, FAB } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Step, Recipe } from "../../models/recipe";
import { RouteProp, useRoute } from "@react-navigation/native";
import { StackRouteProp } from "../../models/stackNav";
import { useNavigation } from "@react-navigation/native"; //추가사항
import { MyNavigation } from "../../models/stackNav"; //추가사항

const RecipeProcessViwer = () => {
  //레시피 저장정보 불러오가
  const navigation = useNavigation<MyNavigation>();
  const route = useRoute<RouteProp<StackRouteProp, "레시피_프로세스">>();
  const [recipe, setRecipe] = useState(route.params);
  const title = route.params.title;
  const ingredients = recipe.ingredients || [];
  const servingSize = recipe.servingSize;
  const country = recipe.country;
  const steps = recipe.steps || [];
  const description = steps.map((step) => step.description).join("\n");
  const rating = recipe.rating;
  const oneLineReview = recipe.oneLineReview;

  // 재료 리스트
  const IngredientList = ({ ingredients }) => (
    <List.Section>
      {ingredients.map((ingredient, index) => (
        <List.Item
          key={index}
          title={
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.ingredinet}>{ingredient}</Text>
            </View>
          }
          left={(props) => <List.Icon {...props} icon="egg" />}
        />
      ))}
    </List.Section>
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = React.useRef(new Animated.Value(0)).current;

  // 페이지 표시기
  const renderDots = (pages) => {
    const dotPosition = Animated.divide(
      scrollX,
      Dimensions.get("window").width
    );
    const dotsArray = Array(pages.length).fill(0);

    return (
      <View style={styles.dotContainerHorizontal}>
        {dotsArray.map((_, i) => {
          const opacity = dotPosition.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return <Animated.View key={i} style={[styles.dot, { opacity }]} />;
        })}
      </View>
    );
  };

  //이미지 picker 함수
  const handlePickImage = async (index) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("카메라 권한을 허용해 주세요");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newSteps = [...recipe.steps];
      newSteps[index].image = result.assets[0].uri;
    }
  };

  //타이머 관련 함수
  const [timerText, setTimerText] = useState("");
  const [timerInterval, setTimerInterval] = useState(null);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const handleShowTimer = (item) => {
    if (!timerInterval) {
      const [minutes, seconds] = item.timer.split(":").map(Number);
      const initialTotalSeconds = minutes * 60 + seconds;
      setTotalSeconds(initialTotalSeconds);

      const interval = setInterval(() => {
        setTotalSeconds((prevTotalSeconds) => {
          if (prevTotalSeconds > 0) {
            const remainingMinutes = Math.floor(prevTotalSeconds / 60);
            const remainingSeconds = prevTotalSeconds % 60;
            const formattedTime = `${remainingMinutes
              .toString()
              .padStart(2, "0")}:${remainingSeconds
              .toString()
              .padStart(2, "0")}`;
            setTimerText(formattedTime);
            return prevTotalSeconds - 1;
          } else {
            clearInterval(interval);
            setTimerInterval(null);
            Vibration.vibrate();
            setTimerText("");
            return 0;
          }
        });
      }, 1000);

      setTimerInterval(interval);
    } else {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setTimerText("");
      setTotalSeconds(0);
    }
  };

  // Card 안에 들어갈 요소들
  const renderItem = ({ item, index }) => (
    <View style={[styles.card]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.servingInfo}>{item.serving}</Text>
      </View>

      <TouchableOpacity
        onPress={() => handlePickImage(index)}
        style={styles.imageContainer}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <IconButton icon="camera" iconColor={MD3Colors.error50} size={30} />
        )}
      </TouchableOpacity>

      <View>
        {item.timer ? (
          <TouchableOpacity onPress={() => handleShowTimer(item)}>
            {timerText ? (
              <Text style={styles.timerText}>{timerText}</Text>
            ) : (
              <FAB icon="timer" style={styles.timer} size="large" />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {index != 0 && (
        <Text style={styles.stepDescription}>{item.description}</Text>
      )}

      {index === recipe.steps.length - 1 && <View></View>}

      {index === 0 && <IngredientList ingredients={recipe.ingredients} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recipe.steps}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          setCurrentIndex(
            Math.floor(
              event.nativeEvent.contentOffset.x / Dimensions.get("window").width
            )
          );
        }}
      />
      {renderDots(recipe.steps)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: "#fofofo",
  },
  card: {
    width: Dimensions.get("window").width,
    padding: 16,
    backgroundColor: "white",
  },
  imageContainer: {
    height: 200,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginLeft: 5,
  },
  servingInfo: {
    fontSize: 16,
    marginTop: 24,
    marginRight: 5,
  },
  ingredinet: {
    fontSize: 16,
    fontWeight: "bold",
  },
  stepDescription: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  dotContainerHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "gray",
    marginHorizontal: 4,
  },
  timerText: {
    position: "absolute",
    margin: 20,
    fontSize: 40,
    fontWeight: "bold",
    color: "yellowgreen",
  },
  timer: {
    position: "absolute",
    margin: 20,
  },
  cardModalVisible: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default RecipeProcessViwer;