import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

let spacesClient;

export function getSpacesClient() {
    if (!spacesClient) {
        spacesClient = new S3Client({
            endpoint: process.env.DO_SPACES_ENDPOINT,
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.DO_SPACES_KEY,
                secretAccessKey: process.env.DO_SPACES_SECRET,
            },
            forcePathStyle: false,
        });
    }
    return spacesClient;
}

export async function uploadGLBToSpaces(buffer, key) {
    const client = getSpacesClient();
    await client.send(new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'model/gltf-binary',
        ACL: 'public-read',
    }));
    return `${process.env.DO_SPACES_CDN_URL}/${key}`;
}

export async function checkModelExists(key) {
    try {
        const client = getSpacesClient();
        await client.send(new HeadObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: key,
        }));
        return true;
    } catch {
        return false;
    }
}
