export const sdsService = {
    async getSDSByName(name: string) {
        const response = await fetch(`/api/safety/sds?name=${encodeURIComponent(name)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch SDS');
        }
        return response.json();
    },

    async getSDSFromPhoto(buffer: Buffer) {
        const response = await fetch('/api/safety/sds/photo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: buffer,
        });
        if (!response.ok) {
            throw new Error('Failed to process photo');
        }
        return response.json();
    },

    async getSDSFromVoice(buffer: Buffer) {
        const response = await fetch('/api/safety/sds/voice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: buffer,
        });
        if (!response.ok) {
            throw new Error('Failed to process voice input');
        }
        return response.json();
    },
};
