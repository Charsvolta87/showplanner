const firebaseConfig = {
  apiKey: "AIzaSyAbeysl8pBq1Eenwz8eBQ1tFUz8WgOPtO4",
  authDomain: "showsplanner.firebaseapp.com",
  databaseURL: "https://showsplanner-default-rtdb.firebaseio.com",
  projectId: "showsplanner",
  storageBucket: "showsplanner.appspot.com",
  messagingSenderId: "657949005856",
  appId: "1:657949005856:web:14a228629e29ae0f6dc445"
};

// INICIALIZACIÓN CORRECTA PARA COMPAT
firebase.initializeApp(firebaseConfig);

console.log("🔥 Firebase inicializado correctamente");
