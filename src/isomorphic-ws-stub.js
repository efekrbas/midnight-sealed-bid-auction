export const WebSocket = typeof window !== 'undefined' ? window.WebSocket : (typeof global !== 'undefined' ? global.WebSocket : null);
export default WebSocket;
