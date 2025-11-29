export const storagePut = async (key: string, buffer: Buffer, contentType: string) => {
    return { url: `http://localhost:3000/uploads/${key}` };
};
