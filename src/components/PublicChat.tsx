socket.on("system_message", (msg) => {
  if (msg.type === "GREEN_ALERT") {
    // 1. Add to Chat List
    setMessages(prev => [...prev, {
      user: "HABA_BOT",
      text: msg.content,
      isSystem: true
    }]);

    // 2. Update Map state automatically
    setHotspots(prev => [...prev, { coords: msg.coords, name: msg.name }]);
    
    // 3. Trigger Haptic Vibration (on mobile)
    window.navigator.vibrate([200, 100, 200]);
  }
});
