var water_fountainID = localStorage.getItem('water_fountainID');
function displayWater_fountainName() {
    db.collection('vancouver_drinking_fountains').doc(water_fountainID).get().then((thisWater_fountain) => {
        water_fountainName = thisWater_fountain.data().location;
        document.getElementById("water_fountain_Name").innerHTML = water_fountainName;
    })
}
displayWater_fountainName()


var ImageFile;
function listenFileSelect() {
    // listen for file selection
    var fileInput = document.getElementById("mypic-input");
    const image = document.getElementById("mypic-goes-here");

    // When a change happens to the File Chooser Input
    fileInput.addEventListener('change', function (e) {
        ImageFile = e.target.files[0];   //Global variable
        var blob = URL.createObjectURL(ImageFile);
        image.src = blob; // Display this image
    })
}
listenFileSelect();


function uploadPic(postDocID) {
    return new Promise((resolve, reject) => {
        console.log("inside uploadPic " + postDocID);
        var storageRef = storage.ref("images/" + postDocID + ".jpg");

        storageRef.put(ImageFile)
            .then(function () {
                console.log('2. Uploaded to Cloud Storage.');
                return storageRef.getDownloadURL();
            })
            .then(function (url) {
                console.log("3. Got the download URL.");
                return db.collection("reviews").doc(postDocID).update({
                    "image": url
                });
            })
            .then(function () {
                console.log('4. Added pic URL to Firestore.');
                savePostIDforUser(postDocID);
                resolve();
            })
            .catch((error) => {
                console.log("error uploading to cloud storage", error);
                reject(error);
            });
    });
}


function savePostIDforUser(postDocID) {
    firebase.auth().onAuthStateChanged(user => {
        console.log("user id is: " + user.uid);
        console.log("postdoc id is: " + postDocID);
        db.collection("users").doc(user.uid).update({
            myposts: firebase.firestore.FieldValue.arrayUnion(postDocID)
        })
            .then(() => {
                console.log("5. Saved to user's document!");
                alert("Post is complete!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    })
}


// Select all elements with the class name "star" and store them in the "stars" variable
const stars = document.querySelectorAll('.star');

// Iterate through each star element
stars.forEach((star, index) => {
    // Add a click event listener to the current star
    star.addEventListener('click', () => {
        // Fill in clicked star and stars before it
        for (let i = 0; i <= index; i++) {
            // Change the text content of stars to 'star' (filled)
            stars[i].textContent = 'star';
        }
        for (let j = index + 1; j < stars.length; j++) {
            stars[j].textContent = 'star_outline';
        }
    });
});


function savePost() {
    console.log("inside write review");
    let water_fountain_Title = document.getElementById("title").value;
    let water_fountain_Description = document.getElementById("description").value;

    // Get the star rating
    // Get all the elements with the class "star" and store them in the 'stars' variable
    const stars = document.querySelectorAll('.star');
    // Initialize a variable 'water_fountain_Rating' to keep track of the rating count
    let water_fountain_Rating = 0;
    // Iterate through each element in the 'stars' using the forEach method
    stars.forEach((star) => {
        // Check if the text content of the current 'star' element is equal to the string 'star'
        if (star.textContent === 'star') {
            // If the condition is met, increment the 'water_fountain_Rating' by 1
            water_fountain_Rating++;
        }
    });


    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Get the document for the current user.
        db.collection("reviews").add({
            water_fountainName: water_fountainName,
            water_fountain_DocID: water_fountainID,
            userID: userID,
            title: water_fountain_Title,
            description: water_fountain_Description,
            rating: water_fountain_Rating, // Include the rating in the review
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(doc => {
            console.log("1. Post document added!");
            return uploadPic(doc.id);
        }).then(() => {
            console.log("Redirecting to thanks page");
            window.location.href = "thanks.html";
        }).catch(error => {
            console.error("Error: ", error);
        });
    } else {
        console.log("No user is signed in");
        window.location.href = 'writing_reviews.html';
    }
}
