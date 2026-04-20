async function joinGhostChat(walletAddress, signature) {
  // Use the signature to derive a Matrix Access Token
  const matrixClient = matrixcs.createClient("https://matrix.org");
  
  try {
    const loginResponse = await matrixClient.login("m.login.password", {
      user: `habacoin_${walletAddress}`,
      password: signature // The signature acts as the unique encrypted password
    });
    console.log("Joined Ghost Chat safely.");
    window.location.href = "/chat-room";
  } catch (err) {
    // If user doesn't exist, register them automatically
    console.log("Registering new Ghost User...");
  }
}
