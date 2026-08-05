#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as Minio from "minio";
// Get MinIO configuration from environment variables
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000");
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
// Debug logging
console.error("MinIO Configuration:");
console.error(`  Endpoint: ${MINIO_ENDPOINT}`);
console.error(`  Port: ${MINIO_PORT}`);
console.error(`  Access Key: ${MINIO_ACCESS_KEY ? MINIO_ACCESS_KEY.substring(0, 3) + '***' : 'NOT SET'}`);
console.error(`  Secret Key: ${MINIO_SECRET_KEY ? '***' : 'NOT SET'}`);
console.error(`  Use SSL: ${MINIO_USE_SSL}`);
if (!MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    throw new Error("MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables are required");
}
// Initialize MinIO client
const minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
});
// Define tool schemas
const ListBucketsSchema = z.object({});
const CreateBucketSchema = z.object({
    bucketName: z.string().describe("Name of the bucket to create"),
    region: z.string().optional().describe("Region for the bucket (default: us-east-1)"),
});
const DeleteBucketSchema = z.object({
    bucketName: z.string().describe("Name of the bucket to delete"),
});
const ListObjectsSchema = z.object({
    bucketName: z.string().describe("Name of the bucket"),
    prefix: z.string().optional().describe("Prefix to filter objects"),
    recursive: z.boolean().optional().describe("List objects recursively (default: true)"),
});
const UploadObjectSchema = z.object({
    bucketName: z.string().describe("Name of the bucket"),
    objectName: z.string().describe("Name of the object"),
    filePath: z.string().describe("Local file path to upload"),
    contentType: z.string().optional().describe("Content type of the object"),
});
const DownloadObjectSchema = z.object({
    bucketName: z.string().describe("Name of the bucket"),
    objectName: z.string().describe("Name of the object"),
    filePath: z.string().describe("Local file path to save the downloaded object"),
});
const DeleteObjectSchema = z.object({
    bucketName: z.string().describe("Name of the bucket"),
    objectName: z.string().describe("Name of the object to delete"),
});
const GetObjectInfoSchema = z.object({
    bucketName: z.string().describe("Name of the bucket"),
    objectName: z.string().describe("Name of the object"),
});
const GeneratePresignedUrlSchema = z.object({
    bucketName: z.string().describe("Name of the bucket"),
    objectName: z.string().describe("Name of the object"),
    expiry: z.number().optional().describe("Expiry time in seconds (default: 604800 = 7 days)"),
    method: z.enum(["GET", "PUT"]).optional().describe("HTTP method (default: GET)"),
});
const CopyObjectSchema = z.object({
    sourceBucket: z.string().describe("Source bucket name"),
    sourceObject: z.string().describe("Source object name"),
    destBucket: z.string().describe("Destination bucket name"),
    destObject: z.string().describe("Destination object name"),
});
// Create MCP server
const server = new Server({
    name: "minio-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define available tools
const tools = [
    {
        name: "list_buckets",
        description: "List all buckets in MinIO",
        inputSchema: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "create_bucket",
        description: "Create a new bucket in MinIO",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket to create",
                },
                region: {
                    type: "string",
                    description: "Region for the bucket (default: us-east-1)",
                },
            },
            required: ["bucketName"],
        },
    },
    {
        name: "delete_bucket",
        description: "Delete a bucket from MinIO",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket to delete",
                },
            },
            required: ["bucketName"],
        },
    },
    {
        name: "list_objects",
        description: "List objects in a bucket",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket",
                },
                prefix: {
                    type: "string",
                    description: "Prefix to filter objects",
                },
                recursive: {
                    type: "boolean",
                    description: "List objects recursively (default: true)",
                },
            },
            required: ["bucketName"],
        },
    },
    {
        name: "upload_object",
        description: "Upload a file to MinIO",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket",
                },
                objectName: {
                    type: "string",
                    description: "Name of the object",
                },
                filePath: {
                    type: "string",
                    description: "Local file path to upload",
                },
                contentType: {
                    type: "string",
                    description: "Content type of the object",
                },
            },
            required: ["bucketName", "objectName", "filePath"],
        },
    },
    {
        name: "download_object",
        description: "Download an object from MinIO",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket",
                },
                objectName: {
                    type: "string",
                    description: "Name of the object",
                },
                filePath: {
                    type: "string",
                    description: "Local file path to save the downloaded object",
                },
            },
            required: ["bucketName", "objectName", "filePath"],
        },
    },
    {
        name: "delete_object",
        description: "Delete an object from MinIO",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket",
                },
                objectName: {
                    type: "string",
                    description: "Name of the object to delete",
                },
            },
            required: ["bucketName", "objectName"],
        },
    },
    {
        name: "get_object_info",
        description: "Get metadata information about an object",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket",
                },
                objectName: {
                    type: "string",
                    description: "Name of the object",
                },
            },
            required: ["bucketName", "objectName"],
        },
    },
    {
        name: "generate_presigned_url",
        description: "Generate a presigned URL for an object",
        inputSchema: {
            type: "object",
            properties: {
                bucketName: {
                    type: "string",
                    description: "Name of the bucket",
                },
                objectName: {
                    type: "string",
                    description: "Name of the object",
                },
                expiry: {
                    type: "number",
                    description: "Expiry time in seconds (default: 604800 = 7 days)",
                },
                method: {
                    type: "string",
                    enum: ["GET", "PUT"],
                    description: "HTTP method (default: GET)",
                },
            },
            required: ["bucketName", "objectName"],
        },
    },
    {
        name: "copy_object",
        description: "Copy an object from one location to another",
        inputSchema: {
            type: "object",
            properties: {
                sourceBucket: {
                    type: "string",
                    description: "Source bucket name",
                },
                sourceObject: {
                    type: "string",
                    description: "Source object name",
                },
                destBucket: {
                    type: "string",
                    description: "Destination bucket name",
                },
                destObject: {
                    type: "string",
                    description: "Destination object name",
                },
            },
            required: ["sourceBucket", "sourceObject", "destBucket", "destObject"],
        },
    },
];
// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "list_buckets": {
                try {
                    console.error("Attempting to list buckets...");
                    console.error(`Using endpoint: ${MINIO_ENDPOINT}:${MINIO_PORT}`);
                    console.error(`Access Key: ${MINIO_ACCESS_KEY}`);
                    console.error(`Secret Key length: ${MINIO_SECRET_KEY?.length || 0}`);
                    const buckets = await minioClient.listBuckets();
                    console.error("Successfully listed buckets");
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(buckets, null, 2),
                            },
                        ],
                    };
                }
                catch (error) {
                    console.error("Error listing buckets:", error);
                    throw error;
                }
            }
            case "create_bucket": {
                const { bucketName, region = "us-east-1" } = CreateBucketSchema.parse(args);
                await minioClient.makeBucket(bucketName, region);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Bucket '${bucketName}' created successfully in region '${region}'`,
                        },
                    ],
                };
            }
            case "delete_bucket": {
                const { bucketName } = DeleteBucketSchema.parse(args);
                await minioClient.removeBucket(bucketName);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Bucket '${bucketName}' deleted successfully`,
                        },
                    ],
                };
            }
            case "list_objects": {
                const { bucketName, prefix = "", recursive = true } = ListObjectsSchema.parse(args);
                const objects = [];
                const stream = minioClient.listObjects(bucketName, prefix, recursive);
                await new Promise((resolve, reject) => {
                    stream.on("data", (obj) => objects.push(obj));
                    stream.on("end", resolve);
                    stream.on("error", reject);
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(objects, null, 2),
                        },
                    ],
                };
            }
            case "upload_object": {
                const { bucketName, objectName, filePath, contentType } = UploadObjectSchema.parse(args);
                const metadata = contentType ? { "Content-Type": contentType } : undefined;
                await minioClient.fPutObject(bucketName, objectName, filePath, metadata);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Object '${objectName}' uploaded successfully to bucket '${bucketName}'`,
                        },
                    ],
                };
            }
            case "download_object": {
                const { bucketName, objectName, filePath } = DownloadObjectSchema.parse(args);
                await minioClient.fGetObject(bucketName, objectName, filePath);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Object '${objectName}' downloaded successfully from bucket '${bucketName}' to '${filePath}'`,
                        },
                    ],
                };
            }
            case "delete_object": {
                const { bucketName, objectName } = DeleteObjectSchema.parse(args);
                await minioClient.removeObject(bucketName, objectName);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Object '${objectName}' deleted successfully from bucket '${bucketName}'`,
                        },
                    ],
                };
            }
            case "get_object_info": {
                const { bucketName, objectName } = GetObjectInfoSchema.parse(args);
                const stat = await minioClient.statObject(bucketName, objectName);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(stat, null, 2),
                        },
                    ],
                };
            }
            case "generate_presigned_url": {
                const { bucketName, objectName, expiry = 604800, method = "GET" } = GeneratePresignedUrlSchema.parse(args);
                let url;
                if (method === "GET") {
                    url = await minioClient.presignedGetObject(bucketName, objectName, expiry);
                }
                else {
                    url = await minioClient.presignedPutObject(bucketName, objectName, expiry);
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: `Presigned URL (${method}): ${url}`,
                        },
                    ],
                };
            }
            case "copy_object": {
                const { sourceBucket, sourceObject, destBucket, destObject } = CopyObjectSchema.parse(args);
                const conds = new Minio.CopyConditions();
                await minioClient.copyObject(destBucket, destObject, `/${sourceBucket}/${sourceObject}`, conds);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Object copied from '${sourceBucket}/${sourceObject}' to '${destBucket}/${destObject}'`,
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${errorMessage}`,
                },
            ],
            isError: true,
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MinIO MCP server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
// Made with Bob
//# sourceMappingURL=index.js.map