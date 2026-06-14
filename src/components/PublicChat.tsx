interface SocketSystemMessage {
  type: string;
  content: string;
  name: string;
  coords: { lat: number; lng: number };
}

// Enforces structural sanitization routines across parameters to render plain text safely
function sanitizeStringPayload(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

socket.on("system_message", (rawMsg: unknown) => {
  if (!rawMsg || typeof rawMsg !== 'object') return;
  
  const msg = rawMsg as Partial<SocketSystemMessage>;

  // Structural Enforcement Check: Drop payload if type vectors do not match requirements
  if (msg.type !== "GREEN_ALERT" || !msg.content || !msg.name || !msg.coords) return;

  // Enforce validation constraints over numeric geometry values
  const lat = Number(msg.coords.lat);
  const lng = Number(msg.coords.lng);
  if (isNaN(lat) || isNaN(lng)) return;

  const sanitizedContent = sanitizeStringPayload(msg.content);
  const sanitizedName = sanitizeStringPayload(msg.name);

  // 1. Commit sanitized text payloads safely to state log structures
  setMessages((prev) => [
    ...prev, 
    {
      user: "HABA_BOT",
      text: sanitizedContent,
      isSystem: true
    }
  ]);

  // 2. Commit sanitized geofenced target objects securely to tracking arrays
  setHotspots((prev) => [
    ...prev, 
    { 
      coords: { lat, lng }, 
      name: sanitizedName 
    }
  ]);
  
  // 3. Trigger targeted client-device vibration alerts safely
  if (typeof window !== 'undefined' && window.navigator && typeof window.navigator.vibrate === 'function') {
    window.navigator.vibrate([200, 100, 200]);
  }
});

