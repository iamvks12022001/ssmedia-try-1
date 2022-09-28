const video = document.getElementById("video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
let predictedAges = [];

/****Loading the model ****/
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models_ai"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models_ai"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models_ai"),
  faceapi.nets.ageGenderNet.loadFromUri("/models_ai"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: true },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

/****Fixing the video with based on size size  ****/
function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    video.style.width = "320px";
  } else {
    video.style.width = "500px";
  }
}

screenResize(isScreenSmall);
isScreenSmall.addListener(screenResize);

/****Event Listeiner for the video****/
video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  let container = document.querySelector(".container");
  container.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    console.log("here we go again");
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withAgeAndGender();

    const resizedDetections = await faceapi.resizeResults(
      detections,
      displaySize
    );
    await canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    /****Drawing the detection box and landmarkes on canvas****/
    await faceapi.draw.drawDetections(canvas, resizedDetections);
    await faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    /****Setting values to the DOM****/
    if (resizedDetections && Object.keys(resizedDetections).length > 0) {
      const age = resizedDetections.age;
      const interpolatedAge = await interpolateAgePredictions(age);
      // const gender = resizedDetections.gender;
      // const expressions = resizedDetections.expressions;
      // const maxValue = Math.max(...Object.values(expressions));
      // const emotion = Object.keys(expressions).filter(
      //   (item) => expressions[item] === maxValue
      // );
      document.getElementById("age").innerText = `Age - ${interpolatedAge}`;
      clearInterval();
      // document.getElementById("gender").innerText = `Gender - ${gender}`;
      // document.getElementById("emotion").innerText = `Emotion - ${emotion[0]}`;
      if (interpolatedAge > 18) {
        document.cookie = "verified=true";
        document.getElementById("res").src = "../uploads/images/correct.png";
        window.location.replace("./signupauth");
      } else {
        document.cookie = "verified=false";
        document.getElementById("res").src = "../uploads/images/wrong.png";
        window.location.replace("/");
      }
    }
  }, 10000);
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}
