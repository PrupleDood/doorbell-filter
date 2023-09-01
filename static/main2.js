function textToSpeech(text) {
  if (!textToSpeech.cooldown) {
    console.log(text)
    if ('speechSynthesis' in window) {
      const synthesis = window.speechSynthesis;

      // Create an utterance
      const utterance = new SpeechSynthesisUtterance();

      // Set default options
      utterance.rate = 1; // Speech rate (0.1 to 10)
      utterance.pitch = 1; // Speech pitch (0 to 2)
      utterance.lang = 'en-US'; // Speech language
      switch (text) {
        case 'Person': 
          utterance.text = "Unidentified Person";
          break;
        case 'Resident':
          utterance.text = "Resident";
          break;
        case 'Non-Resident':
          utterance.text = "Non-Resident";
          break;
        case 'Box':
          utterance.text = "Box";
          break; 
        default:
          utterance.text = ""
          break;
      }

      synthesis.speak(utterance);

      textToSpeech.cooldown = true;
      setTimeout(() => {
        textToSpeech.cooldown = false;
      }, 3000); // Cooldown period of 3 seconds
    } else {
      alert('Speech synthesis is not supported in this browser.');
    }
  } else {
    // Function is on cooldown.
  }
}

// function for updating logs
const updateLogs = function (date, data) {
  // Running on the client-side (web browser)
  if (!updateLogs.cooldown) {
    const newEntry = {
        id: date,
        message: {data}
    };

    const filePath = 'data.json'; 

    // Fetch existing JSON data (assuming it's available at a URL)
    fetch(filePath)
      .then(response => response.json())
      .then(jsonObject => {
        jsonObject[newEntry.id] = newEntry.message;
          
        const modifiedJsonString = JSON.stringify(jsonObject);
          
        fetch('update_json', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: modifiedJsonString
        })
        .then(response => response.json())
        .then(updatedJsonData => {
          console.log('JSON file updated on the server:', updatedJsonData);
        })
        .catch(error => {
          console.error('Error updating JSON on the server:', error);
        });
          
      })
      .catch(error => {
        console.error('Error fetching JSON:', error);
      });

    updateLogs.cooldown = true;
    setTimeout(() => {
      updateLogs.cooldown = false;
    }, 3000); // Cooldown period of 1 second
  } 
  else {
    // Fucntion on cooldown
  }
}

