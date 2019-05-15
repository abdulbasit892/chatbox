var current__room = document.getElementById("current_room__info");
var invite = document.getElementById("inviteLink");
var userList = document.getElementById("userList");
var chat__rooms = document.getElementById("chat__rooms");
var sent__message = document.getElementById("sent__message");
var messages = document.getElementById("messages");
var CurrentUserName = document.getElementById("userName");
var logLink = document.getElementById("logLink");
var moreFunctions = document.getElementById("moreFunctions");
var admin__name = document.getElementById("admin__name");
var messgaeElement = document.getElementById("message");

const id = window.location.search.replace("?", "");
var users, room, totalUsers;
var userUID = JSON.parse(localStorage.getItem("lap_element")).userUid;

//---------------------------------------------------
//         SnackBar
//---------------------------------------------------
logLink.addEventListener("click", () => {
  moreFunctions.classList.toggle("displaying");
});

//---------------------------------------------------
//         fetches the current user data
//---------------------------------------------------
async function getUserData(userUID) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref("users/" + userUID)
      .on("value", function(snapshot) {
        users = snapshot.val();
        resolve(users);
        console.log(users);
      });
  });
}
var adminUid;
//---------------------------------------------------
//         fetches the current room data
//---------------------------------------------------
async function getRoomData(user) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref("Rooms/" + user)
      .on("value", function(snapshot) {
        room = snapshot.val();
        resolve(room);
        totalUsers = Object.getOwnPropertyNames(room.users).length - 1;
        adminUid = room.AdminUid;
        getUserData(adminUid).then(data => {
          admin__name.innerHTML = data.username;
        });
      });
  });
}
//---------------------------------------------------
//         fetches the all room data
//---------------------------------------------------

async function getAllRoomData(room) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref("Rooms/" + room)
      .on("value", function(snapshot) {
        data = snapshot.val();
        resolve(data);
      });
  });
}
//---------------------------------------------------
//         render the current room info
//---------------------------------------------------
function renderCurrentRoom(room) {
  var current__room__info = `<div class="current__room__logo" >
            <img src="img/logo.png" alt="room" />
          </div>
          <div class="current__room__details">
            <h1>${room.RoomName}</h1>
            <p>created on ${room.DateCreated}</p>
            <h2>All Users : <span>${totalUsers}</span></h2>
          </div>`;
  current__room.innerHTML = current__room__info;
}
//---------------------------------------------------
//           render all the users in current room
//---------------------------------------------------
function renderUserList(room) {
  if (totalUsers > 0) {
    for (let i = 1; i <= totalUsers; i++) {
      var userListDemo = ` <li>
                <img src="img/avatar${i % 6}.png" alt="user" />
                <h4>${room.users[`${i}`].username}</h4>
              </li>`;
      userList.insertAdjacentHTML("beforeend", userListDemo);
    }
    clearLoader();
  }
}

//---------------------------------------------------
//           handle the invite button
//---------------------------------------------------
function inviter(room) {
  invite.addEventListener("click", () => {
    var inviteLink =
      "home/a/Desktop/sudofy/javascript-task-2/index.html" + "?" + room;
    var x = document.getElementById("snackbar");
    x.innerHTML = inviteLink;
    x.className = "show";
    setTimeout(function() {
      x.className = x.className.replace("show", "");
    }, 7000);
  });
}

//---------------------------------------------------
//           add new user into the room info
//---------------------------------------------------
async function AddNewUser(roomUID, userId, userName) {
  return new Promise((resolve, reject) => {
    const currentuser = totalUsers + 1;
    //  enter index of user in rooms table
    firebase
      .database()
      .ref("Rooms/" + roomUID + "/users")
      .update({ [currentuser]: userId });
    //   enter user info
    firebase
      .database()
      .ref("Rooms/" + roomUID + "/users/" + currentuser)
      .update({ username: userName, uid: userId });
    //    enter room info in user table
    firebase
      .database()
      .ref("users/" + userId + "/Rooms/" + roomUID)
      .update({ s: 2 });
    console.log("done");
    resolve(currentuser);
  });
}

//---------------------------------------------------
//           render other rooms
//---------------------------------------------------

