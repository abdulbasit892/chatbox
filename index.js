var login__button = document.getElementById("login__button");
var signup__button = document.getElementById("signup__button");
var login__form = document.getElementById("Login__form");
var Signup__form = document.getElementById("Signup__form");
var signup = document.getElementById("signup");
var login = document.getElementById("login");

const id = window.location.search;

login__button.addEventListener("click", () => {
  login__button.style.display = "none";
  signup__button.style.display = "none";
  login__form.style.display = "block";
});
login.addEventListener("click", () => {
  var email__signup = document.getElementById("email__login").value;
  var password__signup = document.getElementById("password__login").value;
  firebase
    .auth()
    .signInWithEmailAndPassword(email__signup, password__signup)
    .then(function(user) {
      local(user.user.uid);
      window.location.href = "chatroom.html" + id;
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorCode, errorMessage);
    });
});

signup__button.addEventListener("click", () => {
  login__button.style.display = "none";
  signup__button.style.display = "none";
  Signup__form.style.display = "block";
});
signup.addEventListener("click", () => {
  var email__signup = document.getElementById("email__signup").value;
  var password__signup = document.getElementById("password__signup").value;
  var name__signup = document.getElementById("name__signup").value;

  var Room__name = document.getElementById("Room__name").value;
  firebase
    .auth()
    .createUserWithEmailAndPassword(email__signup, password__signup)
    .then(function(user) {
      writeUserData(
        user.user.uid,
        name__signup,
        user.user.email,
        Room__name,
        Math.floor(100000 + Math.random() * 900000)
      );
      local(user.user.uid);
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...

      alert(errorMessage);
    });
});

function writeUserData(userId, name, email, Room, roomUID) {
  var today = new Date();
  var date =
    today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
  firebase
    .database()
    .ref("users/" + userId)
    .set({
      username: name,
      email: email,
      id: userId,
      RoomUid: roomUID
    })
    .then(function() {
      window.location.href = "chatroom.html" + id;
    });

  firebase
    .database()
    .ref("users/" + userId + "/Rooms/" + roomUID)
    .update({ s: 2 });

  firebase
    .database()
    .ref("Rooms/" + roomUID)
    .set({
      RoomName: Room,
      AdminUid: userId,
      DateCreated: date
    });
  firebase
    .database()
    .ref("Rooms/" + roomUID + "/users")
    .update({ 1: userId });
  firebase
    .database()
    .ref("Rooms/" + roomUID + "/users/" + 1)
    .update({ username: name, uid: userId });
}
function local(userId) {
  var object = {};
  object.userUid = userId;
  localStorage.setItem("lap_element", JSON.stringify(object));
}