$(function () {
  const video = $("video")[0];

  var model;
  var cameraMode = "environment"; // or "user"

  const startVideoStreamPromise = navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        facingMode: cameraMode
      }
    })
    .then(function (stream) {
      return new Promise(function (resolve) {
        video.srcObject = stream;
        video.onloadeddata = function () {
          video.play();
          resolve();
        };
      });
    });

  var publishable_key = "rf_VNXH9GsgjAfw3QfFIqoV7vpBI603";
  var toLoad = {
    model: "box-human",
    version: 1
  };

  const loadModelPromise = new Promise(function (resolve, reject) {
    roboflow
      .auth({
        publishable_key: publishable_key
      })
      .load(toLoad)
      .then(function (m) {
        model = m;
        resolve();
      });
  });

  Promise.all([startVideoStreamPromise, loadModelPromise]).then(function () {
    $("body").removeClass("loading");
    resizeCanvas();
    detectFrame();
  });

  // Initiallizing 2nd model
  var publishable_key = "rf_s5vALMmlFZTnDRr5RwJl";
  var toLoad = {
    model: "resident-vs-unknown",
    version: 1
  };
    
  var model2;
            
  const loadModelPromise2 = new Promise(function (resolve, reject) {
    roboflow
    .auth({
      publishable_key: publishable_key
    })
    .load(toLoad)
    .then(function (m) {
      model2 = m;
      resolve();
    });
  });
    
  Promise.all([loadModelPromise2]).then( function () {
    console.log(model2, "Loaded model 2");
  });

  
  var canvas, ctx;
  const font = "16px sans-serif";

  function videoDimensions(video) {
    // Ratio of the video's intrisic dimensions
    var videoRatio = video.videoWidth / video.videoHeight;

    // The width and height of the video element
    var width = video.offsetWidth,
      height = video.offsetHeight;

    // The ratio of the element's width to its height
    var elementRatio = width / height;

    // If the video element is short and wide
    if (elementRatio > videoRatio) {
      width = height * videoRatio;
    } else {
      // It must be tall and thin, or exactly equal to the original ratio
      height = width / videoRatio;
    }

    return {
      width: width,
      height: height
    };
  }

  $(window).resize(function () {
    resizeCanvas();
  });

  const resizeCanvas = function () {
    $("canvas").remove();

    canvas = $("<canvas/>");

    ctx = canvas[0].getContext("2d");

    var dimensions = videoDimensions(video);
        
    console.log(
      video.videoWidth,
      video.videoHeight,
      video.offsetWidth,
      video.offsetHeight,
      dimensions
    );

    canvas[0].width = video.videoWidth;
    canvas[0].height = video.videoHeight;

    canvas.css({
      width: dimensions.width,
      height: dimensions.height,
      left: ($(window).width() - dimensions.width) / 2,
      top: ($(window).height() - dimensions.height) / 2 + 80
    });

    // document.querySelector(".disp").append(canvas);
    $("body").append(canvas)
  };

  
  const renderPredictions = function (predictions) {
    var dimensions = videoDimensions(video);

    const captureFrame = function () {
      const capturedImageData = ctx.getImageData(0, 0, dimensions['width'], dimensions['height']);
                      
      return capturedImageData;
    }
        
    var scale = 1;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
    
    predictions.forEach(function (prediction) {
      const x = prediction.bbox.x;
      const y = prediction.bbox.y;
    
      const width = prediction.bbox.width;
      const height = prediction.bbox.height;
    
      // Draw the bounding box.
      ctx.strokeStyle = prediction.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(
        (x - width / 2) / scale,
        (y - height / 2) / scale,
        width / scale,
        height / scale
      );
    
      //if prediction.class is a human call the second model from here, in the second model pass this frame, and get result that if it was  resident, if it was a resident -> do nothing, if it is not a resident -> do something(notifiction, ring a alarm, some speaker)
      console.log(prediction.class)
      if (prediction.class === "Human") {
        if (classifyResident()) {
          prediction.class = "Resident";
        }
        else {
          prediction.class = "Non-Resident";
        }
      }

      textToSpeech(prediction.class);
          
      // Assuming you have a function to call the second model for resident classification
      function classifyResident() {
        if (!classifyResident.cooldown) {
          model2.detect(captureFrame()).then(function(predictions2) {
            console.log(predictions2)
            if (!predictions2) {
              return false;
            }
            else {
              return true;
            }
          })
          .catch(function (e) {
            console.log("CAUGHT", e);
            return false;
          });

          classifyResident.cooldown = true;
          setTimeout(() => {
            classifyResident.cooldown = false;
          }, 2000); // Cooldown period of 1 second

        }
        else {
          // on cooldown
        }   
            
      };
          
      // Draw the label background.
      ctx.fillStyle = prediction.color;
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(
        (x - width / 2) / scale,
        (y - height / 2) / scale,
        textWidth + 8,
        textHeight + 4
      );
    
    });

    predictions.forEach(function (prediction) {
      const x = prediction.bbox.x;
      const y = prediction.bbox.y;
      const width = prediction.bbox.width;
      const height = prediction.bbox.height;
      
      // Draw the text last to ensure it's on top.
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000000";
      ctx.fillText(
        prediction.class,
        (x - width / 2) / scale + 4,
        (y - height / 2) / scale + 1
      );
    });

    if (predictions.length != 0){
      let log_data = [];
      for (prediction of predictions) {
        log_data.push({
          class: prediction.class, 
          confidence:prediction.confidence.toFixed(2)*100
        });
      }
            
      updateLogs(
        new Date(),
        log_data
      );
    }
  };

  var prevTime;
  var pastFrameTimes = [];
  const detectFrame = function () {
    if (!model) return requestAnimationFrame(detectFrame);

    model
      .detect(video)
      .then(function (predictions) {
        requestAnimationFrame(detectFrame);
        renderPredictions(predictions);

        if (prevTime) {
          pastFrameTimes.push(Date.now() - prevTime);
          if (pastFrameTimes.length > 30) pastFrameTimes.shift();

          var total = 0;
          _.each(pastFrameTimes, function (t) {
            total += t / 1000;
          });

          var fps = pastFrameTimes.length / total;
          $("#fps").text(Math.round(fps));
        }
        prevTime = Date.now();
      })
      .catch(function (e) {
        console.log("CAUGHT", e);
        requestAnimationFrame(detectFrame);
      });
  };
});