function renderRoomList(room, ids, users) {
  var li = document.createElement("li");
  li.innerHTML = room.RoomName; // Text inside
  chat__rooms.appendChild(li); // Append it

  li.onclick = () => {
    clearHighlightClass();
    li.classList.add("highlight");
    messages.innerHTML = "";
    renderAllMessages(ids);
    getUserData(room.AdminUid).then(data => {
      console.log(data);
      admin__name.innerHTML = data.username;
    });
    userList.innerHTML = "";
    renderUserList(room);
  };
}
renderLoader(userList);

if (id == "") {
  getUserData(userUID).then(data => {
    CurrentUserName.innerHTML = data.username;
    getRoomData(data.RoomUid).then(room => {
      renderAllMessages(data.RoomUid).then(messgaeData => {});
      renderCurrentRoom(room);
      renderUserList(room);
      inviter(data.RoomUid);
      allRooms = Object.keys(data.Rooms);
      allRooms.forEach(room => {
        getAllRoomData(room).then(datas => {
          console.log(data.RoomUid);
          renderRoomList(datas, data.RoomUid, data);
        });
      });
    });
    submit(data, data.RoomUid);
  });
} else {
  getUserData(userUID).then(data => {
    CurrentUserName.innerHTML = data.username;

    getRoomData(id).then(room => {
      renderAllMessages(id).then(messgaeData => {});

      if (!Object.keys(users.Rooms).includes(id)) {
        AddNewUser(id, data.id, data.username).then(currentuser => {
          getUserData(userUID).then(newData => {
            var allRooms = Object.keys(newData.Rooms);
            allRooms.forEach(room => {
              getAllRoomData(room).then(datas => {
                renderRoomList(datas, room, data);
              });
            });
          });

          renderCurrentRoom(room);
          getRoomData(id).then(newRoom => {
            renderUserList(newRoom);
          });
          inviter(id);
          submit(data, id);
        });
      } else {
        var allRooms = Object.keys(data.Rooms);
        allRooms.forEach(room => {
          getAllRoomData(room).then(datas => {
            renderRoomList(datas, room, data);
          });
        });
        renderCurrentRoom(room);
        getRoomData(id).then(newRoom => {
          renderUserList(room);
        });
        inviter(id);
        submit(data, id);
      }
    });
  });
}

function renderCurrentMessage(user, message) {
  var test = `<li><span>${user}</span> ${[message]}</li>`;
  messages.insertAdjacentHTML("beforeend", test);
  messgaeElement.value = "";
}
async function renderAllMessages(id) {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref("Rooms/" + id + "/Messages/")
      .on("value", function(snapshot) {
        messgaeData = snapshot.val();
        // resolve(data);
        messages.innerHTML = "";

        for (var message in messgaeData) {
          renderCurrentMessage(
            Object.keys(messgaeData[message])[0],
            messgaeData[message][Object.keys(messgaeData[message])]
          );
        }
      });
  });
}
//--------------------------------------------
//         check for enter pressed
//----------------------------------------
var input = document.getElementById("message");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    document.getElementById("sent__message").click();
  }
});
var searchForm = document.getElementById("searchForm");
var searchQuery = document.getElementById("searchQuery");
searchForm.addEventListener("submit", function(event) {
  event.preventDefault();
  var seachQuerys = "?" + searchQuery.value;
  window.location.href = "chatroom.html" + seachQuerys;
});
//-------------------------------------------
//          push data message to firebase
//-----------------------------------------
function submit(users, id) {
  sent__message.addEventListener("click", () => {
    var message = messgaeElement.value;
    if (!message == "") {
      firebase
        .database()
        .ref("Rooms/" + id + "/Messages")
        .push({ [users.username]: message })
        .then(() => {});
    }
  });
}
//------------------------------------
//       render and clear loader
//-------------------------------------
function renderLoader(parent) {
  const loader = `
        <div class="loader">
            <svg>
                <use href="img/icons.svg#icon-cw" ></use>
            </svg>
        </div>
    `;
  parent.insertAdjacentHTML("afterbegin", loader);
}
function clearLoader() {
  const loader = document.querySelector(".loader");

  if (loader) loader.parentElement.removeChild(loader);
}

//--------------------------------------------
//              signOut
//---------------------------------------------
moreFunctions.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = "index.html";
    });
});

function clearHighlightClass() {
  const resultsArr = Array.from(document.querySelectorAll("#chat__rooms > li"));
  console.log(resultsArr);
  resultsArr.forEach(el => {
    el.classList.remove("highlight");
  });
}
