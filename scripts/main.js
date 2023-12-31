//Global variable pointing to the current user's Firestore document
var currentUser;

function doAll() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = db.collection("users").doc(user.uid); //global
            displayCardsDynamically("vancouver_drinking_fountains");
        } else {
            console.log("No user is signed in");
            window.location.href = "login.html";
        }
    });
}
doAll();

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("waterCardTemplate"); // Retrieve the HTML element with the ID "waterCardTemplate" and store it in the cardTemplate variable. 

    let count = 0; //to show only limited locations

    db.collection(collection).get()
        .then(allWaters => {
            allWaters.forEach(doc => {

                if (count >= 5) {
                    return;
                }

                var title = doc.data().name;
                var details = doc.data().location;
                var petFriendly = doc.data().pet_friendly;
                var inOperation = doc.data().in_operation;
                var fountainImg = doc.data().photo_name;
                var maintainer = doc.data().maintainer;
                var docID = doc.id;
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                //update title and text and image
                newcard.querySelector('.card-title').innerHTML = title;
                newcard.querySelector('.card-operation-open').innerHTML = "Operating time: " + inOperation;
                newcard.querySelector('.card-operation-pet').innerHTML = "Pet friendly: " + petFriendly;
                newcard.querySelector('.card-text').innerHTML = details;

                if (fountainImg) { // Check if fountainImg is not null or undefined

                    // Conditionally set the image source based on maintainer
                    if (maintainer == "parks") {
                        newcard.querySelector('.card-image').src = 'http://vanmapp1.vancouver.ca/photo/drinking_fountains/parks/' + fountainImg;
                    } else if (maintainer == "Engineering") {
                        newcard.querySelector('.card-image').src = 'http://vanmapp1.vancouver.ca/photo/drinking_fountains/eng/' + fountainImg;
                    } else {
                        newcard.querySelector('.card-image').src = 'http://vanmapp1.vancouver.ca/photo/drinking_fountains/parks/' + docID + '.jpg';
                    }
                }
                newcard.querySelector('a').href = 'content.html?docID=' + docID;

                newcard.querySelector('i').id = 'save-' + docID; // for assigning unique id to each save button
                newcard.querySelector('i').onclick = () => updateBookmark(docID);

                currentUser.get().then(userDoc => {
                    //get the user name
                    var bookmarks = userDoc.data().bookmarks;
                    if (bookmarks.includes(docID)) {
                        document.getElementById('save-' + docID).innerText = 'bookmark';
                    }
                })
                document.getElementById(collection + "-go-here").appendChild(newcard);

                count++;
            })
        })
        .catch(error => {
            console.error('Error displaying cards:', error);
        });
}

// function to update the bookmark
function updateBookmark(fountainDocID) {
    currentUser.get().then(userDoc => {

        let bookmarks = userDoc.data().bookmarks || []; // if bookmarks is null, then make it an empty array
        let iconID = "save-" + fountainDocID;
        let isBookmarked = bookmarks.includes(fountainDocID);

        // if the hike is already bookmarked, then remove it from the array
        if (isBookmarked) {
            currentUser.update({
                bookmarks: firebase.firestore.FieldValue.arrayRemove(fountainDocID)
            }).then(() => {
                document.getElementById(iconID).innerText = 'bookmark_border';
            })
            // if the hike is not bookmarked, then add it to the array
        } else {
            console.log("cant find bookmark");
            currentUser.update({
                bookmarks: firebase.firestore.FieldValue.arrayUnion(fountainDocID)
            }).then(() => {
                document.getElementById(iconID).innerText = 'bookmark';
            })
        }
    });
}
