var playing = false;
var paused = false;
var score;
var trialsleft;
var step; //for random steps
var actions = []; //for multiple falling objects
var fallingObjects = []; //track multiple objects
var nextObjectId = 1;
var spawnTimer; // Timer for spawning objects
// Regular items to slice
var goodItems = ["scary.png", "gun.png", "f150.png", "trumphead.png"];
// Scottish Ri items - rare, lose life if sliced, gain life if they fall through
var badItems = ["scottishri.png", "scottishri1.png", "scottishri2.png"];

$(function () {
  //click on start or reset button
  $("#front").show();
  $("#startReset").click(function () {
    if (playing == true) {
      //if we are playing
      location.reload(); //reload page
    } else {
      //if we are not playing from before
      $("#front").hide();
      $("#score").show();
      $("#fruitcontainer").addClass("playing");
      playing = true;
      paused = false;
      //set score to 0
      score = 0;
      $("#scoreValue").html(score);

      //show trials left box
      $("#trialsleft").show();
      trialsleft = 3;
      addhearts();

      //hide game over box
      $("#gameOver").hide();

      //change button to reset game
      $("#startReset").html("Reset Game");
      $("#pauseBtn").show();
      $("#pauseBtn").html("Pause");

      //clear any existing objects
      $("#fallingObjects").empty();
      fallingObjects = [];
      actions = [];
      
      // Clear any existing spawn timer
      if (spawnTimer) {
        clearTimeout(spawnTimer);
      }

      //start action
      startObjectSpawning();
    }
  });

  //pause button functionality
  $("#pauseBtn").click(function () {
    if (!playing) return;
    
    if (paused) {
      // Unpause
      paused = false;
      $("#pauseBtn").html("Pause");
      startObjectSpawning(); // Resume spawning
    } else {
      // Pause
      paused = true;
      $("#pauseBtn").html("Resume");
      if (spawnTimer) {
        clearTimeout(spawnTimer);
        spawnTimer = null;
      }
    }
  });
  
  //slice an item - now handled by event delegation for multiple objects
  $("#fallingObjects").on("mouseover", ".fruit", function () {
    // Prevent slicing while paused or not playing
    if (!playing || paused) return;
    
    var $fruit = $(this);
    var objectId = $fruit.data("id");
    var objectData = fallingObjects.find(obj => obj.id == objectId);
    
    if (!objectData) return;

    //play sound
    $("#slicesound")[0].play();

    //stop this fruit's movement
    clearInterval(objectData.action);

    // Check what type of item was sliced
    if (objectData.type === "bad") {
      // Scottish Ri sliced - lose a life!
      trialsleft--;
      addhearts();
      if (trialsleft <= 0) {
        // Game over
        playing = false;
        $("#score").hide();
        $("#startReset").html("Start Game");
        $("#gameOver").show();
        $("#gameOver").html(
          "<p>🌲 Game Over! 🌲</p><p>Don't slice the Scottish Ri!</p><p>Your score is " + score + "</p>"
        );
        $("#trialsleft").hide();
        stopAllActions();
        return;
      }
    } else {
      // Good item sliced - increase score
      score++;
      $("#scoreValue").html(score);
    }

    //hide fruit with slice effect
    $fruit.hide("explode", 500);
    
    // Remove from tracking arrays
    removeObject(objectId);
  });

  //functions

  //addhearts - forest themed
  function addhearts() {
    $("#trialsleft").empty();
    var regularLives = Math.min(trialsleft, 3); // Original 3 lives show as 🌿
    var bonusLives = Math.max(0, trialsleft - 3); // Extra lives from Scottish Ri show as 🪴
    
    // Add regular lives (🌿)
    for (i = 0; i < regularLives; i++) {
      $("#trialsleft").append('<span class="life">🌿</span>');
    }
    // Add bonus lives (🪴)
    for (i = 0; i < bonusLives; i++) {
      $("#trialsleft").append('<span class="life">🪴</span>');
    }
  }

  //start object spawning with score-based difficulty progression
  function startObjectSpawning() {
    spawnObject(); // Spawn first object immediately
    scheduleNextSpawn();
  }
  
  function scheduleNextSpawn() {
    if (!playing || paused) return;
    
    // Much more gradual difficulty scaling
    var baseDelay = 3000; // 3 seconds base
    var difficultyReduction = Math.min(score * 50, 1500); // Each point = 50ms reduction, max 1.5s reduction
    var minDelay = Math.max(1000, baseDelay - difficultyReduction); // Min 1 second
    
    // Distribution-based multi-spawn system - EXTENDED TO 400+ with 5 and 6 objects!
    var multiSpawn = 1; // Default to 1
    
    if (score > 10) {
      var random = Math.random() * 100; // 0-100
      var scoreBonus = Math.floor((score - 10) / 5); // Every 5 points adds bonus
      
      // Base percentages that increase with score - NO CAPS for legendary scores!
      var chance2 = 15 + scoreBonus * 4; // 15% base, +4% per 5 points, NO CAP
      var chance3 = Math.max(0, scoreBonus - 1) * 3; // Starts at score 15, +3% per 5 points, NO CAP
      var chance4 = Math.max(0, scoreBonus - 2) * 2; // Starts at score 20, +2% per 5 points, NO CAP
      var chance5 = Math.max(0, scoreBonus - 38) * 1.5; // Starts at score 200, +1.5% per 5 points
      var chance6 = Math.max(0, scoreBonus - 58) * 1; // Starts at score 300, +1% per 5 points
      
      if (random < chance6) {
        multiSpawn = 6;
      } else if (random < chance6 + chance5) {
        multiSpawn = 5;
      } else if (random < chance6 + chance5 + chance4) {
        multiSpawn = 4;
      } else if (random < chance6 + chance5 + chance4 + chance3) {
        multiSpawn = 3;
      } else if (random < chance6 + chance5 + chance4 + chance3 + chance2) {
        multiSpawn = 2;
      }
      // else stays 1
    }
    
    // Random variation
    var delay = minDelay + Math.random() * 800; // Add 0-0.8 second random
    
    spawnTimer = setTimeout(function() {
      if (playing && !paused) {
        // Spawn multiple objects
        for (var i = 0; i < multiSpawn; i++) {
          setTimeout(function() {
            if (playing && !paused) spawnObject();
          }, i * 200); // Stagger by 200ms
        }
        scheduleNextSpawn();
      }
    }, delay);
  }

  //spawn a new falling object
  function spawnObject() {
    if (!playing) return; // Don't spawn if not playing
    
    var objectId = nextObjectId++;
    var $fruit = $('<img class="fruit" data-id="' + objectId + '">');
    
    // Choose random item type and image
    var itemData = chooseRandomItem();
    $fruit.attr("src", itemData.src);
    
    // Random position - adjusted for bigger screen
    $fruit.css({
      left: Math.round(850 * Math.random()),
      top: -80,
      display: 'block', // Make sure it's visible
      position: 'absolute'
    });
    
    // Add to container
    $("#fallingObjects").append($fruit);
    
    // Determine speed
    var step;
    if (itemData.type === "bad") {
      step = 3; // Medium speed for Scottish Ri
    } else {
      step = 1 + Math.round(5 * Math.random()); // Random speed for good items
    }
    
    // Create object data
    var objectData = {
      id: objectId,
      type: itemData.type,
      step: step,
      $element: $fruit,
      action: null
    };
    
    // Start falling animation
    objectData.action = setInterval(function() {
      if (!playing || paused) {
        if (!playing) clearInterval(objectData.action);
        return;
      }
      
      var currentTop = $fruit.position().top;
      $fruit.css("top", currentTop + step);
      
      // Check if object hit bottom
      if (currentTop > $("#fruitcontainer").height() - 100) {
        handleObjectMissed(objectData);
      }
    }, 10);
    
    fallingObjects.push(objectData);
    
    // Debug log
    console.log("Spawned object:", objectId, itemData.type, itemData.src);
  }

  //choose random item type and image
  function chooseRandomItem() {
    // Score-based Scottish Ri rarity
    var scottishRiChance = 0.10; // 10% base
    if (score >= 250) {
      scottishRiChance = 0.05; // 5% after score 250 - ultra rare!
    }
    
    if (Math.random() < (1 - scottishRiChance)) {
      // Good item
      var randomGoodItem = goodItems[Math.floor(Math.random() * goodItems.length)];
      return {
        src: "../../assets/images/slicerpics/" + randomGoodItem,
        type: "good"
      };
    } else {
      // Bad item (Scottish Ri)
      var randomBadItem = badItems[Math.floor(Math.random() * badItems.length)];
      return {
        src: "../../assets/images/slicerpics/" + randomBadItem,
        type: "bad"
      };
    }
  }

  //handle when object reaches bottom
  function handleObjectMissed(objectData) {
    clearInterval(objectData.action);
    
    if (objectData.type === "bad") {
      // Scottish Ri fell through - gain a life!
      if (trialsleft < 5) {
        trialsleft++;
        addhearts();
      }
    } else {
      // Good item missed - lose a life
      trialsleft--;
      addhearts();
      
      if (trialsleft <= 0) {
        // Game over
        playing = false;
        $("#score").hide();
        $("#startReset").html("Start Game");
        $("#gameOver").show();
        $("#gameOver").html(
          "<p>🌲 Game Over! 🌲</p><p>Your score is " + score + "</p>"
        );
        $("#trialsleft").hide();
        stopAllActions();
        return;
      }
    }
    
    // Remove object
    objectData.$element.remove();
    removeObject(objectData.id);
  }

  //remove object from tracking
  function removeObject(objectId) {
    fallingObjects = fallingObjects.filter(obj => obj.id !== objectId);
  }

  //stop all falling objects
  function stopAllActions() {
    // Clear spawn timer
    if (spawnTimer) {
      clearTimeout(spawnTimer);
      spawnTimer = null;
    }
    
    // Clear all falling objects
    fallingObjects.forEach(obj => {
      clearInterval(obj.action);
      obj.$element.remove();
    });
    fallingObjects = [];
    actions = [];
  }


}); 