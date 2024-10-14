"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var js_client_rest_1 = require("@qdrant/js-client-rest");
// Create a Qdrant client
var client = new js_client_rest_1.QdrantClient({ host: "localhost", port: 6333 });
client.createCollection("Cosine Search", {
    vectors: { size: 100, distance: "Cosine" },
});
