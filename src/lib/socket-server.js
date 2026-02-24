// Helper to access the global Socket.io instance from API routes
export function getIO() {
    if (!global._io) {
        throw new Error('Socket.io not initialized. Is server.js running?');
    }
    return global._io;
}
